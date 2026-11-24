function formatTime(timeZone: string, date: Date): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return `${get('hour')}:${get('minute')} ${get('timeZoneName')}`;
}

function updateClocks() {
    document.querySelectorAll<HTMLTimeElement>('[data-local-time]').forEach((el) => {
        const timeZone = el.dataset.tz || 'Europe/London';
        try {
            const now = new Date();
            el.textContent = formatTime(timeZone, now);
            el.dateTime = now.toISOString();
        } catch {
            el.textContent = '';
        }
    });
}

export function initClocks(intervalMs = 15_000) {
    updateClocks();
    setInterval(updateClocks, intervalMs);
}
