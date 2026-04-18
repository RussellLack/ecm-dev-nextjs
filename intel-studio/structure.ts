import type { StructureBuilder } from "sanity/structure";

/**
 * Custom Studio desk structure.
 *
 * The default document-type list gets noisy with 16+ schemas, so we group
 * related documents into sections and surface the Content Intelligence
 * Engine queues (raw / enriched / published / rejected) as separate lists
 * so editors can triage incoming articles without wading through a flat
 * "all articles" list.
 */

const INTEL_TYPES = new Set([
  "intelArticle",
  "intelSource",
  "intelTopic",
  "intelVendor",
]);

const HIDDEN_TYPES = new Set([
  // Hidden from the tree — kept reachable via references and search.
  "skosConcept",
  "skosConceptScheme",
  "assessmentSubmission",
  "toolSubmission",
]);

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      // ── Content Intelligence Engine ────────────────────────────────
      S.listItem()
        .title("Intel")
        .icon(() => "📡")
        .child(
          S.list()
            .title("Intel")
            .items([
              S.listItem()
                .title("Raw (awaiting enrichment)")
                .child(
                  S.documentList()
                    .title("Raw")
                    .filter('_type == "intelArticle" && status == "raw"')
                    .defaultOrdering([
                      { field: "ingestedAt", direction: "desc" },
                    ])
                ),
              S.listItem()
                .title("Enriched (needs review)")
                .child(
                  S.documentList()
                    .title("Enriched")
                    .filter('_type == "intelArticle" && status == "enriched"')
                    .defaultOrdering([
                      { field: "publishedDate", direction: "desc" },
                    ])
                ),
              S.listItem()
                .title("Published")
                .child(
                  S.documentList()
                    .title("Published")
                    .filter('_type == "intelArticle" && status == "published"')
                    .defaultOrdering([
                      { field: "publishedDate", direction: "desc" },
                    ])
                ),
              S.listItem()
                .title("Rejected")
                .child(
                  S.documentList()
                    .title("Rejected")
                    .filter('_type == "intelArticle" && status == "rejected"')
                    .defaultOrdering([
                      { field: "publishedDate", direction: "desc" },
                    ])
                ),
              S.divider(),
              S.documentTypeListItem("intelSource").title("Sources (feeds)"),
              S.documentTypeListItem("intelTopic").title("Topics"),
              S.documentTypeListItem("intelVendor").title("Vendors"),
            ])
        ),

      S.divider(),

      // ── Everything else: default list for all other document types ─
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId() as string;
        return !INTEL_TYPES.has(id) && !HIDDEN_TYPES.has(id);
      }),
    ]);
