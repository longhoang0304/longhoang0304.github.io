import { getNeighbours } from './post-neighbours';
import { readingMinutes } from './reading-time';
import { getVisibleEntries, toSitePost, type PostCollection } from './site-posts';

/** getStaticPaths for a collection's post pages: /<section>/<id>-<slug>. */
export async function getPostPages(collection: PostCollection) {
    const entries = await getVisibleEntries(collection);
    const posts = entries.map((entry) => toSitePost(collection, entry)).sort((a, b) => b.date.localeCompare(a.date));

    return entries.map((entry) => {
        const post = toSitePost(collection, entry);
        return {
            params: { id: entry.data.postId, slug: entry.data.postSlug },
            props: { entry, post, minutes: readingMinutes(entry.body), neighbours: getNeighbours(posts, post) },
        };
    });
}
