import type { Category, CategoryInfo, IconLink, NavLink } from './types';

export const location = 'Reading, UK';
export const timeZone = 'Europe/London';

export const links: NavLink[] = [
    { label: 'Rants', href: '/rants' },
    { label: 'Projects', href: '/projects' },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
];

/** For pages without the landing (whose own nav is the way around): lead with Home. */
export const linksWithHome: NavLink[] = [{ label: 'Home', href: '/' }, ...links];

export const githubUrl = 'https://github.com/longhoang0304';
export const linkedinUrl = 'https://www.linkedin.com/in/notlonghoang/';
export const email = 'hey@longhoang.me';
/** The year the site is built, so © notices stay current with each deploy. */
export const currentYear = new Date().getFullYear();

/** The year of the first post. */
const firstYear = 2023;

/** The license for the posts, their images and figures (see LICENSE); the code isn't licensed for reuse. */
export const contentLicense = {
    name: 'CC BY-NC-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    /** "2023–2026": from the first post to the build year. */
    years: currentYear > firstYear ? `${firstYear}–${currentYear}` : `${firstYear}`,
};

export const cvUrl = 'https://bit.ly/3sPIEcD';
export const rssUrl = '/rss.xml';

/** Shown in the footer and on the About page. */
export const socialLinks: IconLink[] = [
    { label: 'GitHub', href: githubUrl, icon: 'github', external: true, me: true },
    { label: 'LinkedIn', href: linkedinUrl, icon: 'linkedin', external: true, me: true },
    { label: 'Email', href: `mailto:${email}`, icon: 'mail' },
    { label: 'CV', href: cvUrl, icon: 'cv', external: true },
    { label: 'Tags', href: '/tags', icon: 'tag' },
    { label: 'RSS feed', href: rssUrl, icon: 'rss', external: true },
];

export const categories: Record<Category, CategoryInfo> = {
    rant: { label: 'Rant', href: '/rants', heading: { lead: 'Stray', accent: 'thoughts' } },
    project: { label: 'Project', href: '/projects', heading: { lead: 'Side', accent: 'quests' } },
    research: { label: 'Research', href: '/research', heading: { lead: 'Rabbit', accent: 'holes' } },
};
