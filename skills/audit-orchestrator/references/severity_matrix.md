# Severity Classification Matrix & Rubric

This matrix defines the standardized criteria for mapping audit defects to severity tiers (`critical`, `high`, `medium`, `low`).

| Severity | Criteria & Impact | Representative Examples |
| :--- | :--- | :--- |
| **`critical`** | Completely prevents AI search engines from crawling, indexing, or parsing the site, or causes catastrophic immediate user bounce (>90%). | • `robots.txt` Disallow for `*` or major AI bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`).<br>• `X-Robots-Tag: noindex, noai`.<br>• Completely blank static HTML (100% JS-dependent blank page).<br>• Site DNS/SSL outage. |
| **`high`** | Severely degrades AI citation accuracy, breaks entity identity, or conceals core commercial facts. | • Complete absence of Schema.org JSON-LD structured data on core pages.<br>• Core product pricing and specs locked inside bitmap images without `alt` text.<br>• Critical JavaScript hydration gap where >60% of text content is missing in SSR HTML.<br>• Inconsistent Name, Address, Phone (NAP) across pages. |
| **`medium`** | Lowers quotation probability in generative answers, causes information scent friction, or signals temporal staleness. | • Missing `sameAs` entity links to Wikidata, Wikipedia, Crunchbase, or social profiles.<br>• Outdated copyright year in footer (>2 years old).<br>• Missing `FAQPage` or `BreadcrumbList` schema.<br>• Reading level too complex (Flesch-Kincaid Grade > 14) for general audiences.<br>• Confusing or buried Call-To-Action (CTA). |
| **`low`** | Minor semantic opportunities and proactive generative optimizations. | • Sub-optimal heading nesting (e.g. `H1` followed directly by `H3`).<br>• Proactive recommendation to publish an `llms.txt` file.<br>• Missing author bio metadata on blog posts. |
