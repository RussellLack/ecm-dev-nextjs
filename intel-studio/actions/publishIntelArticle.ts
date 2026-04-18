import type {
  DocumentActionComponent,
  DocumentActionDescription,
  DocumentActionProps,
} from "sanity";
import { useClient } from "sanity";

/**
 * Document actions for intelArticle.
 *
 * Workflow state lives in a custom `status` field (raw → enriched →
 * published / rejected), not in Sanity's built-in draft/published split,
 * so we provide two custom actions:
 *
 * - "Publish to feed"  (shown when status === "enriched") → status="published"
 * - "Reject"           (shown when status ∈ {enriched, published}) → status="rejected"
 *
 * On raw articles no custom actions appear: they need enrichment first.
 * Rejected articles can be reopened by editing `status` directly in the
 * field UI.
 */

function currentStatus(props: DocumentActionProps): string | undefined {
  const doc = (props.published ?? props.draft) as
    | { status?: string }
    | undefined
    | null;
  return doc?.status;
}

function buildPublishAction(): DocumentActionComponent {
  const Action: DocumentActionComponent = (
    props: DocumentActionProps
  ): DocumentActionDescription | null => {
    const client = useClient({ apiVersion: "2026-04-01" });

    if (props.type !== "intelArticle") return null;
    if (currentStatus(props) !== "enriched") return null;

    return {
      label: "Publish to feed",
      tone: "positive",
      onHandle: async () => {
        await client
          .patch(props.id)
          .set({ status: "published" })
          .commit();
        props.onComplete();
      },
    };
  };
  Action.action = "publish";
  return Action;
}

function buildRejectAction(): DocumentActionComponent {
  const Action: DocumentActionComponent = (
    props: DocumentActionProps
  ): DocumentActionDescription | null => {
    const client = useClient({ apiVersion: "2026-04-01" });

    if (props.type !== "intelArticle") return null;
    const status = currentStatus(props);
    if (status !== "enriched" && status !== "published") return null;

    return {
      label: "Reject",
      tone: "critical",
      onHandle: async () => {
        await client
          .patch(props.id)
          .set({ status: "rejected" })
          .commit();
        props.onComplete();
      },
    };
  };
  Action.action = "unpublish";
  return Action;
}

export const publishIntelArticleAction = buildPublishAction();
export const rejectIntelArticleAction = buildRejectAction();
