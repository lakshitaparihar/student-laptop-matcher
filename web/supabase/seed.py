"""
Generate seed.sql from ../laptops.json
Run from web/ directory:  python supabase/seed.py
Then paste the output SQL into the Supabase SQL Editor.
"""

import json
import sys
import os

SRC = os.path.join(os.path.dirname(__file__), '..', '..', 'laptops.json')

with open(SRC, encoding='utf-8') as f:
    laptops = json.load(f)

OUT = os.path.join(os.path.dirname(__file__), 'seed.sql')

FIELDS = [
    'id', 'name', 'brand', 'model', 'price_inr', 'price_segment',
    'cpu', 'cpu_generation', 'ram_gb', 'ram_upgradeable',
    'storage', 'storage_upgradeable', 'gpu', 'gpu_type',
    'screen_size', 'screen_resolution', 'display_type', 'refresh_rate',
    'battery_wh', 'estimated_battery_score', 'weight_kg',
    'estimated_portability_score', 'gaming_score', 'future_proof_score',
    'ai_ml_score', 'coding_score', 'mba_score', 'marketing_score',
    'design_score', 'mechanical_score', 'civil_score', 'electronics_score',
    'major_fit', 'best_for', 'pros', 'cons', 'community_sentiment',
    'india_availability', 'purchase_links', 'last_verified_date',
]

def pg_val(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        escaped = [s.replace("'", "''") for s in v]
        inner = ','.join(f"'{e}'" for e in escaped)
        return f"ARRAY[{inner}]::text[]"
    s = str(v).replace("'", "''")
    return f"'{s}'"

lines = ['-- Auto-generated seed — run after 001_create_laptops.sql']
lines.append(f'-- {len(laptops)} rows')
lines.append('')
lines.append('truncate public.laptops restart identity;')
lines.append('')

cols = ', '.join(FIELDS)
lines.append(f'insert into public.laptops ({cols}) values')

rows = []
for lap in laptops:
    vals = ', '.join(pg_val(lap.get(f)) for f in FIELDS)
    rows.append(f'  ({vals})')

lines.append(',\n'.join(rows) + ';')

sql = '\n'.join(lines)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(sql)

print(f'Written {len(laptops)} rows to {OUT}')
print(f'File size: {os.path.getsize(OUT) / 1024:.1f} KB')
print('Next: paste supabase/seed.sql into Supabase SQL Editor and run it.')
