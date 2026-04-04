# Content Operations Maturity Assessment — System Architecture

## 1. Architecture Overview

The assessment platform is a five-layer system built on the existing ECM.dev Next.js + Sanity stack.

```
┌─────────────────────────────────────────────────┐
│  CONTENT LAYER (Sanity CMS)                     │
│  Questions, answers, scoring rules, bands,      │
│  recommendations — all editable by non-devs     │
├─────────────────────────────────────────────────┤
│  EXPERIENCE LAYER (Next.js App Router)          │
│  Multi-step assessment UI, progress tracking,   │
│  conditional logic, results page                │
├─────────────────────────────────────────────────┤
│  PROCESSING LAYER (Server Actions / API Routes) │
│  Score calculation, band assignment, result      │
│  generation, validation                         │
├─────────────────────────────────────────────────┤
│  DATA LAYER (Sanity Mutations + CRM Abstraction)│
│  Structured submission storage, CRM sync,       │
│  lead enrichment                                │
├─────────────────────────────────────────────────┤
│  ACTIVATION LAYER (Email + Sales Routing)       │
│  Journey triggers, sales alerts, nurture flows  │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Content-driven, not code-driven.** Every question, answer option, scoring weight, maturity band description, and recommendation lives in Sanity. No business logic is hardcoded in the frontend. This means Russell (or any content editor) can modify the assessment without deploying code.

2. **Single assessment schema, multi-assessment capable.** The data model supports multiple assessments from day one via the `assessment` document type. V1 ships one assessment; the schema already handles N.

3. **Server-side scoring.** Scores are calculated on the server, never in the browser. This prevents gaming, allows complex weighted calculations, and keeps the scoring algorithm private.

4. **CRM-agnostic integration.** A generic `CRMProvider` interface abstracts the CRM layer. Swap HubSpot for Salesforce or a webhook with one file change.

5. **UTM + source tracking baked in.** Tracking metadata flows through every layer from URL parameters to CRM fields.

---

## 2. Sanity Schema Design

### Schema Map

```
assessment (document)
  └── sections: assessmentSection[]
        └── questions: assessmentQuestion[]
              └── options: assessmentAnswerOption[]
                    └── dimensionScores: { dimension → points }

maturityDimension (document)
maturityBand (document)
serviceRecommendation (document)
assessmentSubmission (document)
```

### Why Each Schema Exists

| Schema | Purpose |
|--------|---------|
| `assessment` | Top-level container. Allows multiple assessments (Content Ops, AI Readiness, etc.) |
| `assessmentSection` | Groups questions into logical steps. Controls UI flow and progress. |
| `assessmentQuestion` | The question itself. Supports single-select, multi-select, and conditional display. |
| `assessmentAnswerOption` | Each selectable answer. Carries weighted scores mapped to dimensions. |
| `maturityDimension` | The scoring axes (Strategy, Governance, etc.). Reusable across assessments. |
| `maturityBand` | The four maturity levels with score thresholds and content. |
| `serviceRecommendation` | Maps weak dimensions to ECM.dev services with tailored messaging. |
| `assessmentSubmission` | Stores every completed assessment with scores, answers, and contact info. |

### Scoring Dimensions (Default Set)

1. **Strategy** — Is content treated as infrastructure or ad-hoc output?
2. **Governance** — Are there standards, ownership, and lifecycle management?
3. **Workflow** — Are content operations repeatable and efficient?
4. **Technology** — Is the tech stack fit-for-purpose and integrated?
5. **Measurement** — Is content performance tracked and acted on?
6. **AI Readiness** — Is content structured for AI consumption?

### Maturity Bands

| Band | Score Range | Label |
|------|------------|-------|
| 1 | 0–25% | Ad Hoc |
| 2 | 26–50% | Developing |
| 3 | 51–75% | Structured |
| 4 | 76–100% | Optimised |

---

## 3. Scoring System

### Algorithm (Pseudocode)

```
function calculateScores(answers, questions):
  dimensionTotals = {}    // actual points scored per dimension
  dimensionMaximums = {}  // maximum possible per dimension

  for each answer in answers:
    question = findQuestion(answer.questionId, questions)
    selectedOption = findOption(answer.optionId, question)

    for each { dimension, points } in selectedOption.dimensionScores:
      dimensionTotals[dimension] += points

    // Track max possible from this question
    maxOption = question.options.maxBy(sum of dimensionScores)
    for each { dimension, points } in maxOption.dimensionScores:
      dimensionMaximums[dimension] += points

  // Calculate percentage scores
  dimensionScores = {}
  for each dimension in dimensionTotals:
    dimensionScores[dimension] = (dimensionTotals[dimension] / dimensionMaximums[dimension]) * 100

  totalScore = average(dimensionScores.values)

  // Assign maturity band
  band = maturityBands.find(b => totalScore >= b.minScore && totalScore <= b.maxScore)

  // Identify weakest areas (bottom 2-3 dimensions)
  weakAreas = dimensionScores.sortAsc().take(3)

  // Map weak areas to service recommendations
  recommendations = weakAreas.map(d => serviceRecommendations.filter(r => r.dimension == d))

  return { totalScore, dimensionScores, band, weakAreas, recommendations }
