// [data-go-back] links return to the previous page; with no history to go back to,
// they simply follow their href.

export function initGoBack() {
    document.querySelectorAll<HTMLAnchorElement>('[data-go-back]').forEach((link) => {
        link.addEventListener('click', (e) => {
            if (window.history.length <= 1) return;
            e.preventDefault();
            window.history.back();
        });
    });
}
