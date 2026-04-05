import type { Metadata } from "next";
import { getGuides } from "@/lib/queries";
import GuidesClientPage from "./GuidesClientPage";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides on content infrastructure, governance, AI-ready operations, and content strategy from ECM.DEV.",
};

export default async function GuidesPage() {
  const guides = await getGuides();
  return <GuidesClientPage guides={guides ?? []} />;
}
