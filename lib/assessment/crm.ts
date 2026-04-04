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

/* ─── Factory ─── */

export function getCRMProvider(): CRMProvider {
  const webhookUrl = process.env.CRM_WEBHOOK_URL;

  if (webhookUrl) {
    return new WebhookCRMProvider(webhookUrl);
  }

  return new ConsoleCRMProvider();
}
