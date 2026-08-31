# Generative Engine Optimization (GEO) & AEO Guidelines

## 1. Core Principles of LLM Quotability
* **Atomic Definition Blocks:** The first sentence beneath any major heading (`H2`/`H3`) should provide a standalone, fact-dense answer to the topic in 25–40 words.
* **Semantic HTML Tables:** Never render pricing matrices or comparison charts inside bitmap images (`PNG`/`JPEG`) or canvas elements. Use standard `<table>`, `<th>`, `<tr>`, `<td>` tags.
* **Heading-as-Question:** Use conversational questions in headings (`How does X work?`, `What is the cost of Y?`) to directly match user prompt embeddings in LLM RAG pipelines.
* **Publish `/llms.txt`:** Place a standardized markdown summary at `/llms.txt` to provide a concise index for AI assistant retrieval.
