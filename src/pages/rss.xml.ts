import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { transformPostCollectionToPosts, removeDraft, getSortedPosts } from "@utils/posts";

export async function get(context) {
  const postCollection = await getCollection("blog")
  const publishedPosts = removeDraft(postCollection)
  const transformedPosts = transformPostCollectionToPosts(publishedPosts)
  const sortedPost = getSortedPosts(transformedPosts)
  const rssItems = sortedPost.map(post => ({
    title: post.title,
    pubDate: post.date.toISOString(),
    description: post.description,
    link: `/post/${post.postId}/`,
    customData: post.tags.map(tag => `<tag>${tag}</tag>`).join(),
  }))

  return rss({
    // `<title>` field in output xml
    title: 'Long\'s Blog',
    // `<description>` field in output xml
    description: 'Long\'s rants',
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: rssItems,
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
    trailingSlash: true,
  });
}