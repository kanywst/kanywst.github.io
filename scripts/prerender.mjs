#!/usr/bin/env node
// Prerender the page into dist/index.html after `vite build`.
//
// The page is client-rendered, so a reader that doesn't run JS (link unfurlers, LLM and most
// non-Google crawlers, curl) got an empty <div id="root">, and even Googlebot only ever saw the
// hero: the detail isn't in the DOM until Space is pressed. Two pieces go in:
//
//   #root       the landing exactly as the client's first render paints it. main.tsx still
//               uses createRoot (not hydrate): the "new" marks depend on the viewer's clock,
//               so the client re-renders from scratch and replaces this — same markup, no flash.
//   <noscript>  the full detail, for readers without JS. With JS on, browsers never parse it.
//
// Needs `vite build --ssr src/entry-server.tsx --outDir dist-ssr` first (see package.json).

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = resolve(root, 'dist/index.html');
const ssr = resolve(root, 'dist-ssr');

const { render } = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href);
const { landing, detail } = render();

const page = readFileSync(html, 'utf8');
const marker = '<div id="root"></div>';
if (!page.includes(marker)) throw new Error(`prerender: ${marker} not found in dist/index.html`);
writeFileSync(
  html,
  page.replace(
    marker,
    `<div id="root">${landing}</div>\n    <noscript><main class="container noscript-detail">${detail}</main></noscript>`,
  ),
);
rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered: landing ${landing.length} B, detail ${detail.length} B → dist/index.html`);
