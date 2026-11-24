import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@config';
import { categories, contentLicense } from '@features/site-info';
import { getSitePosts } from '@features/site-posts';

/** "Rant" and a "rant" tag are the same category to a feed reader. */
const uniqueIgnoringCase = (words: string[]) =>
  words.filter((word, i) => words.findIndex((w) => w.toLowerCase() === word.toLowerCase()) === i);

/** Every published rant, project and research post, newest first. */
export async function GET(context: APIContext) {
  const posts = await getSitePosts();

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(`${post.date}T00:00:00Z`),
      description: post.description,
      link: `${post.href}/`,
      categories: uniqueIgnoringCase([categories[post.category].label, ...post.tags]),
    })),
    customData: `<language>en-gb</language><copyright>© ${contentLicense.years}. Licensed under ${contentLicense.name}: ${contentLicense.url}</copyright>`,
    trailingSlash: true,
  });
}
