// Client-side post search. Every post is rendered up front as a [data-search-item] row;
// with an empty box only the newest few show, and typing shows every match by relevance. The query lives in ?s=
// so results can be linked to and survive a reload.

import Fuse from 'fuse.js';
import { RECENT_LIMIT } from './recent-posts';

interface Entry {
    el: HTMLElement;
    title: string;
    description: string;
    tags: string;
}

const count = (n: number, one: string, many: string) => `[${n} ${n === 1 ? one : many}]`;

export function initSearch() {
    const input = document.querySelector<HTMLInputElement>('[data-search-input]');
    const list = document.querySelector<HTMLElement>('[data-search-list]');
    const empty = document.querySelector<HTMLElement>('[data-search-empty]');
    const status = document.querySelector<HTMLElement>('[data-search-status]');
    if (!input || !list || !empty || !status) return;

    // Server order is newest first; an empty query shows the top RECENT_LIMIT of it.
    const entries: Entry[] = Array.from(list.querySelectorAll<HTMLElement>('[data-search-item]')).map((el) => ({
        el,
        title: el.dataset.title ?? '',
        description: el.dataset.description ?? '',
        tags: el.dataset.tags ?? '',
    }));

    const fuse = new Fuse(entries, {
        keys: [
            { name: 'title', weight: 3 },
            { name: 'tags', weight: 2 },
            { name: 'description', weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
    });

    const render = (query: string) => {
        const shown = query ? fuse.search(query).map((r) => r.item) : entries.slice(0, RECENT_LIMIT);
        const visible = new Set(shown);

        entries.forEach((entry) => (entry.el.hidden = !visible.has(entry)));
        shown.forEach((entry) => list.append(entry.el));
        list.hidden = shown.length === 0;
        empty.hidden = shown.length !== 0;
        status.textContent = query ? count(shown.length, 'match', 'matches') : '[Recent]';
    };

    const syncUrl = (query: string) => {
        const url = new URL(window.location.href);
        if (query) url.searchParams.set('s', query);
        else url.searchParams.delete('s');
        window.history.replaceState(null, '', url);
    };

    let timer: number | undefined;
    input.addEventListener('input', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            const query = input.value.trim();
            syncUrl(query);
            render(query);
        }, 150);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !input.value) return;
        input.value = '';
        input.dispatchEvent(new Event('input'));
    });

    input.value = new URLSearchParams(window.location.search).get('s') ?? '';
    render(input.value.trim());
}
