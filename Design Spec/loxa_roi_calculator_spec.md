# Loxa ROI Calculator - Product Spec

Technical specification for the Loxa ROI calculator. This document is the single source of truth for all variable definitions, formulas, dependencies, formatting rules, and validation test cases. Intended as context for implementation in any environment (web app, API, spreadsheet, Clay).

---

## 1. What the calculator does

Estimates the total annual value Loxa delivers to a UK e-commerce retailer across four revenue streams:

1. **Insurance** - direct income from protection premiums sold at checkout
2. **Conversion uplift** - additional product sales from the confidence effect of offering protection
3. **Reduced returns** - savings from fewer returns on insured products
4. **Claims replacements** - margin earned on replacement products fulfilled under claims

Each stream produces a revenue figure and a profit figure. The four profits sum to Total Additional Profit, which is the headline number on the prospect-facing pitch deck.

---

## 2. Constants

Two UK tax rates are baked into the formulas. These are not editable inputs.

| Constant | Value | Divisor | Purpose |
|---|---|---|---|
| IPT (Insurance Premium Tax) | 12% | 1.12 | Stripped from insurance revenue before calculating retailer margin. UK-specific tax on insurance premiums. |
| VAT (Value Added Tax) | 20% | 1.20 | Stripped from product revenue (conversion, returns, claims) before applying margins. VAT is collected but passed through to HMRC. |

---

## 3. Inputs

10 editable assumptions. The sales team sets these per prospect, typically starting from category defaults and overriding where they have better data.

| # | Variable name | Display name | Type | Unit | Storage format | Constraints | Description |
|---|---|---|---|---|---|---|---|
| 1 | `insurable_revenue` | Total Insurable Revenue | currency | GBP | integer (pence-safe, no decimals needed) | > 0 | The prospect's annual revenue from physical products eligible for Loxa protection. This is the key input the sales team must estimate or research. |
| 2 | `insurance_rate` | Insurance Pricing % | percentage | % | decimal (e.g. 0.08 = 8%) | 0 < x < 1 | Premium charged as a percentage of the insured product's price. |
| 3 | `takeup_rate` | Take-up Rate | percentage | % | decimal (e.g. 0.30 = 30%) | 0 < x < 1 | Proportion of eligible customers who opt into protection at checkout. |
| 4 | `avg_insured_value` | Avg Insured Value | currency | GBP | integer or float | > 0 | Average retail price of products that get insured. Used to calculate claim counts. |
| 5 | `product_margin` | Avg Product Margin | percentage | % | decimal (e.g. 0.50 = 50%) | 0 < x < 1 | Retailer's standard gross margin on products. Applied to conversion uplift and return savings. |
| 6 | `claims_margin` | Claims Replacement Margin | percentage | % | decimal (e.g. 0.375 = 37.5%) | 0 < x < 1 | Margin on replacement products fulfilled under claims. Deliberately lower than standard product margin (cost-price or discounted fulfilment). |
| 7 | `insurance_margin` | Insurance Margin | percentage | % | decimal (e.g. 0.30 = 30%) | 0 < x < 1 | Retailer's share of the net premium after IPT. The remaining portion covers underwriting, Loxa's commission, and claims reserves. |
| 8 | `replacement_rate` | Replacement Rate | percentage | % | decimal (e.g. 0.015 = 1.5%) | 0 < x < 1 | Proportion of insured items that result in a replacement claim. |
| 9 | `conversion_increase` | Conversion Increase | percentage | % | decimal (e.g. 0.015 = 1.5%) | 0 < x < 1 | Uplift in conversion rate from offering protection at checkout. Applied to total insurable revenue. |
| 10 | `return_decrease` | Return Decrease | percentage | % | decimal (e.g. 0.05 = 5%) | 0 < x < 1 | Reduction in return rate on insured products. Only applies to products where protection was purchased (scoped to take-up rate). |

---

## 4. Intermediate calculations

These are computed values used by downstream formulas but not all are displayed directly.

