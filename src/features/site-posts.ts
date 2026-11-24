// Real posts from the content collections, in the new design's Post shape (build time only).

import { getCollection, type CollectionEntry } from 'astro:content';
import { removeDraft } from '@utils/posts';
import type { Category, Post } from './types';

export interface SitePost extends Post {
    description?: string;
    tags: string[];
}

type PostCollection = 'rants' | 'projects' | 'research';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** Each collection's category and the path its post pages live under. */
const sources: Record<PostCollection, { category: Category; path: string }> = {
    rants: { category: 'rant', path: '/rants' },
    projects: { category: 'project', path: '/projects' },
    research: { category: 'research', path: '/research' },
};

async function load(collection: PostCollection): Promise<SitePost[]> {
    const { category, path } = sources[collection];
    const all: CollectionEntry<PostCollection>[] = await getCollection(collection);
    // Matches the post routes: drafts are previewable in dev, never built for production.
    const visible = import.meta.env.DEV ? all : removeDraft(all);

    return visible.map(({ data }) => ({
        date: isoDate(data.publishedDateTime),
        category,
        title: data.title,
        href: `${path}/${data.postId}-${data.postSlug}`,
        description: data.description,
        tags: data.tags,
    }));
}

/** Published rants, projects and research, newest first. */
export async function getSitePosts(): Promise<SitePost[]> {
    const posts = (await Promise.all((Object.keys(sources) as PostCollection[]).map(load))).flat();
    return posts.sort((a, b) => b.date.localeCompare(a.date));
}
