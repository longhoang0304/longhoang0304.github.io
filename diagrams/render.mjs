// Renders every diagrams/*.mmd to SVG with Mermaid's CLI, using the Chrome already installed
// (see puppeteer.config.json). Output goes next to the post's other assets:
//   diagrams/r1-figure-1.mmd → public/blog-assets/r1/r1-figure-1.svg
// The CLI runs through npx, so it never becomes a site dependency or runs in the deploy.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MERMAID_CLI = '@mermaid-js/mermaid-cli@12.2.0';
const here = import.meta.dirname;
const root = join(here, '..');

const sources = readdirSync(here).filter((file) => file.endsWith('.mmd'));
if (sources.length === 0) console.log('No diagrams to render.');

for (const file of sources) {
    const name = file.slice(0, -'.mmd'.length);
    const postId = name.split('-')[0];
    const outDir = join(root, 'public', 'blog-assets', postId);
    mkdirSync(outDir, { recursive: true });

    const args = [
        '--yes', '-p', MERMAID_CLI, 'mmdc',
        '-i', join(here, file),
        '-o', join(outDir, `${name}.svg`),
        '-c', join(here, 'mermaid.config.json'),
        '-p', join(here, 'puppeteer.config.json'),
        '-b', '#fdfcf9',
    ];
    // One quoted command line: npx is a script on Windows, so it has to go through the shell.
    const command = ['npx', ...args.map((arg) => `"${arg}"`)].join(' ');
    const result = spawnSync(command, { stdio: 'inherit', shell: true, env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: 'true' } });

    if (result.status !== 0) process.exit(result.status ?? 1);
    console.log(`${file} → public/blog-assets/${postId}/${name}.svg`);
}
