import { getSitePosts } from './site-posts';
import { getTagCounts } from './tag-counts';

/** getStaticPaths for /tag/<tag>: one page per tag, with its posts newest first. */
export async function getTagPages() {
    const posts = await getSitePosts();
    return getTagCounts(posts).map(({ tag }) => ({
        params: { tag },
        props: { tag, posts: posts.filter((post) => post.tags.some((t) => t.toLowerCase() === tag)) },
    }));
}
