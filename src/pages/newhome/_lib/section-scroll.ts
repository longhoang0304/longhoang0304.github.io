// Full-page section scrolling: each wheel / swipe / key press glides to the next
// [data-section] with a custom duration (native smooth scroll speed can't be tuned).

const DURATION_MS = 900;
// Wheel events closer together than this belong to the same gesture (incl. trackpad momentum).
const GESTURE_GAP_MS = 200;
const SWIPE_MIN_PX = 40;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let animating = false;

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function scrollToElement(el: HTMLElement) {
    const from = window.scrollY;
    const to = Math.round(el.getBoundingClientRect().top + from);
    const distance = to - from;

    if (distance === 0) return;
    if (reducedMotion.matches) {
        window.scrollTo(0, to);
        return;
    }

    animating = true;
    const start = performance.now();
    const step = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        window.scrollTo(0, from + distance * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(step);
        else animating = false;
    };
    requestAnimationFrame(step);
}

export function initSectionScroll() {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    if (sections.length < 2) return;

    const currentIndex = () => {
        let current = 0;
        sections.forEach((el, i) => {
            if (el.getBoundingClientRect().top <= 1) current = i;
        });
        return current;
    };

    // A section taller than the viewport scrolls natively until its edge is reached.
    const canScrollWithin = (dir: 1 | -1) => {
        const rect = sections[currentIndex()].getBoundingClientRect();
        return dir === 1 ? rect.bottom > window.innerHeight + 1 : rect.top < -1;
    };

    const go = (dir: 1 | -1) => {
        const next = sections[currentIndex() + dir];
        if (next) scrollToElement(next);
    };

    let lastWheel = 0;
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.deltaY === 0) return;
        const dir = e.deltaY > 0 ? 1 : -1;
        if (!animating && canScrollWithin(dir)) return;

        e.preventDefault();
        const now = performance.now();
        const newGesture = now - lastWheel > GESTURE_GAP_MS;
        lastWheel = now;
        if (!animating && newGesture) go(dir);
    }, { passive: false });

    let touchStartY: number | null = null;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (touchStartY === null) return;
        const dir = touchStartY - e.touches[0].clientY > 0 ? 1 : -1;
        if (animating || !canScrollWithin(dir)) e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', (e) => {
        if (touchStartY === null) return;
        const dy = touchStartY - e.changedTouches[0].clientY;
        touchStartY = null;
        if (animating || Math.abs(dy) < SWIPE_MIN_PX) return;
        const dir = dy > 0 ? 1 : -1;
        if (!canScrollWithin(dir)) go(dir);
    });

    window.addEventListener('keydown', (e) => {
        // Leave keys alone while a link, button or field has focus.
        if (e.target !== document.body || e.altKey || e.ctrlKey || e.metaKey) return;
        let dir: 1 | -1 | null = null;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
        else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
        if (dir === null || (!animating && canScrollWithin(dir))) return;

        e.preventDefault();
        if (!animating) go(dir);
    });
}
