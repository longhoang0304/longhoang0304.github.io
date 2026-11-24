// Marks single-line ellipsis elements with [data-truncated] when their text is cut off,
// so CSS can offer the full text only where it's actually hidden.

export function initTruncationFlags(selector = '[data-truncate]') {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (els.length === 0) return;

    const check = (el: HTMLElement) => el.toggleAttribute('data-truncated', el.scrollWidth > el.clientWidth);

    // Fires on window resizes and when a hidden row is shown (it measured 0 wide while hidden).
    const observer = new ResizeObserver((entries) => entries.forEach((entry) => check(entry.target as HTMLElement)));
    els.forEach((el) => observer.observe(el));
    // Web fonts change text width without changing the box.
    document.fonts?.ready.then(() => els.forEach(check));
}
