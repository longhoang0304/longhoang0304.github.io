// Real posts from the content collections, in the new design's Post shape (build time only).

import { getCollection } from 'astro:content';
import { removeDraft } from '@utils/posts';
import type { Post } from './types';

export interface SitePost extends Post {
    description?: string;
    tags: string[];
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Published blog and research posts, newest first. Blog posts count as rants (that's what
 * the old blog was). Research drafts are included in dev, matching their route.
 */
export async function getSitePosts(): Promise<SitePost[]> {
    const blog = removeDraft(await getCollection('blog'));
    const researchAll = await getCollection('research');
    const research = import.meta.env.DEV ? researchAll : removeDraft(researchAll);

    const posts: SitePost[] = [
        ...blog.map(({ data }) => ({
            date: isoDate(data.publishedDateTime),
            category: 'rant' as const,
            title: data.title,
            href: `/post/${data.postId}-${data.postSlug}`,
            description: data.description,
            tags: data.tags,
        })),
        ...research.map(({ data }) => ({
            date: isoDate(data.publishedDateTime),
            category: 'research' as const,
            title: data.title,
            href: `/research/${data.postId}-${data.postSlug}`,
            description: data.description,
            tags: data.tags,
        })),
    ];

    return posts.sort((a, b) => b.date.localeCompare(a.date));
}
