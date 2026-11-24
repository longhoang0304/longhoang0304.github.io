// Marks the table-of-contents link for the section being read with aria-current="true":
// the last heading that has scrolled past the top third of the screen.

export function initTocTracker() {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href^="#"]'));
    const headings = links
        .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
        .filter((h): h is HTMLElement => h !== null);
    if (headings.length === 0) return;

    const update = () => {
        const line = window.innerHeight / 3;
        let current = headings[0];
        for (const h of headings) {
            if (h.getBoundingClientRect().top <= line) current = h;
        }
        links.forEach((link) => {
            if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
}
