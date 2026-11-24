import type { Category, CategoryInfo, NavLink, Post } from './types';

export const location = 'Reading, UK';
export const timeZone = 'Europe/London';

export const links: NavLink[] = [
    { label: 'Rants', href: '/rants' },
    { label: 'Projects', href: '/projects' },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
];

export const githubUrl = 'https://github.com/';
export const linkedinUrl = 'https://www.linkedin.com/';
export const email = 'hello@example.com';

export const categories: Record<Category, CategoryInfo> = {
    rant: { label: 'Rant', href: '/rants' },
    project: { label: 'Project', href: '/projects' },
    research: { label: 'Research', href: '/research' },
};

export const posts: Post[] = [
    // Placeholder titles of varied length for layout testing.
    { date: '2026-10-11', category: 'rant', title: 'Why I stopped writing TODO comments', href: '/rants/post-1' },
    { date: '2026-10-12', category: 'rant', title: 'Meetings', href: '/rants/post-2' },
    { date: '2026-10-13', category: 'rant', title: 'On the quiet cost of saying yes to every small request that lands in your inbox', href: '/rants/post-3' },
    { date: '2026-09-02', category: 'project', title: 'A tiny CLI for tracking houseplant watering', href: '/projects/project-1' },
    { date: '2026-09-20', category: 'project', title: 'Rebuilding this site with Astro', href: '/projects/project-2' },
    { date: '2026-10-05', category: 'project', title: 'Homelab notes, part 2', href: '/projects/project-3' },
    { date: '2026-08-14', category: 'research', title: 'Reading list: distributed systems papers worth a second look', href: '/research/research-1' },
    { date: '2026-09-09', category: 'research', title: 'Notes on CRDTs', href: '/research/research-2' },
    { date: '2026-10-01', category: 'research', title: 'What actually happens when you type a URL and press Enter, revisited for 2026', href: '/research/research-3' },
];
