// Re-formats built dates (<time datetime="2026-10-11" data-local-date>) in the visitor's own
// locale: "11 Oct 2026" in the UK, "Oct 11, 2026" in the US. Without JS the built UK text stays.

import { FULL_DATE } from './format-date';

export function initLocalDates() {
    const format = new Intl.DateTimeFormat(undefined, FULL_DATE);
    document.querySelectorAll<HTMLTimeElement>('time[data-local-date]').forEach((el) => {
        el.textContent = format.format(new Date(`${el.dateTime}T00:00:00Z`));
    });
}
