import type { Posts } from "@types";
import type { CollectionEntry } from "astro:content";
import dayjs from "dayjs";


export const removeDraft = (posts: CollectionEntry<"blog">[]) => posts
    .filter(({ data }, ..._) => !data.draft);

export const getSortedPosts = (posts: Posts) => posts
    .sort((a, b) => a.date.diff(b.date));

export const getPostById = (posts: Posts, id?: string) => posts.find(post => post.postId == id)

export const getAllTags = (posts: Posts): string[] => {
  const tags = new Set<string>();
  posts.forEach(post => post.tags.forEach(tag => tags.add(tag)))
  return [...tags];
}

export const transformPostCollectionToPosts = (posts: CollectionEntry<"blog">[]) => posts
    .map(post => {
      const { data } = post;
      const postDate = dayjs(data.publishedDateTime);

      return {
        ...data,
        date: postDate,
        formatedDate: postDate.format("DD-MM-YYYY"),
      };
    })