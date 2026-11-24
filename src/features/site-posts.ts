// Real posts from the content collections, in the new design's Post shape (build time only).

import { getCollection, type CollectionEntry } from 'astro:content';
import type { Category, Post } from './types';

export interface SitePost extends Post {
    tags: string[];
    draft: boolean;
}

export type PostCollection = 'rants' | 'projects' | 'research';
export type PostEntry = CollectionEntry<PostCollection>;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const removeDraft = (entries: PostEntry[]) => entries.filter(({ data }) => !data.draft);

/** Each collection's category and the path its post pages live under. */
const sources: Record<PostCollection, { category: Category; path: string }> = {
    rants: { category: 'rant', path: '/rants' },
    projects: { category: 'project', path: '/projects' },
    research: { category: 'research', path: '/research' },
};

/** Drafts are previewable in dev, never built for production. */
export async function getVisibleEntries(collection: PostCollection): Promise<PostEntry[]> {
    const all: PostEntry[] = await getCollection(collection);
    return import.meta.env.DEV ? all : removeDraft(all);
}

/** One collection entry in the site's Post shape. */
export function toSitePost(collection: PostCollection, { data }: PostEntry): SitePost {
    const { category, path } = sources[collection];
    return {
        date: isoDate(data.publishedDateTime),
        category,
        title: data.title,
        href: `${path}/${data.postId}-${data.postSlug}`,
        description: data.description,
        tags: data.tags,
        draft: data.draft,
    };
}

/** Published rants, projects and research, newest first. */
export async function getSitePosts(): Promise<SitePost[]> {
    const collections = Object.keys(sources) as PostCollection[];
    const posts = await Promise.all(
        collections.map(async (collection) => (await getVisibleEntries(collection)).map((entry) => toSitePost(collection, entry))),
    );
    return posts.flat().sort((a, b) => b.date.localeCompare(a.date));
}
