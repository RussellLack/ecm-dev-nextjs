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
import intelSource from "./intelSource";
import intelTopic from "./intelTopic";
import intelVendor from "./intelVendor";
import intelArticle from "./intelArticle";

export const schemaTypes = [
  homePage,
  service,
  servicePackage,
  caseStudy,
  post,
  guide,
  // Assessment system
  assessment,
  maturityDimension,
  maturityBand,
  serviceRecommendation,
  assessmentSubmission,
  toolSubmission,
  // Content Intelligence Engine
  intelSource,
  intelTopic,
  intelVendor,
  intelArticle,
  // Shared objects
  seo,
];
