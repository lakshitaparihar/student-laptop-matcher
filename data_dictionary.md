# Data Dictionary

**Files:** `laptops.csv`, `laptops.json`
**Rows:** 208 laptops
**Last verified:** 2026-06-15
**Intended target:** direct import into Supabase / Postgres; consumable by a recommendation engine with no further cleaning.

## Format notes (CSV vs JSON)

- **JSON** keeps native types: `major_fit` is an array of strings; `ram_upgradeable` and `storage_upgradeable` are booleans; numeric fields are numbers.
- **CSV** flattens for portability: `major_fit` is a single string with `; ` separators; the two `*_upgradeable` fields are the lowercase text `true` / `false`; numbers are unquoted.
- All scores are floats on a **1.0–10.0** scale, rounded to 1 decimal.

---

## Fields

| Field | Type | Description | Allowed values / range |
|---|---|---|---|
| `id` | integer | Unique sequential primary key. | 1–208 |
| `name` | string | Full display name (`brand` + `model`). | e.g. "Apple MacBook Air 13 (M4, 16GB)" |
| `brand` | string | Manufacturer. | ASUS, Lenovo, HP, Dell, Acer, Apple, MSI, Samsung, Motorola, Honor |
| `model` | string | Model/variant name including config in parentheses. | free text |
| `price_inr` | integer | Indicative street/MRP price in ₹ (mid-2026 estimate). | ~30,990 – 359,990 |
| `price_segment` | string | Price band. | Budget, Mid Range, Upper Mid, Premium |
| `cpu` | string | Processor full name. | free text |
| `cpu_generation` | string | CPU generation/family label. | e.g. "Core Ultra Series 2", "14th Gen", "Ryzen AI 300", "Snapdragon X", "Apple M-series" labels |
| `ram_gb` | integer | Installed RAM in GB. | 8, 16, 24, 32 |
| `ram_upgradeable` | boolean | Whether RAM can be upgraded (not soldered). | true / false |
| `storage` | string | Installed storage. | e.g. "512 GB SSD", "1 TB SSD" |
| `storage_upgradeable` | boolean | Whether storage can be upgraded/added. | true / false |
| `gpu` | string | Graphics processor full name. | free text |
| `gpu_type` | string | Graphics class. | Dedicated, Integrated |
| `screen_size` | float | Display diagonal in inches. | 13.0 – 18.0 |
| `screen_resolution` | string | Native resolution + marketing label. | e.g. "2880x1800 2.8K", "1920x1080 FHD" |
| `display_type` | string | Panel technology (with touch/convertible note where relevant). | e.g. "OLED", "IPS", "OLED (Touch)", "IPS (Touch)" |
| `refresh_rate` | integer | Max refresh rate in Hz. | 60 – 240 |
| `battery_wh` | integer | Battery capacity in watt-hours. | ~39 – 99 |
| `estimated_battery_score` | float | Modelled real-world endurance (efficiency-adjusted, not raw Wh). | 1.0 – 10.0 |
| `weight_kg` | float | Weight in kilograms. | ~1.0 – 3.9 |
| `estimated_portability_score` | float | Weight + battery blend. | 1.0 – 10.0 |
| `gaming_score` | float | Gaming suitability (GPU, refresh, cooling). | 1.0 – 10.0 |
| `future_proof_score` | float | Longevity (RAM, upgradeability, CPU & GPU generation). | 1.0 – 10.0 |
| `ai_ml_score` | float | AI/ML suitability (CUDA, VRAM, RAM, CPU). | 1.0 – 10.0 |
| `coding_score` | float | Programming suitability (CPU, RAM, keyboard, battery). | 1.0 – 10.0 |
| `mba_score` | float | MBA/business suitability (portability, battery, appearance). | 1.0 – 10.0 |
| `marketing_score` | float | Marketing/media suitability (display, battery, portability). | 1.0 – 10.0 |
| `design_score` | float | Design/creative suitability (display, GPU, color). | 1.0 – 10.0 |
| `mechanical_score` | float | Mechanical-eng suitability (GPU, CPU, RAM; CAD/CAE). | 1.0 – 10.0 |
| `civil_score` | float | Civil-eng suitability (AutoCAD capability, GPU, CPU). | 1.0 – 10.0 |
| `electronics_score` | float | Electronics suitability (CPU, RAM, modest GPU). | 1.0 – 10.0 |
| `major_fit` | array&lt;string&gt; (JSON) / `; `-joined string (CSV) | Majors the laptop is a strong fit for (mapped score ≥ 7.0; every row has ≥ 1). | AI/ML, Computer Science, Mechanical, Civil, Electronics, MBA, Marketing, Design, Medical, Finance, Humanities |
| `best_for` | string | Top 2–3 use cases in plain language. | free text |
| `pros` | string | Key strengths (`; `-separated phrases). | free text |
| `cons` | string | Key weaknesses (`; `-separated phrases). | free text |
| `community_sentiment` | string | Overall reception heuristic (capability + reputation + value). | Excellent, Good, Average, Poor |
| `india_availability` | string | Availability status; flags thin service networks. | e.g. "Widely Available", "Available (online-first; thinner service network)" |
| `purchase_links` | string | Amazon.in and Flipkart **search** URLs for the model. | "Amazon: &lt;url&gt; \| Flipkart: &lt;url&gt;" |
| `last_verified_date` | string (ISO date) | Date specs/pricing snapshot was assembled. | 2026-06-15 |

---

## Suggested Postgres / Supabase types

```sql
create table laptops (
  id                            integer primary key,
  name                          text not null,
  brand                         text not null,
  model                         text not null,
  price_inr                     integer not null,
  price_segment                 text not null,
  cpu                           text not null,
  cpu_generation                text,
  ram_gb                        smallint not null,
  ram_upgradeable               boolean not null,
  storage                       text not null,
  storage_upgradeable           boolean not null,
  gpu                           text not null,
  gpu_type                      text not null,
  screen_size                   numeric(3,1) not null,
  screen_resolution             text not null,
  display_type                  text not null,
  refresh_rate                  smallint not null,
  battery_wh                    smallint not null,
  estimated_battery_score       numeric(3,1) not null,
  weight_kg                     numeric(3,2) not null,
  estimated_portability_score   numeric(3,1) not null,
  gaming_score                  numeric(3,1) not null,
  future_proof_score            numeric(3,1) not null,
  ai_ml_score                   numeric(3,1) not null,
  coding_score                  numeric(3,1) not null,
  mba_score                     numeric(3,1) not null,
  marketing_score               numeric(3,1) not null,
  design_score                  numeric(3,1) not null,
  mechanical_score              numeric(3,1) not null,
  civil_score                   numeric(3,1) not null,
  electronics_score             numeric(3,1) not null,
  major_fit                     text[] not null,   -- JSON array; in CSV split on '; '
  best_for                      text,
  pros                          text,
  cons                          text,
  community_sentiment           text not null,
  india_availability            text not null,
  purchase_links                text,
  last_verified_date            date not null
);
```

> For CSV import, load `major_fit` as `text` then convert with `string_to_array(major_fit, '; ')`, or import `laptops.json` directly where it is already a native array.
