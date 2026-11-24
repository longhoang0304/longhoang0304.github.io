import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";


export const postSchema = z
  .object({
    postId: z.string(),
    postSlug: z.string(),
    title: z.string(),
    publishedDateTime: z.date(),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    // The kind of content: a "post" reads as an article; a "paper" gets the research-paper
    // look (abstract, keywords, numbered sections, serif text).
    type: z.enum(["post", "paper"]).default("post"),
  })
  .strict();

const rants = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/rants" }),
  schema: postSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: postSchema,
});

// Long-form research write-ups. The "RFC - *" originals kept in the same folder are
// source material, not posts, so they're excluded.
const research = defineCollection({
  loader: glob({ pattern: ["**/*.md", "!RFC - *"], base: "./src/content/research" }),
  schema: postSchema,
});

export const collections = { rants, projects, research };
