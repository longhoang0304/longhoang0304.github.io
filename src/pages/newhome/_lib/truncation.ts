// Marks single-line ellipsis elements with [data-truncated] when their text is cut off,
// so CSS can offer the full text only where it's actually hidden. Returns the check so
// callers can re-run it after showing elements that were hidden (and measured as 0 wide).

export function initTruncationFlags(selector = '[data-truncate]'): () => void {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (els.length === 0) return () => {};

    const check = () => {
        els.forEach((el) => el.toggleAttribute('data-truncated', el.scrollWidth > el.clientWidth));
    };

    check();
    // Web fonts change text width once loaded.
    document.fonts?.ready.then(check);
    window.addEventListener('resize', check);
    return check;
}
