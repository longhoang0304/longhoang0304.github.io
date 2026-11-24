import { getVisibleEntries, toSitePost, type PostCollection } from './site-posts';

/** getStaticPaths for a collection's post pages: /<section>/<id>-<slug>. */
export async function getPostPages(collection: PostCollection) {
    return (await getVisibleEntries(collection)).map((entry) => ({
        params: { id: entry.data.postId, slug: entry.data.postSlug },
        props: { entry, post: toSitePost(collection, entry) },
    }));
}
