import { toPostItem } from './post-item';
import { RECENT_LIMIT } from './recent-posts';
import type { LinkItem } from './types';
import type { SitePost } from './site-posts';

/**
 * A post as a searchable LinkList row. features/search.ts reads the data-* fields; only the
 * newest RECENT_LIMIT rows start visible, as for an empty search.
 */
export function toSearchItem(post: SitePost, index: number): LinkItem {
    return {
        ...toPostItem(post),
        hidden: index >= RECENT_LIMIT,
        attrs: {
            'data-search-item': '',
            'data-title': post.title,
            'data-description': post.description,
            'data-tags': post.tags.join(' '),
        },
    };
}
