"""
LaptopMatcher — Automated Price Updater
Runs via GitHub Actions every week.
Scrapes Amazon India + Flipkart for current prices and updates Supabase.
"""

import os, re, time, random
from urllib.parse import quote_plus
import requests
from bs4 import BeautifulSoup
from supabase import create_client
from datetime import date, datetime, timedelta

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
SCRAPERAPI_KEY = os.environ["SCRAPERAPI_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
TODAY = date.today().isoformat()

PRICE_SEGMENTS = [
    (45000,  "Budget"),
    (75000,  "Mid Range"),
    (120000, "Upper Mid"),
    (999999, "Premium"),
]


def scraper_get(url: str) -> requests.Response:
    """Fetch a URL through ScraperAPI (handles IP rotation + bot bypass)."""
    api_url = f"http://api.scraperapi.com?api_key={SCRAPERAPI_KEY}&url={quote_plus(url)}&country_code=in"
    return requests.get(api_url, timeout=60)


def get_price_segment(price: int) -> str:
    for limit, label in PRICE_SEGMENTS:
        if price <= limit:
            return label
    return "Premium"


def scrape_amazon(url: str) -> int | None:
    """Try to extract price from an Amazon India product page."""
    try:
        resp = scraper_get(url)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")

        # Try multiple known Amazon price selectors (they change layout occasionally)
        selectors = [
            "#priceblock_ourprice",
            "#priceblock_dealprice",
            ".a-price.aok-align-center .a-price-whole",
            "#apex_desktop .a-price-whole",
            "#corePriceDisplay_desktop_feature_div .a-price-whole",
            ".priceToPay .a-price-whole",
            "#price_inside_buybox",
            "#newBuyBoxPrice",
        ]
        for sel in selectors:
            el = soup.select_one(sel)
            if el:
                raw = re.sub(r"[^\d]", "", el.get_text())
                if raw:
                    return int(raw)
    except Exception as e:
        print(f"    Amazon error: {e}")
    return None


def scrape_flipkart(url: str) -> int | None:
    """Try to extract price from a Flipkart product page."""
    try:
        resp = scraper_get(url)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")

        selectors = [
            "._30jeq3",
            "._1vC4OE",
            ".Nx9bqj",
            "._16Jk6d",
        ]
        for sel in selectors:
            el = soup.select_one(sel)
            if el:
                raw = re.sub(r"[^\d]", "", el.get_text())
                if raw and len(raw) >= 4:
                    return int(raw)
    except Exception as e:
        print(f"    Flipkart error: {e}")
    return None


def parse_purchase_links(raw: str) -> dict[str, str]:
    """Parse 'Amazon: url|Flipkart: url' into a dict."""
    links = {}
    for part in raw.split("|"):
        part = part.strip()
        if ": " in part:
            label, url = part.split(": ", 1)
            links[label.strip().lower()] = url.strip()
    return links


def update_laptop(laptop: dict, new_price: int, source: str):
    old_price = laptop["price_inr"]
    segment = get_price_segment(new_price)
    change = new_price - old_price
    pct = (change / old_price) * 100

    supabase.table("laptops").update({
        "price_inr": new_price,
        "price_segment": segment,
        "last_verified_date": TODAY,
    }).eq("id", laptop["id"]).execute()

    direction = "↑" if change > 0 else "↓"
    print(f"  ✓ [{source}] ₹{old_price:,} → ₹{new_price:,} ({direction}{abs(pct):.1f}%)  {laptop['name']}")
    return {"id": laptop["id"], "name": laptop["name"], "old": old_price, "new": new_price, "source": source}


def main():
    print(f"\n=== LaptopMatcher Price Updater — {TODAY} ===\n")

    # Get laptops not verified in the last 25 days
    cutoff = (date.today() - timedelta(days=25)).isoformat()
    res = supabase.table("laptops") \
        .select("id, name, brand, price_inr, price_segment, purchase_links, last_verified_date") \
        .lt("last_verified_date", cutoff) \
        .order("last_verified_date") \
        .execute()

    laptops = res.data or []
    print(f"Found {len(laptops)} laptops needing price check (not verified in 25+ days)\n")

    if not laptops:
        print("All prices are up to date!")
        return

    updated, failed, unchanged = [], [], []

    for laptop in laptops:
        name = laptop["name"]
        links = parse_purchase_links(laptop.get("purchase_links") or "")
        print(f"Checking: {name}")

        new_price = None
        source = None

        # Try Amazon first
        if "amazon" in links:
            new_price = scrape_amazon(links["amazon"])
            if new_price:
                source = "Amazon"

        # Fall back to Flipkart
        if not new_price and "flipkart" in links:
            new_price = scrape_flipkart(links["flipkart"])
            if new_price:
                source = "Flipkart"

        if new_price and 15000 < new_price < 500000:
            if new_price != laptop["price_inr"]:
                result = update_laptop(laptop, new_price, source)
                updated.append(result)
            else:
                # Price unchanged — just update verified date
                supabase.table("laptops").update({
                    "last_verified_date": TODAY
                }).eq("id", laptop["id"]).execute()
                print(f"  = Price unchanged: ₹{new_price:,}")
                unchanged.append(laptop["name"])
        else:
            print(f"  ✗ Could not fetch price")
            failed.append(laptop["name"])

        # Polite delay to avoid rate limiting
        time.sleep(random.uniform(2.5, 5.0))

    # Summary
    print(f"\n{'='*50}")
    print(f"Updated:   {len(updated)}")
    print(f"Unchanged: {len(unchanged)}")
    print(f"Failed:    {len(failed)}")

    if updated:
        print("\nPrice changes:")
        for r in updated:
            change = r["new"] - r["old"]
            print(f"  {r['name']}: ₹{r['old']:,} → ₹{r['new']:,} ({'+' if change>0 else ''}{change:,})")

    if failed:
        print(f"\nCould not fetch ({len(failed)} laptops) — update these manually in /admin:")
        for name in failed:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
