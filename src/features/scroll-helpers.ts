// [data-scroll-to="top" | "bottom"] buttons jump to either end of the page (smoothly, unless the
// visitor prefers reduced motion). A [data-float-tools] group gets [data-visible] once the page has
// scrolled past its header, and loses it near the very end, where the footer is.

const SHOW_AFTER = 400;
const HIDE_NEAR_END = 160;

export function initScrollHelpers() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.querySelectorAll<HTMLElement>('[data-scroll-to]').forEach((button) => {
        button.addEventListener('click', () => {
            const top = button.dataset.scrollTo === 'bottom' ? document.documentElement.scrollHeight : 0;
            window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        });
    });

    const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-float-tools]'));
    if (groups.length === 0) return;

    const update = () => {
        const scrolled = window.scrollY;
        const nearEnd = window.innerHeight + scrolled >= document.documentElement.scrollHeight - HIDE_NEAR_END;
        groups.forEach((group) => group.toggleAttribute('data-visible', scrolled > SHOW_AFTER && !nearEnd));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
}
