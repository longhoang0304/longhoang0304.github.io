// Marks single-line ellipsis elements with [data-truncated] when their text is cut off,
// so CSS can offer the full text only where it's actually hidden.

export function initTruncationFlags(selector = '[data-truncate]') {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (els.length === 0) return;

    const check = () => {
        els.forEach((el) => el.toggleAttribute('data-truncated', el.scrollWidth > el.clientWidth));
    };

    check();
    // Web fonts change text width once loaded.
    document.fonts?.ready.then(check);
    window.addEventListener('resize', check);
}
