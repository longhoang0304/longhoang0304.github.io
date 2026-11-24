import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";


export const blogSchema = z
  .object({
    postId: z.string(),
    postSlug: z.string(),
    title: z.string(),
    publishedDateTime: z.date(),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().default(false),
    description: z.string().optional(),
  })
  .strict();

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: blogSchema,
});

// Long-form research write-ups. The "RFC - *" originals kept in the same folder are
// source material, not posts, so they're excluded.
const research = defineCollection({
  loader: glob({ pattern: ["**/*.md", "!RFC - *"], base: "./src/content/researchs" }),
  schema: blogSchema,
});

export const collections = { blog, research };
