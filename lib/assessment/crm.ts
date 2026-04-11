import type { ContactInfo, ScoringResult, TrackingData } from "./types";

/* ─── CRM Abstraction Layer ─── */

export interface CRMSubmissionData {
  contact: ContactInfo;
  scoring: ScoringResult;
  tracking: TrackingData;
  assessmentTitle: string;
  submissionId: string;
  requestedContact: boolean;
  timeToCompleteSeconds?: number;
}

export interface AutomationEvent {
  type: "high_intent" | "medium_intent" | "low_intent" | "submission_complete";
  data: CRMSubmissionData;
}

/**
 * Generic CRM provider interface.
 * Implement this for HubSpot, Salesforce, webhook, etc.
 */
export interface CRMProvider {
  syncSubmission(data: CRMSubmissionData): Promise<void>;
  triggerAutomation(event: AutomationEvent): Promise<void>;
}

/* ─── Intent Classification ─── */

export function classifyIntent(
  scoring: ScoringResult,
  requestedContact: boolean
): "high_intent" | "medium_intent" | "low_intent" {
  // High intent: explicitly requested contact OR high score (already invested, likely to buy)
  if (requestedContact || scoring.totalScore >= 75) {
    return "high_intent";
  }

  // Medium intent: developing or structured — aware of gaps, open to help
  if (scoring.totalScore >= 50) {
    return "medium_intent";
  }

  // Low intent: ad-hoc — needs education first
  return "low_intent";
}

/* ─── Console CRM Provider (V1 default) ─── */

export class ConsoleCRMProvider implements CRMProvider {
  async syncSubmission(data: CRMSubmissionData): Promise<void> {
    console.log("━━━ CRM SYNC ━━━");
    console.log(`Contact: ${data.contact.firstName} ${data.contact.lastName}`);
    console.log(`Email:   ${data.contact.email}`);
    console.log(`Company: ${data.contact.company}`);
    console.log(`Score:   ${data.scoring.totalScore}% — ${data.scoring.bandTitle}`);
    console.log(`Weak:    ${data.scoring.weakAreas.join(", ")}`);
    console.log(`Intent:  ${classifyIntent(data.scoring, data.requestedContact)}`);
    console.log("━━━━━━━━━━━━━━━━");
  }

  async triggerAutomation(event: AutomationEvent): Promise<void> {
    console.log("━━━ AUTOMATION EVENT ━━━");
    console.log(`Type:    ${event.type}`);
    console.log(`Contact: ${event.data.contact.email}`);

    switch (event.type) {
      case "high_intent":
        console.log("→ ACTION: Sales alert — immediate follow-up required");
        break;
      case "medium_intent":
        console.log("→ ACTION: Nurture sequence — relevant content + CTA");
        break;
      case "low_intent":
        console.log("→ ACTION: Education track — assessment summary + resources");
        break;
      case "submission_complete":
        console.log("→ ACTION: Thank-you email with results link");
        break;
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━");
  }
}

/* ─── Webhook CRM Provider (Phase 2) ─── */

export class WebhookCRMProvider implements CRMProvider {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async syncSubmission(data: CRMSubmissionData): Promise<void> {
    await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "assessment_submission",
        ...data,
      }),
    });
  }

  async triggerAutomation(event: AutomationEvent): Promise<void> {
    await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: `automation_${event.type}`,
        ...event.data,
      }),
    });
  }
}

/* ─── Snov.io CRM Provider ─── */

/**
 * Pushes submissions to Snov.io prospect lists, replacing the old Sanity
 * `assessmentSubmission` / `toolSubmission` writes.
 *
 * Uses OAuth 2.0 client-credentials flow. Access tokens are cached in-memory
 * per process for their full lifetime (~1h); on 401 they are re-minted.
 *
 * Two lists are configured via env:
 *   SNOVIO_LIST_ID_ASSESSMENT — full maturity-assessment submissions
 *   SNOVIO_LIST_ID_TOOL       — lead-magnet and process tool submissions
 *
 * Failures are logged and swallowed inside syncSubmission — CRM push is a
 * best-effort activation and must never break the archive response. Callers
 * must already have consent (consentGiven === true) before routing a
 * submission through this provider.
 *
 * Endpoint paths are based on the Snov.io public API as of early 2026.
 * Verify against current docs before production deploy — adjust the two
 * SNOVIO_* URL constants below if they've shifted.
 */

const SNOVIO_TOKEN_URL = "https://api.snov.io/v1/oauth/access_token";
const SNOVIO_ADD_PROSPECT_URL = "https://api.snov.io/v1/add-prospect-to-list";

interface SnovioTokenCache {
  token: string;
  expiresAt: number;
}

