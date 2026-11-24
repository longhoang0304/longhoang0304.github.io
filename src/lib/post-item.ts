import { categories } from './content';
import { formatFullDate } from './format-date';
import type { LinkItem, Post } from './types';

/**
 * A post as a LinkList row: [Oct 11, 2026][Rant] Title. Lists of a single category
 * leave the category out: [Oct 11, 2026] Title.
 */
export function toPostItem(post: Post, withCategory = true): LinkItem {
    const date = { text: formatFullDate(post.date), datetime: post.date };
    return {
        href: post.href,
        title: post.title,
        meta: withCategory ? [date, { text: categories[post.category].label }] : [date],
    };
}
