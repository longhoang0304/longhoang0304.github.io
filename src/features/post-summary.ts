import type { Post } from './types';

/** The post's description, unless it only repeats the title shown right above it (post page header). */
export function summaryOf(post: Post): string | undefined {
    const description = post.description?.trim();
    if (!description || description.toLowerCase() === post.title.trim().toLowerCase()) return undefined;
    return description;
}
