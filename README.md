# Voice of Customer Radar (Next.js + Vercel)

A review-intelligence agent that converts customer-review data into product-level complaint patterns, weekly changes, rating signals and recommended actions — now a **REST API + modern web UI** deployed on **Vercel**, replacing the original local Streamlit prototype.

> **Important:** The bundled data is synthetic. It does not represent actual Mokobara products, marketplace reviews or customer opinions. No marketplace review API is connected by default.

## What changed from the Streamlit version

| Streamlit (v1) | Next.js + Vercel (v2) |
|---|---|
| Local Python UI (`streamlit run app.py`) | Web app on Vercel, always-on, zero-cost hobby tier |
| Single-file Python dashboard | React/Tailwind frontend + serverless API routes |
| Analysis logic in Python (`src/review_radar.py`) | Analysis logic ported to TypeScript (`lib/analysis.ts`) |
| CSV upload in UI | `POST /api/analyze` accepts review JSON; returns ranked issues, trends, per-product priorities |
| Download MD/HTML from UI | `POST /api/report` returns Markdown + HTML reports |
| Optional Tavily search tab | `POST /api/search` proxies Tavily web discovery |
| Local Task Scheduler | Serverless; schedule via Vercel Crons or an external scheduler |

## Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (serverless API routes + static frontend)
- **Optional search:** Tavily API (free tier, no card required) for public-web discovery
- **Analysis:** TypeScript port of the original Python logic — validation, de-duplication, rule-based sentiment & issue classification, week-on-week comparison, rating trends

## Project structure

```
voice_of_customer_radar_web/
├── app/
│   ├── layout.tsx              # root layout + metadata
│   ├── page.tsx                # dashboard (overview / products / discovery tabs)
│   ├── globals.css             # Tailwind + CSS variables
│   └── api/
│       ├── analyze/route.ts    # POST → review analysis (issues, trends, products)
│       ├── report/route.ts     # POST → Markdown + HTML weekly reports
│       ├── search/route.ts     # POST → Tavily web-discovery results
│       └── sample/route.ts     # GET → embedded synthetic sample data
├── components/
│   ├── KpiCard.tsx             # KPI metric cards
│   ├── BarChart.tsx            # CSS bar chart + issue theme chart
│   ├── IssueTable.tsx          # ranked issue table
│   ├── ProductCard.tsx         # per-product deep-dive card
│   ├── UploadCsv.tsx           # CSV file upload
│   ├── SearchTab.tsx           # Tavily web discovery
│   └── ReportDownload.tsx      # download Markdown / HTML / preview
├── lib/
│   ├── analysis.ts             # core analysis port (validate, dedupe, classify, aggregate)
│   ├── taxonomy.ts             # issue rules, recommendations, sentiment terms, column aliases
│   ├── reports.ts              # Markdown / HTML report rendering
│   ├── tavily.ts               # Tavily search client + query building
│   └── sampleData.ts           # embedded synthetic sample CSV
├── data/                       # (reserved for real authorised exports)
├── tests/                      # Vitest tests
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── .env.example                # copy to .env.local for Tavily key
└── README.md
```

## CSV format for your own authorised data

Required columns (aliases such as `review`, `date`, `stars`, `marketplace` are also recognised):

| Column | Example | Notes |
|---|---|---|
| `review_date` | `2026-10-18` | Date used to place the review into a seven-day window |
| `product` | `Aero Cabin Case` | SKU or product name; use stable IDs if available |
| `platform` | `Amazon India` | Data source name |
| `rating` | `2` | Numeric rating from 1 to 5 |
| `review_text` | `A wheel feels loose...` | Review content you are authorised to process |

Optional fields: `review_id`, `product_url`.

Example header:

```csv
review_id,review_date,product,platform,rating,review_text,product_url
R-1001,2026-10-18,Aero Cabin Case,Marketplace Export,2,"The zipper gets stuck",https://example.com/product
```

Do not put customer names, emails, phone numbers or order identifiers in the dataset unless strictly necessary and authorised.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy env example (only needed for web discovery):

```bash
cp .env.example .env.local
# add TAVILY_API_KEY=... if you want Tavily search
```

3. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`. The app loads the embedded synthetic sample automatically; you can also upload your own CSV.

## Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server (localhost:3000) |
| `npm run build` | Production build for Vercel |
| `npm start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest test suite |

## Deployment to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel (Framework preset: Next.js).
3. Add `TAVILY_API_KEY` in Vercel project settings → Environment Variables (optional, only for web discovery).
4. Deploy. The app is live on a `vercel.app` URL with serverless API routes.

### Scheduling weekly runs (always-on)

Vercel is serverless and always-on (no laptop required). To run the analysis weekly:

- Add a Vercel Cron in `vercel.json`, or
- Call `POST /api/analyze` from an external scheduler (GitHub Actions, Cron-job.org, etc.) and store the result, or
- Build a small "run weekly" serverless function that triggers the analysis and emails/saves the report.

## Platform API findings (read before adding live connectors)

See the original `API_ACCESS_RESEARCH.md` from the Streamlit prototype. Summary:

- **Amazon:** Customer Feedback API exists but documented marketplaces exclude India.
- **Flipkart / Myntra:** Seller APIs cover listings/orders; no documented public individual-review-text endpoint found.
- **Blinkit / Zepto:** Seller portals exist; no public review-text API verified.
- **Etsy:** Documents review endpoints but its API Terms restrict review analytics/AI use without express written authorisation.

The prototype therefore treats web search (Tavily) as a **discovery layer**, not a complete review database. For defensible complaint counts, import a complete authorised review export or connect an approved platform feed.

## Honest demo claims

It is accurate to say:

> “I built a review-intelligence agent with a REST API and web UI on Vercel. It ingests review records, de-duplicates them, classifies complaint themes, ranks the top issues per product, compares consecutive seven-day windows, and generates Markdown/HTML weekly reports. It also has an optional public-web discovery adapter via Tavily. The bundled records are synthetic; live marketplace review APIs are not connected yet.”

Do **not** claim it currently monitors marketplaces 24/7 or that search results reflect all reviews.

## Tests

Run the test suite:

```bash
npm test
```

Tests cover issue classification, de-duplication, sample-dataset analysis, and the search-evidence warning.
