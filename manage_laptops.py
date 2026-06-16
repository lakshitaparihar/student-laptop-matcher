"""
LaptopMatcher — Laptop Management Script
-----------------------------------------
Use this to keep prices updated and add/remove laptops from the database.

Setup:
  pip install supabase python-dotenv

Usage:
  python manage_laptops.py update-prices prices.csv
  python manage_laptops.py add-laptop new_laptop.csv
  python manage_laptops.py remove-laptop 42
  python manage_laptops.py stale                      # show laptops not updated in 30+ days
  python manage_laptops.py list                       # list all laptops with prices
"""

import sys
import csv
import os
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
TODAY = date.today().isoformat()


def update_prices(csv_file: str):
    """
    Update prices from a CSV file.

    CSV format (headers required):
        id, price_inr, price_segment, purchase_links, last_verified_date

    price_segment must be one of: Budget, Mid Range, Upper Mid, Premium
    purchase_links format:  Amazon: https://...|Flipkart: https://...
    last_verified_date: leave blank to use today

    Example row:
        1, 52999, Mid Range, Amazon: https://amzn.in/xxx|Flipkart: https://fkrt.it/yyy, 2026-06-16
    """
    if not os.path.exists(csv_file):
        print(f"ERROR: File not found — {csv_file}")
        return

    updated = 0
    errors = []

    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            laptop_id = row.get('id', '').strip()
            if not laptop_id:
                continue

            payload = {}
            if row.get('price_inr'):
                payload['price_inr'] = int(row['price_inr'].replace(',', '').strip())
            if row.get('price_segment'):
                payload['price_segment'] = row['price_segment'].strip()
            if row.get('purchase_links'):
                payload['purchase_links'] = row['purchase_links'].strip()

            payload['last_verified_date'] = row.get('last_verified_date', '').strip() or TODAY

            try:
                supabase.table('laptops').update(payload).eq('id', int(laptop_id)).execute()
                print(f"  ✓ Updated laptop #{laptop_id}  →  ₹{payload.get('price_inr', '(unchanged)')}")
                updated += 1
            except Exception as e:
                errors.append(f"  ✗ Laptop #{laptop_id}: {e}")

    print(f"\nDone. {updated} updated, {len(errors)} errors.")
    for err in errors:
        print(err)


def add_laptop(csv_file: str):
    """
    Add one or more new laptops from a CSV file.
    The CSV must have ALL required columns matching the laptops table schema.
    See laptops.csv for a reference row.
    """
    if not os.path.exists(csv_file):
        print(f"ERROR: File not found — {csv_file}")
        return

    added = 0
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            payload = {}
            for k, v in row.items():
                v = v.strip()
                if v.lower() in ('true', 'yes'):
                    payload[k] = True
                elif v.lower() in ('false', 'no'):
                    payload[k] = False
                else:
                    try:
                        payload[k] = int(v)
                    except ValueError:
                        try:
                            payload[k] = float(v)
                        except ValueError:
                            payload[k] = v

            payload.setdefault('last_verified_date', TODAY)

            try:
                res = supabase.table('laptops').insert(payload).execute()
                new_id = res.data[0]['id'] if res.data else '?'
                print(f"  ✓ Added: {payload.get('name', 'Unknown')}  (id={new_id})")
                added += 1
            except Exception as e:
                print(f"  ✗ Failed to add {payload.get('name', 'row')}: {e}")

    print(f"\nDone. {added} laptop(s) added.")


def remove_laptop(laptop_id: int):
    """Remove a laptop by its ID."""
    res = supabase.table('laptops').select('name').eq('id', laptop_id).single().execute()
    if not res.data:
        print(f"ERROR: No laptop found with id={laptop_id}")
        return

    name = res.data['name']
    confirm = input(f"Delete '{name}' (id={laptop_id})? Type YES to confirm: ")
    if confirm.strip().upper() != 'YES':
        print("Cancelled.")
        return

    supabase.table('laptops').delete().eq('id', laptop_id).execute()
    print(f"✓ Deleted: {name} (id={laptop_id})")


def show_stale(days: int = 30):
    """Show laptops whose price hasn't been verified in the last N days."""
    cutoff = (date.today() - timedelta(days=days)).isoformat()
    res = supabase.table('laptops') \
        .select('id, name, price_inr, price_segment, last_verified_date') \
        .lt('last_verified_date', cutoff) \
        .order('last_verified_date') \
        .execute()

    if not res.data:
        print(f"All prices verified within the last {days} days.")
        return

    print(f"\n{len(res.data)} laptops not updated in {days}+ days:\n")
    print(f"{'ID':<6} {'Last Verified':<15} {'Price':>10}  {'Segment':<12}  Name")
    print("-" * 80)
    for l in res.data:
        print(f"{l['id']:<6} {l['last_verified_date']:<15} ₹{l['price_inr']:>9,}  {l['price_segment']:<12}  {l['name']}")

    print(f"\nUpdate these in a CSV and run: python manage_laptops.py update-prices prices.csv")


def list_laptops():
    """List all laptops with their current prices."""
    res = supabase.table('laptops') \
        .select('id, name, brand, price_inr, price_segment, last_verified_date') \
        .order('price_inr') \
        .execute()

    if not res.data:
        print("No laptops found.")
        return

    print(f"\n{'ID':<6} {'Brand':<10} {'Price':>10}  {'Segment':<12}  {'Verified':<12}  Name")
    print("-" * 90)
    for l in res.data:
        print(f"{l['id']:<6} {l['brand']:<10} ₹{l['price_inr']:>9,}  {l['price_segment']:<12}  {l['last_verified_date']:<12}  {l['name']}")

    print(f"\nTotal: {len(res.data)} laptops")


# ── CLI entry point ──────────────────────────────────────────────────────────

if __name__ == '__main__':
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        sys.exit(0)

    cmd = args[0].lower()

    if cmd == 'update-prices':
        if len(args) < 2:
            print("Usage: python manage_laptops.py update-prices <file.csv>")
        else:
            update_prices(args[1])

    elif cmd == 'add-laptop':
        if len(args) < 2:
            print("Usage: python manage_laptops.py add-laptop <file.csv>")
        else:
            add_laptop(args[1])

    elif cmd == 'remove-laptop':
        if len(args) < 2:
            print("Usage: python manage_laptops.py remove-laptop <id>")
        else:
            remove_laptop(int(args[1]))

    elif cmd == 'stale':
        days = int(args[1]) if len(args) > 1 else 30
        show_stale(days)

    elif cmd == 'list':
        list_laptops()

    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
