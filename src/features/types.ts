export interface NavLink {
    label: string;
    href: string;
}

export type Category = 'rant' | 'project' | 'research';

export interface CategoryInfo {
    /** Singular, for row meta: [Rant]. */
    label: string;
    /** The section's list page. */
    href: string;
    /** The section's heading, second word in the accent style: "Stray" "thoughts". */
    heading: { lead: string; accent: string };
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
    /** Shown before the title, each in brackets: [11 Oct 2026][Rant]. With a datetime, the text is
     *  a date that the browser re-formats for the visitor's locale (features/local-dates.ts). */
    meta: { text: string; datetime?: string }[];
    hidden?: boolean;
    /** Extra attributes for the row, e.g. data-* hooks for scripts. */
    attrs?: Record<string, string | undefined>;
}
