// "/" anywhere opens search (or focuses its box when already there), unless the visitor
// is typing in a field or holding a modifier key.

const isTyping = (target: EventTarget | null) =>
    target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select') !== null);

export function initSearchShortcut() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
        e.preventDefault();

        const input = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (input) input.focus();
        else window.location.href = '/search';
    });
}
