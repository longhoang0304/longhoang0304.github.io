// Tracks which [data-section] is on screen: sets <html data-section="<id>"> for CSS
// and fires SECTION_CHANGE for scripts.

export const SECTION_CHANGE = 'site:section-change';

export interface SectionChangeDetail {
    id: string;
}

export function initSectionTracker() {
    const root = document.documentElement;

    // A section is current once it crosses the middle of the viewport.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            root.dataset.section = id;
            window.dispatchEvent(new CustomEvent<SectionChangeDetail>(SECTION_CHANGE, { detail: { id } }));
        });
    }, { rootMargin: '-50% 0px -50% 0px' });

    document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => observer.observe(el));
}
