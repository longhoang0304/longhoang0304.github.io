import { scrollToElement } from './section-scroll';
import { SECTION_CHANGE, type SectionChangeDetail } from './section-tracker';
import type { Section } from './types';

// Fixed scroll hint: points at the next page, or back to top on the last one.
export function initScrollHint() {
    const hint = document.querySelector<HTMLAnchorElement>('[data-scroll-hint]');
    if (!hint) return;

    const sections: Section[] = JSON.parse(hint.dataset.sections || '[]');
    const text = hint.querySelector('.hint-text');

    const setCurrent = (current: number) => {
        const atEnd = current >= sections.length - 1;
        const target = atEnd ? sections[0] : sections[current + 1];
        hint.href = `#${target.id}`;
        hint.setAttribute('aria-label', atEnd ? 'Back to top' : `Scroll to ${target.label}`);
        hint.classList.toggle('is-up', atEnd);
        if (text) text.textContent = atEnd ? 'Top' : 'Scroll';
    };

    window.addEventListener(SECTION_CHANGE, (e) => {
        const { id } = (e as CustomEvent<SectionChangeDetail>).detail;
        const index = sections.findIndex((sec) => sec.id === id);
        if (index !== -1) setCurrent(index);
    });
    setCurrent(0);

    // Use the same glide as wheel/swipe instead of the browser's jump.
    hint.addEventListener('click', (e) => {
        const target = document.getElementById(hint.hash.slice(1));
        if (!target) return;
        e.preventDefault();
        scrollToElement(target);
    });
}
