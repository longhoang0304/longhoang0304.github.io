import type { Neighbours } from './post-neighbours';
import type { LinkItem } from './types';

/** The newer and older posts as LinkList rows: [Newer] Title, [Older] Title. */
export function toNeighbourItems({ newer, older }: Neighbours): LinkItem[] {
    return [
        ...(newer ? [{ label: 'Newer', post: newer }] : []),
        ...(older ? [{ label: 'Older', post: older }] : []),
    ].map(({ label, post }) => ({ href: post.href, title: post.title, description: post.description, meta: [{ text: label }] }));
}