export class SnovioCRMProvider implements CRMProvider {
  private clientId: string;
  private clientSecret: string;
  private assessmentListId: string | null;
  private toolListId: string | null;
  private tokenCache: SnovioTokenCache | null = null;

  constructor(opts: {
    clientId: string;
    clientSecret: string;
    assessmentListId?: string | null;
    toolListId?: string | null;
  }) {
    this.clientId = opts.clientId;
    this.clientSecret = opts.clientSecret;
    this.assessmentListId = opts.assessmentListId ?? null;
    this.toolListId = opts.toolListId ?? null;
  }

  private async getAccessToken(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.tokenCache &&
      this.tokenCache.expiresAt - 60_000 > now
    ) {
      return this.tokenCache.token;
    }

    const res = await fetch(SNOVIO_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Snov.io token request failed: ${res.status} ${body}`);
    }

    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };

    if (!data.access_token) {
      throw new Error("Snov.io token response missing access_token");
    }

    this.tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in ?? 3600) * 1000,
    };
    return data.access_token;
  }

  private async pushToList(
    listId: string,
    prospect: {
      email: string;
      firstName?: string;
      lastName?: string;
      customFields?: Record<string, unknown>;
    },
  ): Promise<void> {
    const doCall = async (token: string) => {
      return fetch(SNOVIO_ADD_PROSPECT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          access_token: token,
          listId,
          email: prospect.email,
          firstName: prospect.firstName ?? "",
          lastName: prospect.lastName ?? "",
          customFields: prospect.customFields ?? {},
        }),
      });
    };

    let token = await this.getAccessToken();
    let res = await doCall(token);

    if (res.status === 401) {
      token = await this.getAccessToken(true);
      res = await doCall(token);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Snov.io add-prospect failed: ${res.status} ${body}`);
    }
  }

  async syncSubmission(data: CRMSubmissionData): Promise<void> {
    const email = data.contact.email?.trim();
    if (!email) return;

    const listId = this.assessmentListId;
    if (!listId) {
      console.warn("[Snov.io] SNOVIO_LIST_ID_ASSESSMENT not set — skipping");
      return;
    }

    const intent = classifyIntent(data.scoring, data.requestedContact);

    try {
      await this.pushToList(listId, {
        email,
        firstName: data.contact.firstName,
        lastName: data.contact.lastName,
        customFields: {
          source: "ecm.dev assessment",
          assessmentTitle: data.assessmentTitle,
          submissionId: data.submissionId,
          totalScore: data.scoring.totalScore,
          bandTitle: data.scoring.bandTitle,
          bandLevel: data.scoring.bandLevel,
          weakAreas: data.scoring.weakAreas.join(", "),
          intent,
          company: data.contact.company ?? "",
          role: data.contact.role ?? "",
          utmSource: data.tracking.utmSource ?? "",
          utmCampaign: data.tracking.utmCampaign ?? "",
          landingPage: data.tracking.landingPage ?? "",
          requestedContact: data.requestedContact ? "true" : "false",
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("[Snov.io] syncSubmission failed (non-blocking):", err);
    }
  }

  async triggerAutomation(event: AutomationEvent): Promise<void> {
    // Intent is already tagged via customFields.intent on the prospect row,
    // so this stays a no-op until we wire per-intent Snov.io campaigns.
    void event;
  }

  /**
   * Direct entry point for tool submissions (lead-magnet, process), which
   * don't carry a ScoringResult. The CRMProvider interface is scoring-shaped,
   * so tool routes call this method directly.
   */
  async pushToolProspect(params: {
    toolType: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    role?: string;
    consentVersion?: string;
  }): Promise<void> {
    const listId = this.toolListId;
    if (!listId) {
      console.warn("[Snov.io] SNOVIO_LIST_ID_TOOL not set — skipping");
      return;
    }
    try {
      await this.pushToList(listId, {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        customFields: {
          source: `ecm.dev tool: ${params.toolType}`,
          toolType: params.toolType,
          company: params.company ?? "",
          role: params.role ?? "",
          consentVersion: params.consentVersion ?? "",
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("[Snov.io] pushToolProspect failed (non-blocking):", err);
    }
  }
}

/* ─── Factory ─── */

export function getCRMProvider(): CRMProvider {
  const snovioId = process.env.SNOVIO_CLIENT_ID;
  const snovioSecret = process.env.SNOVIO_CLIENT_SECRET;

  if (snovioId && snovioSecret) {
    return new SnovioCRMProvider({
      clientId: snovioId,
      clientSecret: snovioSecret,
      assessmentListId: process.env.SNOVIO_LIST_ID_ASSESSMENT ?? null,
      toolListId: process.env.SNOVIO_LIST_ID_TOOL ?? null,
    });
  }

  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  if (webhookUrl) {
    return new WebhookCRMProvider(webhookUrl);
  }

  return new ConsoleCRMProvider();
}
