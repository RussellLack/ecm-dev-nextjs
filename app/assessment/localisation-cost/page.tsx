import type { Metadata } from "next";
import EstimatorClient from "@/components/estimator/EstimatorClient";

export const metadata: Metadata = {
  title: "Localisation Cost Estimator | ECM.DEV",
  description:
    "A diagnostic tool for content operations leaders. Surfaces the five cost layers that traditional localisation calculators miss, and the AI-native operating model that could reshape them.",
  openGraph: {
    title: "Localisation Cost Estimator — ECM.DEV",
    description:
      "Six-layer cost model for content operations in multilingual, multichannel environments.",
    type: "website",
  },
};

export default function LocalisationCostPage() {
  return <EstimatorClient />;
}
