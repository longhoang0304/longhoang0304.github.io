/** Rough minutes to read a Markdown body, at 230 words a minute; never less than 1. */
export function readingMinutes(markdown: string | undefined): number {
    const words = (markdown ?? '').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 230));
}
