import type { Category, CategoryInfo, NavLink } from './types';

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

export const githubUrl = 'https://github.com/';
export const linkedinUrl = 'https://www.linkedin.com/';
export const email = 'hello@example.com';

export const categories: Record<Category, CategoryInfo> = {
    rant: { label: 'Rant', href: '/rants' },
    project: { label: 'Project', href: '/projects' },
    research: { label: 'Research', href: '/research' },
};
