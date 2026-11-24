import { getSitePosts, type SitePost } from './site-posts';
import type { Category } from './types';

/** Every visible post of one category, newest first. */
export async function getCategoryPosts(category: Category): Promise<SitePost[]> {
    return (await getSitePosts()).filter((post) => post.category === category);
}
