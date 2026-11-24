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

export const githubUrl = 'https://github.com/longhoang0304';
export const linkedinUrl = 'https://www.linkedin.com/in/notlonghoang/';
export const email = 'hey@longhoang.me';

export const categories: Record<Category, CategoryInfo> = {
    rant: { label: 'Rant', href: '/rants', heading: { lead: 'Stray', accent: 'thoughts' } },
    project: { label: 'Project', href: '/projects', heading: { lead: 'Side', accent: 'quests' } },
    research: { label: 'Research', href: '/research', heading: { lead: 'Rabbit', accent: 'holes' } },
};