| Variable name | Formula | Depends on | Description |
|---|---|---|---|
| `insured_product_value` | `insurable_revenue * takeup_rate` | insurable_revenue, takeup_rate | Total value of products covered by insurance. Scoping factor for insurance, returns, and claims streams. |
| `conversion_revenue` | `insurable_revenue * conversion_increase` | insurable_revenue, conversion_increase | Additional product revenue from conversion uplift. Applied to full insurable revenue (not just insured portion). |
| `returns_revenue` | `insured_product_value * return_decrease` | insured_product_value, return_decrease | Revenue saved from fewer returns. Scoped to insured products only. |
| `num_replacement_claims` | `insured_product_value / avg_insured_value * replacement_rate` | insured_product_value, avg_insured_value, replacement_rate | Count of replacement claims. Integer in reality, but keep as float for calculation accuracy; round only for display. |
| `claims_revenue` | `num_replacement_claims * avg_insured_value` | num_replacement_claims, avg_insured_value | Revenue from replacement fulfilment. |

---

## 5. Output formulas

### Stream 1: Insurance

| Variable name | Formula | Depends on |
|---|---|---|
| `insurance_revenue` | `insured_product_value * insurance_rate` | insured_product_value, insurance_rate |
| `insurance_profit` | `insurance_revenue / 1.12 * insurance_margin` | insurance_revenue, insurance_margin |

Key detail: IPT (12%) is stripped before applying margin. This is the only stream that uses the 1.12 divisor. All other streams use the 1.20 VAT divisor.

### Stream 2: Conversion uplift

| Variable name | Formula | Depends on |
|---|---|---|
| `conversion_revenue` | `insurable_revenue * conversion_increase` | insurable_revenue, conversion_increase |
| `conversion_profit` | `conversion_revenue / 1.20 * product_margin` | conversion_revenue, product_margin |

Key detail: Conversion applies to total insurable revenue (not just the insured portion), because the confidence effect of offering protection benefits all shoppers, not just those who buy it.

### Stream 3: Reduced returns

| Variable name | Formula | Depends on |
|---|---|---|
| `returns_revenue` | `insured_product_value * return_decrease` | insured_product_value, return_decrease |
| `returns_profit` | `returns_revenue / 1.20 * product_margin` | returns_revenue, product_margin |

Key detail: Returns reduction only applies to insured products (scoped to take-up rate via `insured_product_value`), because only customers with protection have reduced return incentive.

### Stream 4: Claims replacements

| Variable name | Formula | Depends on |
|---|---|---|
| `num_replacement_claims` | `insured_product_value / avg_insured_value * replacement_rate` | insured_product_value, avg_insured_value, replacement_rate |
| `claims_revenue` | `num_replacement_claims * avg_insured_value` | num_replacement_claims, avg_insured_value |
| `claims_profit` | `claims_revenue / 1.20 * claims_margin` | claims_revenue, claims_margin |

Key detail: Uses `claims_margin` (typically 37.5%), not `product_margin` (typically 50%), reflecting that replacements are fulfilled at cost or near-cost.

### Totals

| Variable name | Formula | Depends on |
|---|---|---|
| `total_additional_revenue` | `insurance_revenue + conversion_revenue + returns_revenue + claims_revenue` | All four revenue values |
| `total_additional_profit` | `insurance_profit + conversion_profit + returns_profit + claims_profit` | All four profit values |

---

## 6. Dependency graph

```
INPUTS
  insurable_revenue ──┬──────────────────────────────── conversion_revenue ── conversion_profit
                      │                                          ▲                    ▲
                      │                               conversion_increase        product_margin
                      │
                      ├── (* takeup_rate) ── insured_product_value ──┬── (* insurance_rate) ── insurance_revenue ── insurance_profit
                      │                                               │                                                    ▲
                      │                                               │                                           insurance_margin
                      │                                               │
                      │                                               ├── (* return_decrease) ── returns_revenue ── returns_profit
                      │                                               │                                                  ▲
                      │                                               │                                           product_margin
                      │                                               │
                      │                                               └── (/ avg_insured_value * replacement_rate)
                      │                                                         │
                      │                                                    num_replacement_claims
                      │                                                         │
                      │                                                    (* avg_insured_value)
                      │                                                         │
                      │                                                    claims_revenue ── claims_profit
                      │                                                                          ▲
                      │                                                                    claims_margin
                      │
TOTALS
  total_additional_revenue  = insurance_revenue + conversion_revenue + returns_revenue + claims_revenue
  total_additional_profit   = insurance_profit + conversion_profit + returns_profit + claims_profit
```

