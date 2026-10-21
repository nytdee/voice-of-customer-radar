import { ISSUE_RULES } from "./taxonomy";
import { asDate, formatDateISO } from "./dates";
import type {
  AnalysisResult,
  IssueRow,
  PeriodSummary,
  ProductReport,
} from "./analysis";

function orderedProducts(analysis: AnalysisResult): ProductReport[] {
  return [...analysis.products].sort(
    (a, b) => (a.rating_trend.rating_delta ?? 0) - (b.rating_trend.rating_delta ?? 0)
  );
}

export function renderMarkdownReport(analysis: AnalysisResult): string {
  const cs = analysis.overall_current;
  const ps = analysis.overall_previous;
  const [start, end] = analysis.current_period.map(asDate);
  const [pstart, pend] = analysis.previous_period.map(asDate);

  const fmtDate = (d: Date) => formatDateISO(d);
  const fmtRating = (v: number | null) => (v === null ? "n/a" : String(v));

  const lines: string[] = [
    "# Voice of Customer Radar — Weekly Review Intelligence Report",
    "",
    "> **Prototype note:** Use this report only with the declared source dataset. If the dataset contains synthetic data, all figures are illustrative. Review mention counts are not a causal estimate of rating impact.",
    "",
    `**Current window:** ${fmtDate(start)} to ${fmtDate(end)}  `,
    `**Previous window:** ${fmtDate(pstart)} to ${fmtDate(pend)}  `,
    `**Unique reviews analysed:** ${analysis.deduped_review_count.toLocaleString()}  `,
    `**Source labels present:** ${analysis.source_count}  `,
    "",
    "## Executive summary",
    "",
    `- Current window: **${cs.reviews.toLocaleString()} reviews**, **${cs.negative_reviews.toLocaleString()} negative**, **${cs.negative_share_pct}% negative share**.`,
    `- Average rating *within the collected reviews*: **${fmtRating(cs.avg_review_rating)} / 5** (previous window: ${fmtRating(ps.avg_review_rating)} / 5). This is not the marketplace's aggregate listing rating.`,
    `- Review volume changed **${pctChange(cs.reviews, ps.reviews)}** week-on-week; negative review share changed **${(cs.negative_share_pct - ps.negative_share_pct).toFixed(1)} percentage points**.`,
    "",
    "## Product priorities (worst rating movement first)",
    "",
    "| Product | Reviews | Negative | Negative share | Avg rating | Rating change |",
    "|---|---:|---:|---:|---:|---:|",
  ];

  for (const item of orderedProducts(analysis)) {
    const rt = item.rating_trend;
    const delta = rt.rating_delta;
    const deltaText = delta === null ? "n/a" : `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`;
    lines.push(
      `| ${escapeMd(item.product)} | ${item.current.reviews} | ${item.current.negative_reviews} | ${item.current.negative_share_pct}% | ${fmtRating(item.current.avg_review_rating)} | ${deltaText} |`
    );
  }

  lines.push("", "## Product-by-product detail", "");

  for (const item of orderedProducts(analysis)) {
    lines.push(`### ${item.product}`, "");
    const cur = item.current;
    const rt = item.rating_trend;
    const delta = rt.rating_delta ?? null;
    lines.push(
      `- Current window: ${cur.reviews.toLocaleString()} reviews, ${cur.negative_reviews.toLocaleString()} negative (${cur.negative_share_pct}%).`
    );
    if (delta !== null) {
      lines.push(
        `- Average rating in collected reviews: ${fmtRating(rt.previous_avg_review_rating)} → ${fmtRating(rt.current_avg_review_rating)} (${delta >= 0 ? "+" : ""}${delta.toFixed(2)} stars; previous n=${rt.previous_review_count}, current n=${rt.current_review_count}).`
      );
    }
    if (item.top_issues.length > 0) {
      lines.push(
        "",
        "| Rank | Issue | Negative-review mentions | Prior window | WoW change | Recommendation |",
        "|---:|---|---:|---:|---:|---|"
      );
      for (let idx = 0; idx < item.top_issues.length; idx++) {
        const issue = item.top_issues[idx];
        const pct = issue.previous_mentions
          ? `${issue.change_pct >= 0 ? "+" : ""}${issue.change_pct.toFixed(0)}%`
          : issue.mentions > 0
            ? "New"
            : "0%";
        const rec = issue.recommendation.replace(/\|/g, "\\|");
        lines.push(
          `| ${idx + 1} | ${escapeMd(issue.issue)} | ${issue.mentions} | ${issue.previous_mentions} | ${pct} | ${rec} |`
        );
      }
    } else {
      lines.push("No negative-review issue themes were detected in the current window.");
    }
    lines.push("");
  }

  lines.push(
    "## How to interpret this report",
    "",
    "1. Issue frequency counts negative reviews that match the issue taxonomy. One review may contribute to multiple issue themes.",
    "2. Week-on-week changes are based on the latest seven-day window in the dataset versus the previous seven days; the data may be synthetic, partial or based on search snippets.",
    "3. Average review rating is calculated from the collected review records, not from the marketplace's full listing rating. To establish true listing-rating movement, ingest dated aggregate rating snapshots from an authorised source.",
    "4. Recommendations are hypotheses for investigation, not proven root causes. Assign owners and verify against SKU, batch, fulfilment and customer-support data before acting.",
    "5. Web search results should be treated as discovery leads. Do not treat search snippets as complete review text or as a representative denominator.",
    "",
    "## Suggested operating actions",
    "",
    "- Route repeat product-quality complaints to the product/quality owner with representative source URLs.",
    "- Compare issue rates by SKU and marketplace before attributing a problem to a product or delivery partner.",
    "- Track whether the issue's prevalence and the collected-review rating trend improve after a change.",
    "- Review severe safety-related complaints promptly with a human owner; do not let an LLM make safety decisions automatically.",
    "",
    "---",
    "Generated by Voice of Customer Radar prototype.",
  );

  return lines.join("\n");
}

