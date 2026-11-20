// Build-time render for scripts/prerender.mjs. Not shipped to the browser.
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import App, { Detail } from './App';
import { todayUTC } from './fresh';

export function render() {
  return {
    // what the client's first render paints, so the page has its hero before JS runs
    landing: renderToString(<App />),
    // everything behind Space, for readers that never run JS (crawlers, unfurlers, curl)
    detail: renderToStaticMarkup(<Detail onClose={() => {}} now={todayUTC()} />),
  };
}