### Evaluation order

Formulas must be evaluated in this order (each step depends only on prior steps and raw inputs):

1. `insured_product_value` = insurable_revenue * takeup_rate
2. `insurance_revenue` = insured_product_value * insurance_rate
3. `insurance_profit` = insurance_revenue / 1.12 * insurance_margin
4. `conversion_revenue` = insurable_revenue * conversion_increase
5. `conversion_profit` = conversion_revenue / 1.20 * product_margin
6. `returns_revenue` = insured_product_value * return_decrease
7. `returns_profit` = returns_revenue / 1.20 * product_margin
8. `num_replacement_claims` = insured_product_value / avg_insured_value * replacement_rate
9. `claims_revenue` = num_replacement_claims * avg_insured_value
10. `claims_profit` = claims_revenue / 1.20 * claims_margin
11. `total_additional_revenue` = insurance_revenue + conversion_revenue + returns_revenue + claims_revenue
12. `total_additional_profit` = insurance_profit + conversion_profit + returns_profit + claims_profit

Steps 2-3, 4-5, 6-7, and 8-10 are independent of each other (can be parallelised), but each group depends on step 1.

---

## 7. Display formatting

All monetary outputs are formatted as GBP for the prospect-facing deck. Two formatting modes:

### Full precision (ROI calculator, internal use)

- Currency: `£` prefix, comma-separated thousands, no decimals. Example: `£2,440,179`
- Percentages: displayed as whole numbers with `%` suffix. Example: `30%`
- Counts: comma-separated, no decimals. Example: `675`
- Use `toLocaleString("en-GB")` and `Math.round()` in JavaScript contexts.
- Null-safety pattern: `condition ? value : ""` (return empty string, not zero, if inputs are missing).

### Abbreviated (deck slides, headline figures)

Monetary values are shortened for slide readability:

| Range | Format | Example |
|---|---|---|
| < £1,000 | Full number | £675 |
| >= £1,000 and < £1,000,000 | Thousands with `k` suffix | £771k |
| >= £1,000,000 | Millions with one decimal + `m` suffix | £2.4m |

Rounding: round to nearest whole unit at the abbreviated scale. £2,440,179 becomes £2.4m. £771,429 becomes £771k.

---

## 8. Web app UI specification

Specification for the prospect-facing ROI calculator web app. Intended for hosting on a Loxa subdomain (e.g. `roi.loxacover.com`) and linked from pitch decks. A working prototype exists as `loxa_roi_calculator.jsx`.

### 8.1 Purpose and audience

The web app serves two audiences with different needs:

**Prospects** receive a pre-populated link after (or during) a sales conversation. They can adjust their own business numbers and see the impact on the ROI figures in real time. The tool reinforces the pitch by making the value proposition tangible and interactive.

**Sales team** uses the URL parameter system to generate custom links per prospect from Clay. The link arrives pre-loaded with the right company name, revenue figure, and category-specific assumptions. The rep does not need to touch the calculator before sending it.

### 8.2 Input classification

The 10 calculator inputs from Section 3 are split into two categories for the web app. This reflects who owns each number: the prospect knows their business; Loxa defines the protection economics.

**Editable (prospect controls via sliders):**

| Variable | Slider label | Min | Max | Step | Default | Rationale |
|---|---|---|---|---|---|---|
| `insurable_revenue` | Total Insurable Revenue | £500k | £500m | Dynamic (see 8.4) | £20m | Prospect knows their revenue better than Loxa's estimate |
| `avg_insured_value` | Avg Insured Product Value | £50 | £5,000 | £50 | £800 | Prospect knows their product price points |
| `product_margin` | Average Product Margin | 10% | 80% | 1% | 50% | Prospect knows their margin structure |
| `claims_margin` | Claims Replacement Margin | 10% | 60% | 0.5% | 37.5% | Prospect knows what margin they'd make fulfilling replacements |

**Fixed (Loxa-defined, displayed as contextual constants):**

