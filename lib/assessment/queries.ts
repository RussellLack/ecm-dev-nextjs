import { client } from "../sanity";

/**
 * Fetch a full assessment with all sections, questions, options,
 * and dereferenced dimension data for scoring.
 */
export async function getAssessment(slug: string) {
  // Fetch the assessment with raw dimension references (not dereferenced)
  // because deeply nested inline references don't always dereference in GROQ.
  const assessment = await client.fetch(
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
  const dimensions = await client.fetch(
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
  let bands = await client.fetch(
    `*[_type == "maturityBand" && assessment._ref == $assessmentId] | order(level asc){
      _id, title, level, minScore, maxScore, headline, description, color
    }`,
    { assessmentId }
  );

  if (!bands?.length) {
    bands = await client.fetch(
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
  return client.fetch(
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
  return client.fetch(
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
 * Fetch a submission by ID for the results page.
 */
export async function getSubmission(submissionId: string) {
  return client.fetch(
    `*[_type == "assessmentSubmission" && _id == $submissionId][0]{
      _id,
      assessment->{
        _id,
        title,
        slug,
        resultsIntro,
        resultsCtaHeading,
        resultsCtaBody
      },
      submittedAt,
      firstName,
      lastName,
      email,
      company,
      totalScore,
      bandLevel,
      bandTitle,
      dimensionScores,
      weakAreas,
      requestedContact
    }`,
    { submissionId }
  );
}

/**
 * Fetch all assessments for the listing page.
 */
export async function getAllAssessments() {
  return client.fetch(
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
  return client.fetch(
    `*[_type == "assessment" && defined(slug.current)]{
      "slug": slug.current
    }`
  );
}
