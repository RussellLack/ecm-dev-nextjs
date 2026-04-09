import imageUrlBuilder from "@sanity/image-url";

/**
 * Browser-safe Sanity helpers.
 *
 * This file no longer exports a fetch client. All GROQ queries must go
 * through `lib/sanity.server.ts`, which uses the read token and is guarded
 * by `import "server-only"`.
 *
 * The only thing that remains public is the image URL builder: it produces
 * URLs against `cdn.sanity.io`, which is always publicly accessible per
 * asset and doesn't require dataset read permission.
 */
const builder = imageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
});

export function urlFor(source: any) {
  return builder.image(source);
}
