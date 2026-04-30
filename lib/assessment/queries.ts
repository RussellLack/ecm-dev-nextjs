import "server-only";
import { sanityFetch } from "../sanity.server";
import {
  getSubmissionRecord,
  type AssessmentSubmissionRecord,
  type ToolSubmissionRecord,
} from "../submissions.server";

/**
 * Fetch a full assessment with all sections, questions, options,
 * and dereferenced dimension data for scoring.
 */
export async function getAssessment(slug: string) {
  // Fetch the assessment with raw dimension references (not dereferenced)
  // because deeply nested inline references don't always dereference in GROQ.
  const assessment = await sanityFetch<any>(
    `*[_type == "assessment" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      subtitle,
      introText,
      estimatedMinutes,
      resultsIntro,
      resultsCtaHeading,
      resultsCtaBody,
      seo { metaTitle, metaDescription, ogImage, noIndex },
      sections[]{
        _key,
        title,
        description,
        questions[]{
          _key,
          questionId,
          text,
          helpText,
          inputType,
          conditionalOn,
          options[]{
            _key,
            optionId,
            label,
            dimensionScores[]{
              points,
              "dimensionRef": dimension._ref
            }
          }
        }
      }
    }`,
    { slug }
  );

  if (!assessment) return null;

  // Fetch all dimensions and build a lookup map
  const dimensions = await sanityFetch<Array<{ _id: string; title: string; key: string }>>(
    `*[_type == "maturityDimension"]{_id, title, key}`
  );
  const dimMap = new Map<string, any>();
  for (const d of dimensions) {
    dimMap.set(d._id, d);
  }

  // Hydrate the dimension references inline
  if (assessment.sections) {
    for (const section of assessment.sections) {
      for (const question of section.questions || []) {
        for (const option of question.options || []) {
          for (const ds of option.dimensionScores || []) {
            const dim = dimMap.get(ds.dimensionRef);
            ds.dimension = dim || null;
            delete ds.dimensionRef;
          }
        }
      }
    }
  }

  return assessment;
}

/**
 * Fetch all maturity bands for a given assessment, ordered by level.
 */
export async function getMaturityBands(assessmentId: string) {
  // Try by reference first, fall back to all bands if references aren't linked
  let bands = await sanityFetch<any[]>(
    `*[_type == "maturityBand" && assessment._ref == $assessmentId] | order(level asc){
      _id, title, level, minScore, maxScore, headline, description, color
    }`,
    { assessmentId }
  );

  if (!bands?.length) {
    bands = await sanityFetch<any[]>(
      `*[_type == "maturityBand"] | order(level asc){
        _id, title, level, minScore, maxScore, headline, description, color
      }`
    );
  }

  return bands;
}

/**
 * Fetch all service recommendations with dereferenced dimensions and services.
 */
export async function getServiceRecommendations() {
  return sanityFetch(
    `*[_type == "serviceRecommendation"] | order(priority asc){
      _id,
      title,
      summary,
      priority,
      minBandLevel,
      dimension->{
        _id,
        title,
        key
      },
      service->{
        title,
        category
      }
    }`
  );
}

/**
 * Fetch all maturity dimensions, ordered for display.
 */
export async function getMaturityDimensions() {
  return sanityFetch(
    `*[_type == "maturityDimension"] | order(order asc){
      _id,
      title,
      key,
      description,
      icon
    }`
  );
}

/**
 * Fetch an assessment submission by ID for the results page.
 *
 * Now reads from Netlify Blobs rather than Sanity. The record shape is a
 * drop-in match for the old Sanity GROQ projection, so results pages, the
 * PDF route, and the report route don't have to change.
 */
export async function getSubmission(submissionId: string) {
  const record = await getSubmissionRecord(submissionId);
  if (!record || record.kind !== "assessment") return null;
  const r = record as AssessmentSubmissionRecord;
  return {
    _id: r._id,
    assessment: r.assessment,
    submittedAt: r.submittedAt,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    company: r.company,
    totalScore: r.totalScore,
    bandLevel: r.bandLevel,
    bandTitle: r.bandTitle,
    dimensionScores: r.dimensionScores,
    weakAreas: r.weakAreas,
    requestedContact: r.requestedContact,
  };
}

/**
 * Fetch a tool submission (Process / Lead Magnet) by ID for the results page.
 *
 * Reads from Netlify Blobs. Returns the same shape as the old Sanity query,
 * including `answers` and `results` as JSON strings — the UI parses them.
 */
export async function getToolSubmission(submissionId: string) {
  const record = await getSubmissionRecord(submissionId);
  if (!record || record.kind !== "tool") return null;
  const r = record as ToolSubmissionRecord;
  return {
    _id: r._id,
    toolType: r.toolType,
    submittedAt: r.submittedAt,
    name: r.name,
    email: r.email,
    role: r.role,
    company: r.company,
    answers: r.answers,
    results: r.results,
  };
}

/**
 * Fetch all assessments for the listing page.
 */
export async function getAllAssessments() {
  return sanityFetch(
    `*[_type == "assessment" && defined(slug.current)] | order(_createdAt desc){
      _id,
      title,
      slug,
      subtitle,
      introText,
      estimatedMinutes,
      "questionCount": count(sections[].questions[])
    }`
  );
}

/**
 * Fetch all assessment slugs for static generation.
 */
export async function getAllAssessmentSlugs() {
  return sanityFetch(
    `*[_type == "assessment" && defined(slug.current)]{
      "slug": slug.current
    }`
  );
}

/**
 * Assessments for a given pillar (drives cluster sections on pillar pages).
 *
 * Editor-published assessments only; the three hardcoded tools on
 * /assessments (process, lead-magnet, localisation-cost) are linked in by
 * pillar pages directly since they don't live in Sanity.
 */
export async function getAssessmentsByPillar(pillar: string, limit = 4) {
  return sanityFetch(
    `*[_type == "assessment" && defined(slug.current) && $pillar in pillars[]]
      | order(_createdAt desc)[0...$limit]{
      _id, title, slug, subtitle, introText, estimatedMinutes
    }`,
    { pillar, limit }
  );
}
