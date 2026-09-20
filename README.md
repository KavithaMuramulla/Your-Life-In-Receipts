# Your Life, In Receipts

A frontend-only interactive experience that reconstructs a stranger's four years from nothing but timestamps — 46,339 songs played and 2,461 transactions — and turns them into chapters, scenes and habits.

**Live:** open `dist/standalone.html` (single file, no server) or `index.html` via any static host.

---

## The premise

The brief asks for `Raw Data → Insights → Connections → Story`. The shipped data was not a tidy receipt feed — it was three real-world dumps:

| File | What it actually is |
|---|---|
| `spotify_history.csv` | 149,860 real plays, 2013–2024 |
| `Daily Household Transactions.csv` | 2,461 ledger entries, 2015–2018 |
| `Augmented_IndiaTransactMultiFacet2024.csv` | 10k synthetic fraud-detection rows |

So the first design decision was archaeological: find the window where two of these describe **the same life** (Jan 2015 – Sep 2018), and derive receipts from it. The third set was deliberately excluded — its geography is randomised and its identities are synthetic, so any "places map" built on it would be decoration pretending to be insight. That omission is stated in the product footer.

Result: **4,359 receipts across 13 types** — music sessions, food, travel, home, subscriptions, health, apparel, money, income, people, learning, events, notes.

## Four ways in

**1 · Chapters** — the span is cut into eight six-month eras. Each era's title and paragraph are *generated* from its own statistics: signature artists by listening hours, count of never-before-heard artists, spend mix, share of plays after midnight. Rule-based, not hand-written — re-run the builder on new data and the chapters rewrite themselves.

**2 · The Constellation** — the relationship-discovery mechanism, in two modes.

- *Scene view.* Every day is scored on type-diversity, receipt count, late-night activity and spend; the top 40 become scenes. A scene renders radially — **angle = hour of day, radius = layer, size = intensity** — and draws an edge between any two receipts of *different* types within three hours of each other. That is where a ₹30 train ticket and a 2 AM record stop being separate rows and become the same Tuesday.
- *Type web.* Aggregates all 1,360 days into a co-occurrence graph. Edge weight = how often two categories land on the same date, so the thick strands are real behavioural couplings (travel↔food, music↔everything) rather than assertions.

**3 · Patterns** — the 24-hour clock overlays listening against spending and shows they barely intersect: the spender is a daytime creature, the listener isn't. Plus the rituals bought 160+ times, a 1,360-day heatmap (teal = music, amber = money, violet = both, grey = a silent day), and the artists that survived all eleven years.

**4 · Archive** — full-text search over name, subcategory, album, date and payment mode, with type filters and live aggregates (count, date range, total spent, hours played). It parses `2 am` as an hour query, not a string.

### Everything cross-links
Click a heatmap square → that day's constellation. Click an archive row → its scene. Click an artist → the archive filtered to them. Click a chapter → its top scenes. There is no dead end.

## UI/UX decisions worth defending

- **Editorial, not dashboard.** Fraunces display + JetBrains Mono data + Inter body. The mono face carries every number, so the eye learns instantly what is data and what is prose.
- **Colour is a schema.** Each receipt type owns one hue, used consistently in nodes, chips, heatmap, left-border of archive rows and era bars. Learn it once in Chapters, read it everywhere.
- **Progressive disclosure.** Five acts behind tabs instead of one infinite scroll — the story has an order, but the visitor keeps control.
- **Honest emptiness.** A day with no data says *"nothing recorded. A silent day."* Absence is part of the portrait.
- **Responsive.** Fluid `clamp()` type, grids that collapse at 880px/620px, the sticky stage unsticks on mobile, wide visuals scroll inside their own container so the page body never pans sideways, and `env(safe-area-inset-*)` keeps content clear of phone system bars.
- **Accessible.** Skip link, visible `:focus-visible` rings, labelled search and SVG, `prefers-reduced-motion` honoured, hover interactions all duplicated on tap.

## Structure

```
index.html              markup + copy
assets/css/app.css      design tokens, layout, responsive rules
assets/js/app.js        views, scoring, SVG graph rendering, search
data/receipts.js        derived dataset (4,359 receipts + precomputed indices)
scripts/build_data.py   the derivation: raw CSVs → receipts.js
dist/standalone.html    everything inlined, one file, works from file://
```

## Rebuilding the data

```bash
pip install pandas numpy
python scripts/build_data.py        # expects the three CSVs in ../data/
```

The script sessionises listening (a 45-minute gap starts a new session, each session keeps its dominant track), maps ledger categories to receipt types, scores scenes, derives eras and precomputes the day index, hour histograms, rituals and artist arcs — so the browser ships zero heavy computation.

## Stack

Zero dependencies, zero build step, zero network calls. Vanilla HTML/CSS/JS with hand-authored SVG. Google Fonts is the only external request, with a full fallback stack. Python + pandas used offline for the derivation only.
