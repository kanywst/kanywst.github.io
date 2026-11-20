// Build-time render for scripts/prerender.mjs. Not shipped to the browser.
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import App, { Detail } from './App';

export function render() {
  return {
    // what the client's first render paints, so the page has its hero before JS runs
    landing: renderToString(<App />),
    // every row behind Space, for readers that never run JS (crawlers, unfurlers, curl). No
    // clock: "new" / ▲ marks would freeze at build time in a copy that stays deployed
    detail: renderToStaticMarkup(<Detail onClose={() => {}} now="" full />),
  };
}