| Variable | Display label | Shown alongside | Rationale |
|---|---|---|---|
| `insurance_rate` | Pricing | Insurance Premiums line item | Set by Loxa per category, not negotiable by prospect |
| `takeup_rate` | Take-up | Insurance Premiums line item | Actuarial assumption based on Loxa's portfolio data |
| `insurance_margin` | Retailer share | Insurance Premiums line item | Commercial term, set per deal |
| `conversion_increase` | Conversion increase | Conversion Uplift line item | Loxa benchmark, not prospect-adjustable |
| `return_decrease` | Return decrease | Reduced Returns line item | Loxa benchmark, not prospect-adjustable |
| `replacement_rate` | Replacement rate | Claims Replacements line item | Actuarial assumption, not prospect-adjustable |

All values (both editable and fixed) are set via URL parameters on page load. Fixed constants are read once from the URL and not editable in the UI.

### 8.3 URL parameter schema

All 10 inputs plus the company name are passed as query parameters. Percentage values are passed as display numbers (e.g. `8` for 8%, not `0.08`). The app divides by 100 internally.

| Parameter | Maps to | Format | Example |
|---|---|---|---|
| `company` | Company name (display only) | String | `Neptune` |
| `revenue` | `insurable_revenue` | Integer, GBP | `20000000` |
| `rate` | `insurance_rate` | Number, % | `8` |
| `takeup` | `takeup_rate` | Number, % | `30` |
| `aiv` | `avg_insured_value` | Number, GBP | `800` |
| `margin` | `product_margin` | Number, % | `50` |
| `claims_margin` | `claims_margin` | Number, % | `37.5` |
| `ins_margin` | `insurance_margin` | Number, % | `30` |
| `replacement` | `replacement_rate` | Number, % | `1.5` |
| `conversion` | `conversion_increase` | Number, % | `1.5` |
| `returns` | `return_decrease` | Number, % | `5` |

**Example full URL:**
`https://roi.loxacover.com?company=Neptune&revenue=20000000&rate=8&takeup=30&aiv=800&margin=50&claims_margin=37.5&ins_margin=30&replacement=1.5&conversion=1.5&returns=5`

If a parameter is missing, the app falls back to the default value shown in Section 8.2. A link with no parameters at all produces a generic calculator with placeholder defaults.

### 8.4 Slider behaviour

**Revenue step size is dynamic** to avoid the slider feeling sluggish at low values or jumpy at high values:

| Revenue range | Step size |
|---|---|
| Below £1m | £100k |
| £1m to £10m | £500k |
| Above £10m | £5m |

All other sliders use fixed step sizes as defined in Section 8.2.

### 8.5 Page layout

Two-column layout on desktop (breakpoint: 860px), single column on mobile.

**Header:** Loxa logo (black rounded square, "LO/XA" in white) + "Partnership ROI Calculator" title. `www.loxacover.com` right-aligned.

**Company heading:** Centred, "PREPARED FOR" label above the company name.

**Left column (results):** Black rounded card containing the totals row and four line items stacked underneath. Followed by a methodology note in small text.

**Right column (sliders):** White rounded card, sticky-positioned on scroll. Titled "Your Business" with subheading "Adjust to match your numbers". Contains the four sliders only, no other controls.

**CTA:** Centred below both columns. Single "Make an enquiry" button linking to the Loxa contact page. This is the only call to action on the page.

**Footer:** Disclaimer text ("estimates based on the assumptions shown, actual results will vary") and FCA authorisation note.

**Mobile (below 860px):** Columns stack vertically, sliders panel moves above results (so the prospect sees controls first), sticky positioning is removed.

### 8.6 Results card structure

The black results card has a consistent internal structure:

**Column headers:** "Revenue" and "Profit" labels, right-aligned above the figures.

**Totals row:** "Total Annual Value" label with total revenue (white) and total profit (lime green, `#EAFFAA`). Separated from line items by a subtle divider.

**Line items (four rows):** Each line item contains:

1. **Colour indicator** (10x10px rounded square) identifying the revenue stream. Colours: Lime for Insurance, Purple (`#DBBCEC`) for Conversion, Blue (`#B7F0EF`) for Returns, Peach (`#FFBE92`) for Claims.
2. **Stream title** (e.g. "Insurance Premiums").
3. **Revenue figure** (white, right-aligned).
4. **Profit figure** (lime green, right-aligned).
5. **Tags row** beneath the figures, containing:
   - **Constant tags:** Label/value pairs showing the fixed Loxa assumptions that feed this line item (e.g. "Pricing 8%", "Take-up 30%").
   - **Note tags:** Italic, lower-opacity explanatory notes (e.g. "Profit net of 12% IPT", "On insured products only").

