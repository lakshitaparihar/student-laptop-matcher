# Scoring Methodology

**Dataset:** Laptop recommendations for Indian college students (2025–2026)
**Laptops:** 208 real, India-available models across 10 brands and 4 price segments
**Score scale:** every score is 1–10 (higher is better), rounded to 1 decimal
**Last verified:** 2026-06-15

---

## 1. Philosophy

Every score in this dataset is **derived deterministically** from a laptop's real specifications using a single transparent engine, rather than being hand-assigned. This guarantees internal consistency: two laptops with identical specs always receive identical scores, and the relative ordering between machines is defensible and reproducible. The catalog holds the verifiable facts (CPU, GPU, RAM, panel, battery, weight, upgradeability, line/segment); the engine converts those facts into the 1–10 suitability scores used by a recommendation engine.

Prices are realistic mid-2026 Indian street/MRP approximations and should be re-verified against live listings before production use. All other fields are structural and stable.

---

## 2. Building blocks (shared sub-scores)

These intermediate 1–10 components feed the major-specific scores.

**CPU score** — ranks the processor family/tier (Apple M-series, Intel Core Ultra Series 1/2, Intel 12th–14th gen, AMD Ryzen 7035/7040/8040/AI 300/200, Snapdragon X) by real-world student-workload performance.

**GPU score** — ranks graphics from integrated (UHD, Iris Xe, Radeon 600M–880M, Arc, Adreno) through dedicated NVIDIA RTX 2050/3050 up to RTX 5080/5090, plus Apple GPU cores. NVIDIA dedicated cards sit at the top for compute/CAD relevance.

**GPU VRAM** — extracted per model; central to the AI/ML score.

**Display quality** — combines panel type (OLED > IPS > TN-class), resolution (4K/3.2K/2.8K/2.5K/QHD+/WUXGA/FHD), and refresh rate.

**Color accuracy** — rewards OLED and calibrated creator/premium panels; central to the Design score.

**Battery score** — uses a battery-efficiency model (see §4) rather than raw Wh, because efficiency varies enormously between an ARM/Lunar Lake ultrabook and an HX gaming chip.

**Portability score** — `0.x` blend of weight and battery score; heavy gaming laptops score low even with big batteries.

**Keyboard / appearance / cooling / reputation** — drawn from a line-trait table (e.g. ThinkPad and MacBook keyboards score highest; gaming chassis score highest on cooling but low on professional appearance).

**RAM component** — non-linear: 8 GB is penalised, 16 GB is the modern baseline, 32 GB+ rewarded.

---

## 3. Major / use-case score formulas

All inputs are 1–10 sub-scores; weights sum to 1.0 unless a cap applies.

| Score | Formula (weights) | Caps |
|---|---|---|
| **AI/ML** | 0.30·CUDA + 0.25·VRAM + 0.20·RAM + 0.25·CPU | Non-NVIDIA, non-Apple capped low (no CUDA). Apple gets partial CUDA-equivalent credit. |
| **Coding (CS)** | 0.30·CPU + 0.25·RAM + 0.20·Keyboard + 0.25·Battery | — |
| **MBA** | 0.35·Portability + 0.30·Battery + 0.35·Appearance | — |
| **Marketing** | 0.40·Display + 0.30·Battery + 0.30·Portability | — |
| **Design** | 0.35·Display + 0.35·GPU + 0.30·Color accuracy | — |
| **Mechanical** | 0.40·GPU + 0.30·CPU + 0.30·RAM | Apple ≤ 6.2; non-NVIDIA Windows ≤ 6.0 |
| **Civil** | 0.40·AutoCAD-capability + 0.30·GPU + 0.30·CPU | Apple ≤ 6.0 |
| **Electronics** | 0.42·CPU + 0.35·RAM + 0.23·GPU(capped) | Apple ≤ 6.4 |
| **Gaming** | 0.55·GPU + 0.25·Refresh + 0.20·Cooling | Apple ≤ 5.2; non-NVIDIA ≤ 4.8 |
| **Future-proof** | 0.25·RAM + 0.20·Upgradeability + 0.30·CPU-generation + 0.25·GPU-generation | — |

Where **AutoCAD-capability** = 0.5·CPU + 0.3·RAM + 0.2·min(GPU, 8), reflecting that AutoCAD favours CPU/RAM over raw GPU.

### Composite scores (used only for major_fit, not stored as columns)

| Composite | Formula |
|---|---|
| **Medical** | 0.45·Coding + 0.30·Portability + 0.25·Battery |
| **Finance** | 0.55·MBA + 0.45·Coding |
| **Humanities** | 0.40·MBA + 0.35·Marketing + 0.25·Battery |

---

## 4. Battery efficiency model

Battery suitability is **not** raw watt-hours. The engine estimates real endurance as `battery_Wh ÷ platform_draw`, where platform draw is keyed to the CPU/GPU class and chassis line:

- ARM (Snapdragon X) and Intel Lunar Lake (Core Ultra 2xxV) and Apple M-series draw the least → highest battery scores even at modest Wh.
- H/HS and HX gaming chips with dedicated GPUs draw the most → a 90 Wh gaming battery can still score lower than a 60 Wh ultrabook.

This is why a MacBook Air (M-series) or a Lunar Lake ultrabook out-scores a large-battery gaming laptop on the battery and portability axes.

---

## 5. Apple / CUDA modelling rationale

Apple silicon cannot run CUDA, which is the de-facto standard for AI/ML and for most engineering CAD/CAE/EDA suites (SolidWorks, ANSYS, Vivado, Civil 3D, etc.), several of which are Windows-only.

- **AI/ML:** Apple receives *partial* credit — unified memory + MPS acceleration support meaningful local ML — but is held below true NVIDIA/CUDA machines.
- **Mechanical / Civil / Electronics:** Apple is capped (6.2 / 6.0 / 6.4) because the flagship software is Windows-only or runs poorly under translation.
- **Gaming:** capped at 5.2 due to a limited native game library.

This keeps recommendations honest: MacBooks rank at the top for CS, MBA, Marketing, Design, Medical, Finance, and Humanities, but are not over-credited for CUDA-bound or Windows-bound engineering work.

---

## 6. Derived fields

- **price_segment** — Budget < ₹45k ≤ Mid Range < ₹75k ≤ Upper Mid < ₹120k ≤ Premium.
- **major_fit** — a laptop joins a major's list when its mapped score (or composite) ≥ **7.0**. Every laptop is guaranteed at least one entry (Humanities is the fallback).
- **best_for** — the top 2–3 use cases by score (≥ 6.5), in plain language.
- **community_sentiment** — `overall + 0.6·line_reputation + value_ratio`, bucketed into Excellent / Good / Average / Poor. `overall` blends a laptop's single best strength with its general competence; `value_ratio` compares delivered capability against what its price typically buys, so over-priced machines drop and value champions rise.
- **gpu_type** — Dedicated (NVIDIA RTX / workstation) vs Integrated.
- **purchase_links** — valid Amazon.in and Flipkart **search** URLs built from a normalised brand+model slug (not fabricated product-page IDs).

---

## 7. Caveats

1. **Prices** are representative mid-2026 estimates; verify against live Amazon India / Flipkart / Reliance Digital / Croma listings before production.
2. **Variant SKUs** (different RAM/GPU/CPU of the same line) are intentionally kept as distinct rows, not treated as duplicates.
3. **Motorola and Honor** are genuinely sold in India but have thinner service networks; this is noted in `india_availability`.
4. Scores are **suitability heuristics**, not benchmarks. They rank fitness-for-major, not absolute performance.
