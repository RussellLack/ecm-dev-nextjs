import homePage from "./homePage";
import service from "./service";
import servicePackage from "./servicePackage";
import caseStudy from "./caseStudy";
import post from "./post";
import guide from "./guide";
import assessment from "./assessment";
import maturityDimension from "./maturityDimension";
import maturityBand from "./maturityBand";
import serviceRecommendation from "./serviceRecommendation";
import assessmentSubmission from "./assessmentSubmission";
import toolSubmission from "./toolSubmission";
import seo from "./seo";
import internalLink from "./internalLink";
import platform from "./platform";

export const schemaTypes = [
  homePage,
  service,
  servicePackage,
  caseStudy,
  post,
  guide,
  platform,
  // Assessment system
  assessment,
  maturityDimension,
  maturityBand,
  serviceRecommendation,
  assessmentSubmission,
  toolSubmission,
  // Shared objects
  seo,
  internalLink,
];
