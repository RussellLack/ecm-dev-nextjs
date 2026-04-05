import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import BlogClientPage from "./BlogClientPage";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on content operations, CMS architecture, AI-driven workflows, and enterprise content strategy from ECM.DEV.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts(100);
  return <BlogClientPage posts={blogPosts ?? []} />;
}
