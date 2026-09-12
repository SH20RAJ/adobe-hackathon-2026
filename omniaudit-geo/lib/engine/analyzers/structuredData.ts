/**
 * Skill 2: Structured Entity & Schema.org Specialist Analyzer (TypeScript).
 * Zero divergence from Python audit_structured_data.
 */

import { Finding } from "../types";
import { HTMLContentExtractor } from "../htmlParser";

export function auditStructuredData(baseUrl: string, parsedContent: HTMLContentExtractor): Finding[] {
  const findings: Finding[] = [];
  const jsonLds = parsedContent.json_ld_blocks;
  const parsedSchemas: any[] = [];
  const malformedBlocks: number[] = [];

  function flattenJsonLd(value: any): any[] {
    if (Array.isArray(value)) {
      const nodes: any[] = [];
      for (const item of value) {
        nodes.push(...flattenJsonLd(item));
      }
      return nodes;
    }
    if (typeof value !== "object" || value === null) {
      return [];
    }
    const graph = value["@graph"];
    if (Array.isArray(graph)) {
      const graphNodes: any[] = [];
      for (const item of graph) {
        graphNodes.push(...flattenJsonLd(item));
      }
      const node: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        if (k !== "@graph") node[k] = v;
      }
      return (node["@type"] ? [node] : []).concat(graphNodes);
    }
    return [value];
  }

  for (let index = 0; index < jsonLds.length; index++) {
    const raw = jsonLds[index];
    try {
      const parsed = JSON.parse(raw.trim());
      parsedSchemas.push(...flattenJsonLd(parsed));
    } catch {
      malformedBlocks.push(index + 1);
    }
  }

  if (malformedBlocks.length > 0) {
    findings.push({
      id: "F-003",
      title: "Syntax Error in Embedded JSON-LD Script Block",
      severity: "high",
      category: "structured_data_syntax",
      confidence: "high",
      evidence: JSON.stringify({
        json_ld_blocks: jsonLds.length,
        malformed_block_indexes: malformedBlocks,
        parsed_node_count: parsedSchemas.length,
      }),
      suggested_action: {
        summary: "Fix JSON syntax in each malformed JSON-LD script so machines can parse the entity graph.",
        priority: "high",
        implementation_code: '{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Brand Name"\n}',
      },
    });
  }

  const recognizedTypes = new Set([
    "Organization", "WebSite", "WebPage", "Article",
    "Product", "Person", "LocalBusiness", "EducationalOrganization",
    "CollegeOrUniversity",
  ]);

  const organizationTypes = new Set([
    "Organization", "LocalBusiness", "EducationalOrganization",
    "CollegeOrUniversity",
  ]);

  const entityFields: Record<string, string[]> = {
    Organization: ["name", "url", "logo", "sameAs", "description"],
    WebSite: ["name", "url", "potentialAction"],
    WebPage: ["name", "url", "description"],
    Article: ["headline", "author", "datePublished", "dateModified", "image"],
    Product: ["name", "description", "image", "brand", "offers"],
    Person: ["name", "url", "sameAs"],
    LocalBusiness: ["name", "url", "address", "telephone"],
    EducationalOrganization: ["name", "url", "sameAs", "description"],
    CollegeOrUniversity: ["name", "url", "sameAs", "description"],
  };

  const typesFound = new Set<string>();
  const entitySummaries: any[] = [];
  const sameAsUrls: string[] = [];
  const malformedSameAs: string[] = [];
  const ids: string[] = [];
  const idReferences: string[] = [];

  for (let nodeIndex = 0; nodeIndex < parsedSchemas.length; nodeIndex++) {
    const schema = parsedSchemas[nodeIndex];
    if (typeof schema !== "object" || schema === null) continue;

    const rawTypes = schema["@type"] || [];
    const nodeTypes: string[] = (Array.isArray(rawTypes) ? rawTypes : [rawTypes]).filter(
      (t) => typeof t === "string" && t
    );
    for (const t of nodeTypes) typesFound.add(t);

    const nodeId = schema["@id"];
    if (typeof nodeId === "string" && nodeId) ids.push(nodeId);

    function collectIdReferences(val: any) {
      if (typeof val === "object" && val !== null) {
        if (typeof val["@id"] === "string") idReferences.push(val["@id"]);
        for (const child of Object.values(val)) collectIdReferences(child);
      } else if (Array.isArray(val)) {
        for (const child of val) collectIdReferences(child);
      }
    }

    for (const [k, val] of Object.entries(schema)) {
      if (k !== "@id") collectIdReferences(val);
    }

    const recognizedNodeTypes = nodeTypes.filter((t) => recognizedTypes.has(t));
    if (recognizedNodeTypes.length > 0) {
      const allFields = new Set<string>();
      for (const t of recognizedNodeTypes) {
        for (const f of entityFields[t] || []) allFields.add(f);
      }
      const present = Array.from(allFields).filter((f) => Boolean(schema[f])).sort();
      const missing = Array.from(allFields).filter((f) => !schema[f]).sort();

      entitySummaries.push({
        node_index: nodeIndex + 1,
        types: recognizedNodeTypes,
        id: nodeId,
        fields_present: present,
        fields_missing: missing,
      });
    }

    const sameAs = schema["sameAs"];
    if (sameAs) {
      const values = Array.isArray(sameAs) ? sameAs : [sameAs];
      for (const val of values) {
        if (typeof val === "string" && /^https?:\/\/[^\s]+$/.test(val)) {
          sameAsUrls.push(val);
        } else {
          malformedSameAs.push(String(val));
        }
      }
    }
  }

  const hasSameAs = sameAsUrls.length > 0 || malformedSameAs.length > 0;
  const recognizedTypeNames = Array.from(typesFound).filter((t) => recognizedTypes.has(t)).sort();
  const organizationIdentityTypes = Array.from(typesFound).filter((t) => organizationTypes.has(t)).sort();
  const organizationIdentityPresent = organizationIdentityTypes.length > 0;
  const websitePresent = typesFound.has("WebSite");
  const graphDetected = jsonLds.some((raw) => raw.includes("@graph"));

  let domain = "";
  try {
    domain = new URL(baseUrl).hostname;
  } catch {
    domain = baseUrl;
  }

  const entityEvidence = {
    json_ld_blocks: jsonLds.length,
    parsed_node_count: parsedSchemas.length,
    recognized_entity_types: recognizedTypeNames,
    organization_identity_present: organizationIdentityPresent,
    organization_identity_types: organizationIdentityTypes,
    website_present: websitePresent,
    entity_summaries: entitySummaries,
    graph_detected: graphDetected,
    sameAs_urls: sameAsUrls,
    malformed_sameAs_values: malformedSameAs,
    id_values: ids,
    id_references: Array.from(new Set(idReferences)).sort(),
  };

  if (!organizationIdentityPresent || !websitePresent) {
    let missingCoreTypes: string[] = [];
    let title = "";
    let summary = "";
    let implementationCode = "";

    if (parsedSchemas.length === 0) {
      missingCoreTypes = ["Organization", "WebSite"];
      title = "Missing Organization / WebSite Schema.org JSON-LD";
      summary = "Add Organization and WebSite Schema.org JSON-LD to establish machine-readable identity.";
      implementationCode = `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${domain}",\n  "url": "${baseUrl}"\n}\n</script>`;
    } else if (!organizationIdentityPresent) {
      missingCoreTypes = ["Organization"];
      title = "Missing Organization Identity in Schema.org JSON-LD";
      summary = "Add an Organization or recognized organization subtype with explicit name and URL.";
      implementationCode = `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${domain}",\n  "url": "${baseUrl}"\n}\n</script>`;
    } else {
      missingCoreTypes = ["WebSite"];
      title = "Incomplete Structured Identity: WebSite Entity Missing";
      summary = "Add a WebSite JSON-LD entity alongside the existing organization identity.";
      implementationCode = `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${domain}",\n  "url": "${baseUrl}"\n}\n</script>`;
    }

    findings.push({
      id: "F-004",
      title,
      severity: "high",
      category: "structured_data_entity",
      confidence: "high",
      evidence: JSON.stringify({
        ...entityEvidence,
        missing_core_types: missingCoreTypes,
      }),
      suggested_action: {
        summary,
        priority: "high",
        implementation_code: implementationCode,
      },
    });
  }

  if (parsedSchemas.length > 0 && !hasSameAs) {
    findings.push({
      id: "F-005",
      title: "Missing sameAs Entity Corroboration Links",
      severity: "medium",
      category: "structured_data_corroboration",
      confidence: "high",
      evidence: JSON.stringify({
        ...entityEvidence,
        sameAs_status: "missing",
      }),
      suggested_action: {
        summary: "Add sameAs URIs to Organization JSON-LD to eliminate entity ambiguity in AI models.",
        priority: "medium",
        implementation_code: '"sameAs": [\n  "https://www.wikidata.org/entity/...",\n  "https://www.crunchbase.com/organization/..."\n]',
      },
    });
  }

  if (malformedSameAs.length > 0) {
    findings.push({
      id: "F-013",
      title: "Malformed sameAs Entity References",
      severity: "low",
      category: "structured_data_corroboration",
      confidence: "high",
      evidence: JSON.stringify({
        ...entityEvidence,
        sameAs_status: "malformed_values_present",
      }),
      suggested_action: {
        summary: "Replace malformed sameAs values with complete external HTTP or HTTPS entity URLs.",
        priority: "low",
        implementation_code: '"sameAs": ["https://www.wikidata.org/entity/Q..."]',
      },
    });
  }

  const incompleteIdentity = entitySummaries.filter(
    (s) => s.types.includes("Organization") && (s.fields_missing.includes("name") || s.fields_missing.includes("url"))
  );
  if (incompleteIdentity.length > 0) {
    findings.push({
      id: "F-012",
      title: "Incomplete Organization Identity Signals",
      severity: "medium",
      category: "structured_data_entity",
      confidence: "high",
      evidence: JSON.stringify({
        ...entityEvidence,
        incomplete_identity_nodes: incompleteIdentity,
      }),
      suggested_action: {
        summary: "Add the missing Organization name and URL properties so machine-readable identity is explicit.",
        priority: "medium",
        implementation_code: '"name": "Brand Name",\n"url": "https://example.com"',
      },
    });
  }

  return findings;
}