Tags per line item:

| Line item | Constant tags | Note tag |
|---|---|---|
| Insurance Premiums | Pricing X%, Take-up X%, Retailer share X% | Profit net of 12% IPT |
| Conversion Uplift | Conversion increase X% | Net of 20% VAT |
| Reduced Returns | Return decrease X% | On insured products only |
| Claims Replacements | Replacement rate X%, Est. claims N | Net of 20% VAT |

### 8.7 Hover states

All monetary figures (both totals and line items) display abbreviated values by default (see Section 7, "Abbreviated" formatting). On mouse hover, the figure switches to full precision (e.g. `£480k` becomes `£480,000`). No click required, no tooltip, the number itself changes in place.

This provides exact figures on demand without cluttering the default view.

### 8.8 Methodology note

A single line of small text sits below the results card (outside it, not inside):

> Insurance profit calculated net of 12% Insurance Premium Tax (IPT). Product revenue streams (conversion, returns, claims) calculated net of 20% VAT. Insured product value: £X,XXX,XXX.

The insured product value figure updates dynamically as the revenue slider changes. This provides a useful derived figure (revenue x take-up rate) without requiring its own line item.

### 8.9 Typography

Uses the Google Slides substitute fonts from the Loxa brand guidelines (Section 3 of `loxa_brand_guidelines.md`):

| Role | Font | Usage |
|---|---|---|
| Headings and figures | Poppins (600, 700, 800) | Company name, totals, revenue/profit figures, slider values, CTA button |
| Body and labels | DM Sans (400, 500, 600, 700) | Stream titles, slider labels, tags, notes, footer |

Both loaded via Google Fonts. When the tool moves to a Loxa-hosted subdomain with custom font support, these should be swapped to Neulis Sans / Gelica per the brand guidelines.

### 8.10 Colours

| Token | Hex | Usage |
|---|---|---|
| Lime (page background, profit figures) | `#EAFFAA` | Page background, profit accent, slider thumbs |
| Black (results card, headings) | `#000000` | Results card background, header text, CTA button, slider tracks |
| White (slider panel, revenue figures) | `#FFFFFF` | Slider panel background, revenue figures on dark background |
| Purple (conversion accent) | `#DBBCEC` | Conversion Uplift colour indicator |
| Blue (returns accent) | `#B7F0EF` | Reduced Returns colour indicator |
| Peach (claims accent) | `#FFBE92` | Claims Replacements colour indicator |

### 8.11 Hosting and deployment

The app is a single static file (React component) with no backend dependencies. All computation happens client-side. Recommended deployment:

1. Build as a standalone HTML file (React + inline styles, single bundle).
2. Deploy to Cloudflare Pages, Vercel, or Netlify (all support free tier static hosting with custom domains).
3. Point a CNAME record from `roi.loxacover.com` (or equivalent subdomain) to the hosting provider.
4. Update the "Full ROI calculator here" link in the pitch deck template to use the subdomain URL with prospect-specific parameters.

### 8.12 Integration with Clay

Clay generates the full URL per prospect using an HTTP API action or formula column. The URL is assembled by concatenating the base URL with query parameters populated from the prospect row and category assumption lookups. The generated link is stored in a Clay column and inserted into the deck via the `{{ROI Calculator URL}}` placeholder.

### 8.13 Future considerations

Items identified but not in the current prototype:

- **Custom font embedding:** Swap Poppins/DM Sans for Neulis Sans/Gelica when hosted on a domain that supports custom fonts.
- **Company logo:** Display the prospect's logo alongside the company name in the header.
- **PDF export:** Allow the prospect to download the calculator as a branded PDF.
- **Email capture:** Optionally gate the CTA behind a contact form to capture leads directly.
- **Analytics:** Track slider interactions and CTA clicks to understand which assumptions prospects challenge most.
- **Category-specific copy:** Add a brief description of what Loxa protection covers for this prospect's category (e.g. "Accidental Damage, Stains and Structural Protection" for furniture).
- **Mobile touch optimisation:** Replace hover-to-reveal exact figures with tap-to-toggle on touch devices.
