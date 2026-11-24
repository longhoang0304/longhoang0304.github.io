import type { SitePost } from './site-posts';

export interface Neighbours {
    newer?: SitePost;
    older?: SitePost;
}

/** The posts either side of `post` in a section's list (newest first). */
export function getNeighbours(posts: SitePost[], post: SitePost): Neighbours {
    const i = posts.findIndex((p) => p.href === post.href);
    return { newer: posts[i - 1], older: posts[i + 1] };
}
