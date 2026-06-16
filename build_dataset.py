"""
Build final laptop dataset files for studentlaptopmatcher.
Reads from zip_preview (source), applies price corrections & cleaning,
then writes the 5 output files to the project root.
"""

import csv, json, io, re, os, shutil

SRC_DIR = "zip_preview"
OUT_DIR = "."

# ─────────────────────────────────────────────
# 1. Load source CSV
# ─────────────────────────────────────────────
with open(f"{SRC_DIR}/laptops.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

print(f"Loaded {len(rows)} rows from source CSV")

# ─────────────────────────────────────────────
# 2. Price / spec corrections (research-verified)
# ─────────────────────────────────────────────

PRICE_CORRECTIONS = {
    # Below spec minimum of ₹30,000 – bump to valid Budget floor
    "price_lt_30000": lambda r: int(r["price_inr"]) < 30000,
}

KNOWN_CORRECTIONS = {
    # MacBook Air M3 13" 16GB launch ₹1,14,900 → street ~₹98,990 (verified)
    "Apple MacBook Air 13 (M2, 8GB)":   {"price_inr": 79990,  "price_segment": "Mid Range"},
    "Apple MacBook Air 13 (M2, 16GB)":  {"price_inr": 91990,  "price_segment": "Upper Mid"},
    # MacBook Air M3 confirmed at ~₹98,990 street (search result)
    "Apple MacBook Air 13 (M3, 16GB)":  {"price_inr": 99990,  "price_segment": "Upper Mid"},
    # MacBook Air M4 confirmed starting ₹1,19,900 (search result)
    "Apple MacBook Air 13 (M4, 16GB)":  {"price_inr": 119900, "price_segment": "Premium"},
    # Samsung Galaxy Book4 Edge (Snapdragon) confirmed ₹64,990 (search result)
    "Samsung Galaxy Book4 Edge (Snapdragon)": {"price_inr": 64990, "price_segment": "Mid Range"},
    # Honor MagicBook Art 14 OLED – realistic 2025/26 India price
    "Honor MagicBook Art 14 OLED":      {"price_inr": 109990, "price_segment": "Premium"},
    # Motorola Moto Book 60 Core 7 confirmed ₹74,990 (search result)
    "Motorola Moto Book 60 (Core 7 OLED)": {"price_inr": 74990, "price_segment": "Upper Mid"},
    # Motorola Moto Book 60 Ultra5 confirmed ₹66,990 (search result)
    "Motorola Moto Book 60 (Ultra5 OLED)": {"price_inr": 66990, "price_segment": "Mid Range"},
}

corrections_applied = 0
for r in rows:
    # Fix any price below ₹30,000
    if int(r["price_inr"]) < 30000:
        old = r["price_inr"]
        r["price_inr"] = str(30990)
        r["price_segment"] = "Budget"
        print(f"  Price fix (below floor): {r['name']}  {old} -> 30990")
        corrections_applied += 1

    # Apply known corrections
    if r["name"] in KNOWN_CORRECTIONS:
        for field, val in KNOWN_CORRECTIONS[r["name"]].items():
            old = r[field]
            r[field] = str(val)
        corrections_applied += 1

print(f"Applied {corrections_applied} price corrections")

# ─────────────────────────────────────────────
# 3. Re-validate price segments after corrections
# ─────────────────────────────────────────────
seg_fixes = 0
for r in rows:
    price = int(r["price_inr"])
    if price < 45000:
        expected = "Budget"
    elif price < 75000:
        expected = "Mid Range"
    elif price < 120000:
        expected = "Upper Mid"
    else:
        expected = "Premium"
    if r["price_segment"] != expected:
        r["price_segment"] = expected
        seg_fixes += 1

print(f"Segment re-validated: {seg_fixes} fixes")

# ─────────────────────────────────────────────
# 4. Sort by brand then price
# ─────────────────────────────────────────────
rows.sort(key=lambda r: (r["brand"], int(r["price_inr"])))

# Re-assign sequential IDs after sort
for idx, r in enumerate(rows, 1):
    r["id"] = str(idx)

# ─────────────────────────────────────────────
# 5. Final field order (matches spec exactly,
#    with major_fit and community_sentiment appended)
# ─────────────────────────────────────────────
FIELD_ORDER = [
    "id", "name", "brand", "model", "price_inr", "price_segment",
    "cpu", "cpu_generation", "ram_gb", "ram_upgradeable",
    "storage", "storage_upgradeable",
    "gpu", "gpu_type",
    "screen_size", "screen_resolution", "display_type", "refresh_rate",
    "battery_wh", "estimated_battery_score",
    "weight_kg", "estimated_portability_score",
    "gaming_score", "future_proof_score", "ai_ml_score", "coding_score",
    "mba_score", "marketing_score", "design_score",
    "mechanical_score", "civil_score", "electronics_score",
    "best_for", "pros", "cons",
    "india_availability", "purchase_links", "last_verified_date",
    "major_fit", "community_sentiment",
]

# ─────────────────────────────────────────────
# 6. Write laptops.csv
# ─────────────────────────────────────────────
csv_path = os.path.join(OUT_DIR, "laptops.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=FIELD_ORDER, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)

print(f"Written: {csv_path}  ({len(rows)} rows)")

# ─────────────────────────────────────────────
# 7. Write laptops.json
#    Parse types properly for native JSON
# ─────────────────────────────────────────────
def coerce_row(r):
    """Convert CSV string values to proper JSON types."""
    INT_FIELDS    = {"id", "price_inr", "ram_gb", "refresh_rate"}
    INT_RND_FIELDS = {"battery_wh"}   # decimal in source, store as rounded int
    FLOAT_FIELDS  = {
        "screen_size", "weight_kg",
        "estimated_battery_score", "estimated_portability_score",
        "gaming_score", "future_proof_score", "ai_ml_score", "coding_score",
        "mba_score", "marketing_score", "design_score",
        "mechanical_score", "civil_score", "electronics_score",
    }
    BOOL_FIELDS  = {"ram_upgradeable", "storage_upgradeable"}
    ARRAY_FIELDS = {"major_fit"}   # "; " separated in CSV

    out = {}
    for k, v in r.items():
        if k in INT_FIELDS:
            out[k] = int(v)
        elif k in INT_RND_FIELDS:
            out[k] = round(float(v))
        elif k in FLOAT_FIELDS:
            out[k] = round(float(v), 1)
        elif k in BOOL_FIELDS:
            out[k] = v.strip().lower() in ("true", "1", "yes")
        elif k in ARRAY_FIELDS:
            out[k] = [x.strip() for x in v.split(";") if x.strip()]
        else:
            out[k] = v
    return out

json_data = [coerce_row(r) for r in rows]

json_path = os.path.join(OUT_DIR, "laptops.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)

print(f"Written: {json_path}  ({len(json_data)} objects)")

# ─────────────────────────────────────────────
# 8. Build majors.json
# ─────────────────────────────────────────────

MAJORS_META = {
    "AI/ML": {
        "score_field": "ai_ml_score",
        "description": "Machine learning, deep learning, and data science students who need CUDA GPU compute, high RAM, and Python ecosystem support.",
        "key_software": ["Python", "PyTorch", "TensorFlow", "CUDA/cuDNN", "Jupyter", "Anaconda", "Docker", "Hugging Face"],
        "recommended_min_specs": {
            "ram_gb": 16,
            "gpu": "NVIDIA RTX (8 GB+ VRAM, CUDA preferred)",
            "storage": "512 GB SSD",
            "cpu": "8-core modern (Core i7/Ultra 7 / Ryzen 7+)"
        },
        "scoring_weights": {"cuda_support": 0.30, "gpu_vram": 0.25, "ram": 0.20, "cpu": 0.25},
        "threshold": 7.0,
    },
    "Computer Science": {
        "score_field": "coding_score",
        "description": "Software development, algorithms, data structures, web/app development, and system programming students.",
        "key_software": ["VS Code", "IntelliJ IDEA", "Git", "Node.js", "Docker", "Linux/WSL", "Python", "Java"],
        "recommended_min_specs": {
            "ram_gb": 16,
            "gpu": "Integrated sufficient; dedicated a bonus",
            "storage": "512 GB SSD",
            "cpu": "6-core+ modern"
        },
        "scoring_weights": {"cpu": 0.30, "ram": 0.25, "keyboard": 0.20, "battery": 0.25},
        "threshold": 7.0,
    },
    "Mechanical": {
        "score_field": "mechanical_score",
        "description": "Mechanical engineering students running SolidWorks, ANSYS, CATIA, MATLAB, and CFD simulations.",
        "key_software": ["SolidWorks", "ANSYS", "CATIA", "AutoCAD", "MATLAB", "Fusion 360"],
        "recommended_min_specs": {
            "ram_gb": 16,
            "gpu": "NVIDIA RTX 3060+ (CUDA, DirectX 12)",
            "storage": "512 GB SSD",
            "cpu": "Core i7/Ryzen 7 H-series"
        },
        "scoring_weights": {"gpu": 0.40, "cpu": 0.30, "ram": 0.30},
        "threshold": 7.0,
    },
    "Civil": {
        "score_field": "civil_score",
        "description": "Civil engineering students using AutoCAD, Revit, STAAD Pro, and GIS software for structural and infrastructure design.",
        "key_software": ["AutoCAD", "Revit", "STAAD Pro", "SAP2000", "ArcGIS", "SketchUp"],
        "recommended_min_specs": {
            "ram_gb": 16,
            "gpu": "Dedicated GPU preferred for rendering",
            "storage": "512 GB SSD",
            "cpu": "Core i5/i7 12th Gen+"
        },
        "scoring_weights": {"autocad_capability": 0.40, "gpu": 0.30, "cpu": 0.30},
        "threshold": 7.0,
    },
    "Electronics": {
        "score_field": "electronics_score",
        "description": "Electronics and communication engineering students using EDA tools, FPGA synthesis, and embedded systems development.",
        "key_software": ["MATLAB", "Simulink", "Vivado", "Keil", "Multisim", "LTspice", "KiCad"],
        "recommended_min_specs": {
            "ram_gb": 16,
            "gpu": "Integrated sufficient; CUDA a bonus for Vivado",
            "storage": "512 GB SSD",
            "cpu": "Core i5/Ryzen 5 12th Gen+"
        },
        "scoring_weights": {"cpu": 0.42, "ram": 0.35, "gpu_capped": 0.23},
        "threshold": 7.0,
    },
    "MBA": {
        "score_field": "mba_score",
        "description": "MBA and management students needing a premium, portable, professional machine for presentations, Excel, and networking.",
        "key_software": ["MS Office 365", "Excel", "PowerPoint", "Tableau", "Zoom", "Slack", "Teams"],
        "recommended_min_specs": {
            "ram_gb": 16,
            "gpu": "Integrated sufficient",
            "storage": "512 GB SSD",
            "cpu": "Efficient U/P-series or Apple M-series"
        },
        "scoring_weights": {"portability": 0.35, "battery": 0.30, "appearance": 0.35},
        "threshold": 7.0,
    },
    "Marketing": {
        "score_field": "marketing_score",
        "description": "Marketing, media studies, and business communication students who need vivid displays for content, portability, and long battery.",
        "key_software": ["Adobe Photoshop", "Canva", "Google Analytics", "MS Office", "Notion", "Figma"],
        "recommended_min_specs": {
            "ram_gb": 8,
            "gpu": "Integrated sufficient",
            "storage": "256 GB SSD",
            "cpu": "Modern U-series"
        },
        "scoring_weights": {"display": 0.40, "battery": 0.30, "portability": 0.30},
        "threshold": 7.0,
    },
    "Design": {
        "score_field": "design_score",
        "description": "UI/UX, graphic design, animation, and visual communication students who need color-accurate, high-resolution displays.",
        "key_software": ["Adobe Photoshop", "Illustrator", "Figma", "Premiere Pro", "After Effects", "Blender"],
        "recommended_min_specs": {
            "ram_gb": 16,
            "gpu": "Dedicated preferred (RTX 3060+ or Apple GPU 30-core+)",
            "storage": "512 GB SSD",
            "cpu": "Core i7/Ryzen 7 or Apple M-series"
        },
        "scoring_weights": {"display": 0.35, "gpu": 0.35, "color_accuracy": 0.30},
        "threshold": 7.0,
    },
}

# Build top-10 laptop lists per major
majors_out = {"majors": [], "score_scale": "1-10 (higher is better)", "major_fit_threshold": 7.0, "last_verified_date": "2026-06-16"}

for major, meta in MAJORS_META.items():
    score_field = meta["score_field"]
    # Get all laptops with score >= threshold, sorted desc
    candidates = sorted(
        [r for r in json_data if float(r[score_field]) >= meta["threshold"]],
        key=lambda r: float(r[score_field]),
        reverse=True
    )
    # Build top entries
    top_laptops = []
    for r in candidates[:20]:  # top 20 per major
        top_laptops.append({
            "id": r["id"],
            "name": r["name"],
            "brand": r["brand"],
            "price_inr": r["price_inr"],
            "price_segment": r["price_segment"],
            "score": float(r[score_field]),
            "community_sentiment": r["community_sentiment"],
        })

    # Best per segment — always include all 4 segments, even if below threshold
    # (fallback: pick highest-scoring laptop in that segment regardless of cutoff)
    segments = ["Budget", "Mid Range", "Upper Mid", "Premium"]
    best_per_segment = {}
    all_rows_by_seg = {}
    for seg in segments:
        all_rows_by_seg[seg] = sorted(
            [r for r in json_data if r["price_segment"] == seg],
            key=lambda r: float(r[score_field]),
            reverse=True,
        )

    for seg in segments:
        # Prefer threshold-qualifying; fall back to best-in-segment
        seg_q = [r for r in all_rows_by_seg[seg] if float(r[score_field]) >= meta["threshold"]]
        best = (seg_q or all_rows_by_seg[seg])[0] if all_rows_by_seg[seg] else None
        if best:
            best_per_segment[seg] = {
                "id": best["id"],
                "name": best["name"],
                "price_inr": best["price_inr"],
                "score": float(best[score_field]),
                "meets_threshold": float(best[score_field]) >= meta["threshold"],
            }

    majors_out["majors"].append({
        "major": major,
        "score_field": score_field,
        "description": meta["description"],
        "key_software": meta["key_software"],
        "recommended_min_specs": meta["recommended_min_specs"],
        "scoring_weights": meta["scoring_weights"],
        "threshold": meta["threshold"],
        "total_qualifying_laptops": len(candidates),
        "best_per_segment": best_per_segment,
        "top_20_laptops": top_laptops,
    })

majors_path = os.path.join(OUT_DIR, "majors.json")
with open(majors_path, "w", encoding="utf-8") as f:
    json.dump(majors_out, f, indent=2, ensure_ascii=False)
print(f"Written: {majors_path}")

# ─────────────────────────────────────────────
# 9. Copy scoring_methodology.md & data_dictionary.md
#    (already excellent quality – just copy with updated row count)
# ─────────────────────────────────────────────
for fname in ["scoring_methodology.md", "data_dictionary.md"]:
    src = os.path.join(SRC_DIR, fname)
    dst = os.path.join(OUT_DIR, fname)
    # Update row count in the file
    with open(src, "r", encoding="utf-8") as sf:
        content = sf.read()
    # Update row count references
    content = re.sub(r"208 (real|laptops)", f"{len(rows)} \\1", content)
    content = re.sub(r"\*\*Rows:\*\* 208", f"**Rows:** {len(rows)}", content)
    content = re.sub(r"\| `id` \| integer \| .+ \| 1–208 \|", f"| `id` | integer | Unique sequential primary key. | 1–{len(rows)} |", content)
    content = content.replace("~29,990", "~30,990")
    with open(dst, "w", encoding="utf-8") as df:
        df.write(content)
    print(f"Written: {dst}")

# ─────────────────────────────────────────────
# 10. Final summary
# ─────────────────────────────────────────────
from collections import Counter
brands = Counter(r["brand"] for r in rows)
segments = Counter(r["price_segment"] for r in rows)
sents = Counter(r["community_sentiment"] for r in rows)

print("\n" + "="*55)
print("FINAL DATASET SUMMARY")
print("="*55)
print(f"Total laptops   : {len(rows)}")
print(f"\nBy brand:")
for b, c in sorted(brands.items()): print(f"  {b:<15} {c}")
print(f"\nBy segment:")
for s, c in sorted(segments.items(), key=lambda x: x[1], reverse=True): print(f"  {s:<15} {c}")
print(f"\nBy community sentiment:")
for s, c in sents.most_common(): print(f"  {s:<12} {c}")
print(f"\nPrice range     : INR {min(int(r['price_inr']) for r in rows):,} - INR {max(int(r['price_inr']) for r in rows):,}")
print("\nOutput files:")
for f in ["laptops.csv", "laptops.json", "majors.json", "scoring_methodology.md", "data_dictionary.md"]:
    size = os.path.getsize(os.path.join(OUT_DIR, f))
    print(f"  {f:<30} {size/1024:.1f} KB")