export function renderHtmlReport(analysis: AnalysisResult): string {
  const cs = analysis.overall_current;
  const ps = analysis.overall_previous;
  const [start, end] = analysis.current_period.map(asDate);

  const fmtDate = (d: Date) => formatDateISO(d);
  const fmtRating = (v: number | null) => (v === null ? "—" : String(v));

  const productBlocks = orderedProducts(analysis)
    .map((item) => {
      const cur = item.current;
      const rt = item.rating_trend;
      const delta = rt.rating_delta;
      const deltaClass = delta === null ? "flat" : delta >= 0 ? "up" : "down";
      const deltaText = delta === null ? "n/a" : `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`;

      const issueRows = item.top_issues
        .map((row) => {
          const change =
            row.previous_mentions === 0
              ? "New"
              : `${row.change_pct >= 0 ? "+" : ""}${row.change_pct.toFixed(0)}%`;
          const changeClass =
            row.previous_mentions === 0
              ? "flat"
              : row.change_pct > 0
                ? "up"
                : row.change_pct < 0
                  ? "down"
                  : "flat";
          return `<tr><td>${escapeHtml(row.issue)}</td><td>${row.mentions}</td><td>${row.previous_mentions}</td><td class="chg ${changeClass}">${change}</td><td>${escapeHtml(row.recommendation)}</td></tr>`;
        })
        .join("");

      const table =
        item.top_issues.length > 0
          ? `<div class="table-wrap"><table><thead><tr><th>Issue theme</th><th>Mentions</th><th>Prior week</th><th>Change</th><th>Suggested action</th></tr></thead><tbody>${issueRows}</tbody></table></div>`
          : `<p class="muted">No negative-review issue themes were detected in the current window.</p>`;

      return `
        <section class="product-card">
          <div class="product-head">
            <div>
              <p class="eyebrow">Product</p>
              <h2>${escapeHtml(item.product)}</h2>
            </div>
            <span class="badge-neg">${cur.negative_share_pct}% negative</span>
          </div>
          <div class="stat-row">
            <div class="stat"><div class="k">${cur.reviews}</div><div class="v">Reviews</div></div>
            <div class="stat"><div class="k">${cur.negative_reviews}</div><div class="v">Negative</div></div>
            <div class="stat"><div class="k">${fmtRating(cur.avg_review_rating)}</div><div class="v">Avg rating</div></div>
            <div class="stat"><div class="k ${deltaClass}">${deltaText}</div><div class="v">Rating change</div></div>
          </div>
          ${table}
        </section>`;
    })
    .join("");

  const css = `
    :root{--bg:#0b1220;--panel:rgba(30,41,59,.62);--line:rgba(255,255,255,.08);--ink:#e2e8f0;--muted:#94a3b8;--teal:#2dd4bf;--amber:#fbbf24;--red:#f87171;--green:#34d399;}
    *{box-sizing:border-box;}
    body{margin:0;font:15px/1.55 Inter,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ink);background-color:#0f172a;background-image:radial-gradient(circle at 12% -10%,rgba(45,212,191,.18),transparent 45%),radial-gradient(circle at 100% 0%,rgba(59,130,246,.14),transparent 40%),radial-gradient(circle at 50% 120%,rgba(251,191,36,.07),transparent 45%);min-height:100vh;-webkit-font-smoothing:antialiased;}
    main{max-width:1120px;margin:0 auto;padding:40px 24px 64px;}
    .eyebrow{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0 0 6px;}
    h1{font-size:30px;margin:0;letter-spacing:-.6px;color:#fff;}
    h2{font-size:18px;margin:0;color:#fff;}
    .sub{color:var(--muted);margin:6px 0 0;font-size:13px;}
    .top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:22px;}
    .brand{display:flex;align-items:flex-start;gap:12px;}
    .brand-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:rgba(45,212,191,.12);border:1px solid rgba(45,212,191,.25);color:var(--teal);font-size:20px;flex:none;}
    .pill{white-space:nowrap;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:7px 12px;font-size:12px;font-weight:600;}
    .note{border:1px solid rgba(251,191,36,.25);background:rgba(251,191,36,.08);color:#fcd9a4;border-radius:14px;padding:12px 16px;font-size:12.5px;margin:0 0 22px;}
    .note strong{color:#fde7c2;}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:0 0 26px;}
    .metric{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;backdrop-filter:blur(14px);}
    .metric .label{color:var(--muted);font-size:12px;}
    .metric .value{font-size:28px;font-weight:750;letter-spacing:-.5px;color:#fff;margin-top:8px;}
    .metric .value span{font-size:15px;color:var(--muted);font-weight:600;}
    .metric .foot{color:var(--muted);font-size:11.5px;margin-top:6px;}
    .section-head{margin:26px 0 6px;}
    .product-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:20px 22px;margin:14px 0;backdrop-filter:blur(14px);}
    .product-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
    .badge-neg{white-space:nowrap;border:1px solid rgba(251,191,36,.25);background:rgba(251,191,36,.1);color:var(--amber);border-radius:999px;padding:4px 10px;font-size:11.5px;font-weight:700;}
    .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0 6px;}
    .stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px;text-align:center;}
    .stat .k{font-size:15px;font-weight:700;color:#fff;}
    .stat .v{font-size:10.5px;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:.4px;}
    .up{color:var(--red);}.down{color:var(--green);}.flat{color:var(--muted);}
    .table-wrap{overflow:auto;margin-top:8px;}
    table{border-collapse:collapse;width:100%;font-size:12.5px;}
    th{text-align:left;color:var(--muted);font-weight:600;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--line);padding:8px 10px;white-space:nowrap;}
    td{border-bottom:1px solid rgba(255,255,255,.05);padding:10px;vertical-align:top;color:#cbd5e1;}
    tr:last-child td{border-bottom:0;}
    td:nth-child(1){font-weight:600;color:#fff;min-width:130px;}
    td:nth-child(4){white-space:nowrap;}
    td:last-child{min-width:280px;color:var(--muted);}
    .chg{font-weight:700;}
    .muted{color:var(--muted);font-size:12.5px;}
    .footnote{margin-top:26px;border-top:1px solid var(--line);padding-top:16px;color:var(--muted);font-size:11.5px;}
    .footnote strong{color:#cbd5e1;}
    @media(max-width:800px){.metrics{grid-template-columns:repeat(2,1fr);}.stat-row{grid-template-columns:repeat(2,1fr);}.top{flex-direction:column;}h1{font-size:26px;}}
    @media print{body{background:#fff;color:#111;}main{padding:0;}.metric,.product-card,.note{background:#fff;border-color:#ddd;backdrop-filter:none;color:#111;}h1,h2,.metric .value,.stat .k,td:nth-child(1){color:#111;}.pill,.badge-neg{border-color:#ddd;}}
  `;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Voice of Customer Radar — Weekly Brief</title>
  <style>${css}</style>
</head>
<body>
  <main>
    <div class="top">
      <div class="brand">
        <div class="brand-mark">◎</div>
        <div>
          <p class="eyebrow">Customer signals · Weekly brief</p>
          <h1>Voice of Customer Radar</h1>
          <p class="sub">Product-level complaint patterns, rating signals and recommended investigations.</p>
        </div>
      </div>
      <span class="pill">Generated ${fmtDate(end)}</span>
    </div>

    <p class="note"><strong>Prototype data note:</strong> This demonstration uses synthetic review data. It is not evidence about any real brand or marketplace. Average rating reflects collected reviews, not full marketplace listing ratings.</p>

    <div class="metrics">
      <div class="metric"><div class="label">Reviews analysed</div><div class="value">${analysis.deduped_review_count.toLocaleString()}</div><div class="foot">${analysis.source_count} source labels in dataset</div></div>
      <div class="metric"><div class="label">Current-window reviews</div><div class="value">${cs.reviews.toLocaleString()}</div><div class="foot">${fmtDate(start)} – ${fmtDate(end)}</div></div>
      <div class="metric"><div class="label">Negative share</div><div class="value">${cs.negative_share_pct}%</div><div class="foot">${cs.negative_reviews} of ${cs.reviews} reviews</div></div>
      <div class="metric"><div class="label">Avg. review rating</div><div class="value">${fmtRating(cs.avg_review_rating)}<span> / 5</span></div><div class="foot">Prior window ${fmtRating(ps.avg_review_rating)} / 5</div></div>
    </div>

    <div class="section-head">
      <p class="eyebrow">Product-level analysis</p>
      <h2>What to investigate first</h2>
    </div>
    ${productBlocks}

    <div class="footnote">
      <strong>Method:</strong> Issue labels use a transparent rule-based taxonomy. Mentions are counts of unique negative reviews assigned to a theme; a review may contain multiple themes. Recommendations are investigation hypotheses, not causal conclusions. Review sources should be authorised and coverage should be recorded. Web-search snippets are discovery leads, not a complete review corpus.
    </div>
  </main>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeMd(s: string): string {
  return String(s).replace(/\|/g, "\\|");
}

export function pctChange(current: number, previous: number): string {
  if (!previous) return current ? "new" : "0%";
  return `${(((current - previous) / previous) * 100).toFixed(0)}%`;
}

export interface WebSnippet {
  title: string;
  url: string;
  published_date: string;
  snippet: string;
  themes_detected: string;
  evidence_warning: string;
  rating: null;
}

export function analyzeWebSnippets(results: Array<{ title?: string; url?: string; content?: string; published_date?: string }>): WebSnippet[] {
  const rows: WebSnippet[] = [];
  const seen = new Set<string>();
  for (const result of results) {
    const url = String(result.url ?? "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const content = String(result.content ?? "");
    const title = String(result.title ?? "");
    const issues = classifyIssuesForSnippet(title + " " + content, ISSUE_RULES);
    rows.push({
      title,
      url,
      published_date: result.published_date ?? "",
      snippet: content.slice(0, 1800),
      themes_detected: issues.join("; "),
      evidence_warning: "Search-result snippet only; not a complete or verified individual review.",
      rating: null,
    });
  }
  return rows;
}

function classifyIssuesForSnippet(text: string, rules: Record<string, string[]>): string[] {
  const body = String(text).toLowerCase().replace(/\s+/g, " ").trim();
  const found: string[] = [];
  for (const [issue, terms] of Object.entries(rules)) {
    if (terms.some((t) => body.includes(t))) found.push(issue);
  }
  return found.length > 0 ? found : ["Other / needs review"];
}
