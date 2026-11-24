import { toPostItem } from './post-item';
import { categories } from './site-info';
import type { SitePost } from './site-posts';
import type { LinkItem } from './types';

export interface PostHeader {
    /** [11 Oct 2026][Rant], plus [Draft] while previewing a draft. */
    meta: LinkItem['meta'];
    /** The description, unless it only repeats the title. */
    summary?: string;
    /** The section the post belongs to, for "back" links. */
    section: { href: string; name: string };
}

export function toPostHeader(post: SitePost): PostHeader {
    const { href, heading } = categories[post.category];
    const repeatsTitle = post.description?.trim().toLowerCase() === post.title.trim().toLowerCase();
    return {
        meta: [...toPostItem(post).meta, ...(post.draft ? [{ text: 'Draft' }] : [])],
        summary: repeatsTitle ? undefined : post.description,
        section: { href, name: `${heading.lead} ${heading.accent}` },
    };
}
