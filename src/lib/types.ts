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

/** One row of a LinkList: UI data only, so the list knows nothing about posts. */
export interface LinkItem {
    href: string;
    title: string;
    /** Shown before the title, each in brackets: [Oct 11, 2026][Rant]. */
    meta: { text: string; datetime?: string }[];
    hidden?: boolean;
    /** Extra attributes for the row, e.g. data-* hooks for scripts. */
    attrs?: Record<string, string | undefined>;
}
