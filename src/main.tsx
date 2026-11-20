import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// createRoot, not hydrateRoot, on purpose: #root holds a prerendered landing
// (scripts/prerender.mjs), but the client's first render can legitimately differ from it — a
// section hash opens the detail, and the "new" marks follow the viewer's clock. Switching to
// hydration would turn both into mismatches.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
