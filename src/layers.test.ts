// The layers test: checks the site's structural rules (Blossom, smallest size) on every build.
// Each failure names the file and the rule it breaks. Run with `yarn test`.
//
//   pages → shell → views → components → elements      imports only go down (UI-1)
//   features/, config.ts, styles/                        base: any layer may use them
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const SRC = import.meta.dirname;
const UI_RANK: Record<string, number> = { pages: 5, shell: 4, views: 3, components: 2, elements: 1 };
const UI_LAYERS = Object.keys(UI_RANK);
/** The shell is a frame of a few parts, so its files may use each other. */
const SAME_LAYER_OK = new Set(['shell']);

const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .map((path) => path.replaceAll('\\', '/'))
    .filter((path) => /\.(astro|ts|css)$/.test(path) && !path.startsWith('content/') && !path.endsWith('.test.ts'));

const read = (path: string) => readFileSync(join(SRC, path), 'utf8');
const layerOf = (path: string) => (path.includes('/') ? path.split('/')[0] : 'root');

/** Every import in a file, resolved to a path under src/; packages and astro: modules are skipped. */
function importsOf(path: string): string[] {
    const specifiers = [...read(path).matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]);
    return specifiers.flatMap((spec) => {
        if (spec.startsWith('@')) {
            const local = spec.slice(1);
            return UI_LAYERS.includes(local.split('/')[0]) || ['features', 'config', 'styles'].includes(local.split('/')[0]) ? [local] : [];
        }
        if (spec.startsWith('.')) return [relative(SRC, resolve(SRC, dirname(path), spec)).replaceAll('\\', '/')];
        return [];
    });
}

test('UI-1, UI-2, UI-3: UI imports only go down, never within a layer', () => {
    const broken = files.flatMap((path) => {
        const own = layerOf(path);
        if (!(own in UI_RANK)) return [];
        return importsOf(path).flatMap((target) => {
            const other = layerOf(target);
            if (!(other in UI_RANK)) return [];
            if (UI_RANK[other] > UI_RANK[own]) return [`${path} imports ${target}: imports must go down (UI-1)`];
            if (other === own && !SAME_LAYER_OK.has(own)) return [`${path} imports ${target}: no imports within a layer (UI-2, UI-3)`];
            return [];
        });
    });
    assert.deepEqual(broken, []);
});

test('features/ hold no UI', () => {
    const broken = files
        .filter((path) => layerOf(path) === 'features')
        .flatMap((path) => importsOf(path).filter((target) => layerOf(target) in UI_RANK).map((target) => `${path} imports ${target}: features stay UI-free`));
    assert.deepEqual(broken, []);
});

test('UI-6: above components, no HTML controls', () => {
    const broken = files
        .filter((path) => ['pages', 'shell', 'views'].includes(layerOf(path)) && path.endsWith('.astro'))
        .flatMap((path) => [...read(path).matchAll(/<(button|input|select|textarea|table|a)[\s>]/g)].map((m) => `${path} draws <${m[1]}>: controls belong in elements and components (UI-6)`));
    assert.deepEqual(broken, []);
});

test('STYLE-6: every color comes from the theme', () => {
    const styles = (path: string) => (path.endsWith('.css') ? [read(path)] : [...read(path).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]));
    const broken = files
        .filter((path) => path !== 'styles/theme.css' && /\.(astro|css)$/.test(path))
        .flatMap((path) => styles(path).flatMap((css) => [...css.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g)].map((m) => `${path} uses ${m[0]}: colors belong in styles/theme.css (STYLE-6)`)));
    assert.deepEqual(broken, []);
});