```

### Key Properties

- Each answer option contributes to 1+ dimensions with explicit point values
- Dimensions are scored as percentages (actual / maximum possible)
- Total score is the mean of all dimension percentages
- This normalises across dimensions regardless of question count per dimension
- Maturity band thresholds are stored in Sanity (editable)

---

## 4. Frontend Architecture

### Component Tree

```
app/assessment/[slug]/page.tsx          (Server: fetches assessment from Sanity)
  └── AssessmentShell (Client)          (Manages state, navigation, submission)
        ├── ProgressBar                 (Visual step progress)
        ├── SectionIntro                (Section title/description between groups)
        ├── QuestionRenderer            (Renders current question)
        │     ├── SingleSelect          (Radio-style options)
        │     └── MultiSelect           (Checkbox-style options)
        ├── NavigationControls          (Back / Next / Submit)
        └── LeadCaptureForm             (Final step: name, email, company, role)

app/assessment/[slug]/results/page.tsx  (Server: fetches submission + renders results)
  └── ResultsDashboard                  (Client: animated score reveals)
        ├── MaturityBadge               (Band label + icon)
        ├── DimensionChart              (Radar or bar chart of dimension scores)
        ├── WeakAreaCards               (Top problem areas with explanations)
        ├── RecommendationCards          (Mapped services)
        └── CTABlock                    (Contact / download report)
```

### UX Flow

1. User lands on `/assessment/content-operations-maturity`
2. Sees intro screen with assessment title + estimated time
3. Steps through questions one-at-a-time with progress bar
4. Section transitions show brief section intro cards
5. Final step: lead capture form (name, email, company, role, optional phone)
6. Submit → server calculates scores → creates submission → redirects to results
7. Results page renders personalised maturity report

---

## 5. Submission Flow

```
Browser                    Server                     Sanity              CRM
  │                          │                          │                  │
  │─── POST /api/assess ────▶│                          │                  │
  │    { answers, contact,   │                          │                  │
  │      tracking }          │                          │                  │
  │                          │── validate ──────────────▶│                  │
  │                          │── fetch assessment ──────▶│                  │
  │                          │◀── questions + options ───│                  │
  │                          │                          │                  │
  │                          │── calculateScores() ─────│                  │
  │                          │                          │                  │
  │                          │── create submission ─────▶│                  │
  │                          │◀── submission._id ────────│                  │
  │                          │                          │                  │
  │                          │── syncToCRM() ───────────────────────────▶│
  │                          │── triggerAutomation() ───────────────────▶│
  │                          │                          │                  │
  │◀── { submissionId } ─────│                          │                  │
  │                          │                          │                  │
  │─── redirect to results ──│                          │                  │
```

### Submission Payload

```typescript
interface SubmissionPayload {
  assessmentId: string;
  answers: Array<{ questionId: string; optionId: string }>;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    role?: string;
    phone?: string;
  };
  tracking: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    referrer?: string;
    landingPage?: string;
  };
}
```

---

## 6. CRM + Automation Design

### Generic CRM Interface

```typescript
interface CRMProvider {
  syncSubmission(data: CRMSubmissionData): Promise<void>;
  triggerAutomation(event: AutomationEvent): Promise<void>;
}
```

### Routing Logic

| Signal | Action |
|--------|--------|
| Score ≥ 75% + requested contact | → Sales alert (immediate) |
| Score 50-74% | → Nurture sequence + relevant content |
| Score < 50% | → Education track + assessment summary |
| Any submission | → Thank-you email with results link |

### CRM Fields

- Contact: name, email, company, role, phone
- Assessment: score, band, dimension scores (JSON), weak areas
- Tracking: UTM params, source, landing page, submission date
- Intent: requested_contact (boolean), score_band, time_to_complete

---

## 7. Implementation Roadmap

### Phase 1 (MVP) — This Build
- 1 assessment (Content Operations Maturity)
- All Sanity schemas
- Scoring engine
- Submission flow with Sanity storage
- Basic results page
- Console-logged CRM events (mock)
- UTM tracking capture

### Phase 2
- Multiple assessments
- Conditional question logic
- Improved results visualisation (radar chart)
- Real CRM integration (HubSpot / webhook)
- Email automation via Resend
- PDF report generation

### Phase 3
- Benchmarking against anonymised averages
- Admin dashboard for submission analytics
- AI-powered recommendation narratives
- Downloadable branded PDF reports
- Assessment versioning
