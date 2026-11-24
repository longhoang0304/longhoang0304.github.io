type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function getStored(): string | null {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function store(theme: Theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
}

export function initThemeToggle() {
    const root = document.documentElement;
    const toggles = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme: Theme) {
        root.dataset.theme = theme;
        toggles.forEach((btn) => {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        });
    }

    applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

    toggles.forEach((btn) => {
        btn.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            store(next);
        });
    });

    systemDark.addEventListener('change', (e) => {
        if (!getStored()) applyTheme(e.matches ? 'dark' : 'light');
    });
}
