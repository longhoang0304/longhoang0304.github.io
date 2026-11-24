// Renders every diagrams/*.mmd to SVG with Mermaid's CLI, using the Chrome already installed
// (see puppeteer.config.json): once in the light palette, once in the dark one. Output goes next to
// the post's other assets, and Prose shows the one that matches the site theme:
//   diagrams/r1-figure-1.mmd → public/blog-assets/r1/r1-figure-1-light.svg and r1-figure-1-dark.svg
// The CLI runs through npx, so it never becomes a site dependency or runs in the deploy.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MERMAID_CLI = '@mermaid-js/mermaid-cli@12.2.0';
const THEMES = [
    { name: 'light', config: 'mermaid.config.json', background: '#fdfcf9' },
    { name: 'dark', config: 'mermaid.dark.config.json', background: '#17120d' },
];
const here = import.meta.dirname;
const root = join(here, '..');

const sources = readdirSync(here).filter((file) => file.endsWith('.mmd'));
if (sources.length === 0) console.log('No diagrams to render.');

for (const file of sources) {
    const name = file.slice(0, -'.mmd'.length);
    const postId = name.split('-')[0];
    const outDir = join(root, 'public', 'blog-assets', postId);
    mkdirSync(outDir, { recursive: true });

    for (const theme of THEMES) {
        const out = `${name}-${theme.name}.svg`;
        const args = [
            '--yes', '-p', MERMAID_CLI, 'mmdc',
            '-i', join(here, file),
            '-o', join(outDir, out),
            '-c', join(here, theme.config),
            '-p', join(here, 'puppeteer.config.json'),
            '-b', theme.background,
        ];
        // One quoted command line: npx is a script on Windows, so it has to go through the shell.
        const command = ['npx', ...args.map((arg) => `"${arg}"`)].join(' ');
        const result = spawnSync(command, { stdio: 'inherit', shell: true, env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: 'true' } });

        if (result.status !== 0) process.exit(result.status ?? 1);
        console.log(`${file} → public/blog-assets/${postId}/${out}`);
    }
}
