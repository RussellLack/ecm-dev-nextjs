import type {
  AnswerEntry,
  SanityAssessment,
  SanityMaturityBand,
  SanityServiceRecommendation,
  SanityQuestion,
  DimensionScore,
  ScoringResult,
  Recommendation,
} from "./types";

/**
 * Extract the dimension key string from a dimension score object.
 * Handles both `{ key: { current: "..." } }` (slug) and `{ key: "..." }` (string) shapes.
 */
function getDimensionKey(dimension: any): string | null {
  if (!dimension) return null;
  if (typeof dimension.key === "string") return dimension.key;
  if (dimension.key?.current) return dimension.key.current;
  // Try slug field name
  if (dimension.slug?.current) return dimension.slug.current;
  return null;
}

/**
 * Calculate maturity scores from a set of answers against an assessment.
 */
export function calculateScores(
  answers: AnswerEntry[],
  assessment: SanityAssessment,
  bands: SanityMaturityBand[],
  recommendations: SanityServiceRecommendation[]
): ScoringResult {
  // Flatten all questions from all sections
  const allQuestions = assessment.sections.flatMap((s) => s.questions);

  // Build lookup: questionId → question
  const questionMap = new Map<string, SanityQuestion>();
  for (const q of allQuestions) {
    questionMap.set(q.questionId, q);
  }

  // Build lookup: answers by questionId
  const answerMap = new Map<string, string>();
  for (const a of answers) {
    answerMap.set(a.questionId, a.optionId);
  }

  // Accumulators
  const dimensionActual: Record<string, number> = {};
  const dimensionMax: Record<string, number> = {};
  const dimensionTitles: Record<string, string> = {};

  // Process each question that has an answer
  answerMap.forEach((optionId, questionId) => {
    const question = questionMap.get(questionId);
    if (!question) return;

    const selectedOption = question.options.find(
      (o) => o.optionId === optionId
    );
    if (!selectedOption) return;

    // Add actual points from selected option
    for (const ds of selectedOption.dimensionScores || []) {
      if (!ds.dimension) continue; // skip if dimension dereference failed
      const key = getDimensionKey(ds.dimension);
      if (!key) {
        console.warn("Scoring: could not extract dimension key from:", JSON.stringify(ds.dimension));
        continue;
      }
      dimensionTitles[key] = ds.dimension.title || key;
      dimensionActual[key] = (dimensionActual[key] || 0) + ds.points;
    }

    // Calculate max possible for this question (best single option)
    const maxPoints = getMaxPointsPerDimension(question);
    for (const [key, pts] of Object.entries(maxPoints)) {
      dimensionMax[key] = (dimensionMax[key] || 0) + pts;
    }
  });

  // Calculate dimension percentage scores
  const dimensionScores: DimensionScore[] = [];
  const allKeys = Array.from(
    new Set([
      ...Object.keys(dimensionActual),
      ...Object.keys(dimensionMax),
    ])
  );

  for (const key of allKeys) {
    const actual = dimensionActual[key] || 0;
    const max = dimensionMax[key] || 1; // avoid division by zero
    const score = Math.round((actual / max) * 100);
    dimensionScores.push({
      dimensionKey: key,
      dimensionTitle: dimensionTitles[key] || key,
      score,
    });
  }

  // Sort by score ascending for weak area identification
  dimensionScores.sort((a, b) => a.score - b.score);

  // Total score = mean of dimension percentages
  const totalScore =
    dimensionScores.length > 0
      ? Math.round(
          dimensionScores.reduce((sum, d) => sum + d.score, 0) /
            dimensionScores.length
        )
      : 0;

  // Assign maturity band
  const sortedBands = [...bands].sort((a, b) => a.level - b.level);
  const band =
    sortedBands.find(
      (b) => totalScore >= b.minScore && totalScore <= b.maxScore
    ) || sortedBands[0];

  // Weakest areas (bottom 3)
  const weakAreas = dimensionScores.slice(0, 3).map((d) => d.dimensionKey);

  // Map recommendations
  const mappedRecommendations = mapRecommendations(
    weakAreas,
    band.level,
    recommendations,
    dimensionTitles
  );

  // Re-sort dimensions by score descending for display
  dimensionScores.sort((a, b) => b.score - a.score);

  return {
    totalScore,
    dimensionScores,
    bandLevel: band.level,
    bandTitle: band.title,
    bandHeadline: band.headline || "",
    bandDescription: band.description || "",
    bandColor: band.color || "#6B7280",
    weakAreas,
    recommendations: mappedRecommendations,
  };
}

/**
 * For a given question, find the maximum points available per dimension
 * by examining all options.
 */
function getMaxPointsPerDimension(
  question: SanityQuestion
): Record<string, number> {
  const maxByDimension: Record<string, number> = {};

  for (const option of question.options) {
    for (const ds of option.dimensionScores || []) {
      if (!ds.dimension) continue;
      const key = getDimensionKey(ds.dimension);
      if (!key) continue;
      if (!maxByDimension[key] || ds.points > maxByDimension[key]) {
        maxByDimension[key] = ds.points;
      }
    }
  }

  return maxByDimension;
}

/**
 * Map weak dimension areas to service recommendations,
 * filtered by band level and sorted by priority.
 */
function mapRecommendations(
  weakAreas: string[],
  bandLevel: number,
  allRecommendations: SanityServiceRecommendation[],
  dimensionTitles: Record<string, string>
): Recommendation[] {
  const results: Recommendation[] = [];

  for (const dimKey of weakAreas) {
    const matching = allRecommendations
      .filter((r) => {
        const recKey = getDimensionKey(r.dimension);
        return recKey === dimKey && bandLevel <= r.minBandLevel;
      })
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));

    for (const rec of matching.slice(0, 2)) {
      const categoryToHref: Record<string, string> = {
        technology: "/content-technology",
        services: "/content-services",
        localization: "/content-localization",
      };

      results.push({
        title: rec.title,
        summary: rec.summary || "",
        dimensionKey: dimKey,
        dimensionTitle: dimensionTitles[dimKey] || dimKey,
        serviceHref: rec.service
          ? categoryToHref[rec.service.category] || "/contact"
          : undefined,
        serviceTitle: rec.service?.title,
      });
    }
  }

  return results;
}
