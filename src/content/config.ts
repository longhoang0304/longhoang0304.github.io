import { defineCollection, z } from "astro:content";


export const blogSchema = z
  .object({
    blogId: z.string(),
    blogSlug: z.string(),
    title: z.string(),
    publishedDateTime: z.date(),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().default(false),
    description: z.string().optional(),
  })
  .strict();

const blog = defineCollection({
  schema: blogSchema,
});

export const collections = { blog };