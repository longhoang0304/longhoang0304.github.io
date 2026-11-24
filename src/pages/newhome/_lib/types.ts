export interface NavLink {
    label: string;
    href: string;
}

export type Category = 'rant' | 'project' | 'research';

export interface CategoryInfo {
    label: string;
    href: string;
}

export interface Post {
    /** ISO 8601 date, e.g. 2026-10-11. */
    date: string;
    category: Category;
    title: string;
    href: string;
}

export interface Section {
    id: string;
    label: string;
}
