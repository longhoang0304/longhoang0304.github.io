// Sets <html data-scrolling> while the page is moving, cleared once it settles.
// CSS uses it to fade the fixed header/footer out during a scroll.

const IDLE_MS = 150;

export function initScrollFade() {
    const root = document.documentElement;
    let timer: number | undefined;

    window.addEventListener('scroll', () => {
        root.dataset.scrolling = '';
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            delete root.dataset.scrolling;
        }, IDLE_MS);
    }, { passive: true });
}
