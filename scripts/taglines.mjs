// Curated overrides for the *selected work* section. The repo list itself is no longer
// hand-picked: sync-profile.mjs discovers every public, non-fork, non-archived kanywst
// repo with at least one star and ranks them by star count. These tables only refine how
// a discovered repo reads — they never decide whether it appears.
//
// Anything unmapped falls back to the live GitHub metadata (description, primaryLanguage),
// so a repo that earns its first star shows up immediately without a code change.

// repo name → a tighter tagline than the GitHub description.
export const TAGLINE_BY_REPO = {
  omega:
    'SPIFFE workload identity + OpenID AuthZEN 1.0 authorization in a single binary: Cedar PDP, federation, tamper-evident audit log, Kubernetes operator.',
  wimsey:
    'Vendor-neutral WIMSE workload-identity reference implementation: WIT/WPT tokens, RFC 9421 HTTP message signatures, mTLS/WIC.',
  'opa-authzen-plugin': 'Extended OPA implementing the OpenID AuthZEN 1.0 Authorization API.',
  y509: 'A terminal UI for viewing and analyzing X.509 certificate chains.',
  brtc: 'Cost calculator for offline password brute-force: time + USD per GPU profile, with a CI gatekeeper.',
  'awesome-authorization':
    'Curated authorization & access-control tools, frameworks, standards, and resources.',
  'spiffe-compliance-checker':
    'Static MUST-clause compliance checker for SPIFFE artifacts: SPIFFE-ID, X.509-SVID, JWT-SVID, trust bundle, each failure citing its spec section.',
  a2acode:
    'Serve any ACP coding agent — Claude Code, Gemini CLI, Codex — over the A2A protocol, keeping tool progress, file diffs and permission prompts intact.',
  hammurabi:
    'Engineering laws and mental models, each paired with its counter-force, a field guideline, and a primary source.',
};

// repo name → display language, for repos GitHub can't classify (a list, a spec, docs).
export const LANG_BY_REPO = {
  'awesome-authorization': 'List',
};
