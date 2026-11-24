import type { CollectionEntry } from "astro:content";
import type { Dayjs } from "dayjs";

export type Post = {
  postId: string;
  postSlug: string;
  title: string;
  date: Dayjs;
  formatedDate: string;
  tags: string[];
  draft: boolean;
  description?: string;
  originalPost: CollectionEntry<"rants" | "projects" | "research">,
};

export type Posts = Post[];
