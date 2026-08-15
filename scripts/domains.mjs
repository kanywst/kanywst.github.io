// Single source of truth: owner/repo → domain label. Shared by sync-profile.mjs
// (contributions/issues) and sync-advisories.mjs (advisories) so the same repo never
// shows two different domains across sections. Anything unmapped falls back to '' (the
// sync scripts flag it). Add a repo here once; both sections pick it up.
export const DOMAIN_BY_REPO = {
  // authorization / policy
  'authzed/spicedb': 'Authorization',
  'openfga/openfga': 'Authorization',
  'Permify/permify': 'Authorization',
  'open-policy-agent/opa': 'Authorization',
  'open-policy-agent/contrib': 'Authorization',
  'open-policy-agent/gatekeeper-library': 'Authorization',
  'aserto-dev/topaz': 'Authorization',
  'cerbos/cerbos': 'Authorization',
  // workload identity
  'spiffe/spire': 'Workload Identity',
  'kumahq/kuma': 'Workload Identity',
  // supply chain
  'sigstore/sigstore-go': 'Supply Chain',
  'sigstore/cosign': 'Supply Chain',
  'in-toto/in-toto-golang': 'Supply Chain',
  'theupdateframework/go-tuf': 'Supply Chain',
  'kubewarden/policies': 'Supply Chain',
  'oras-project/oras-go': 'Supply Chain',
  'aquasecurity/trivy': 'Supply Chain',
  'notaryproject/notation-go': 'Supply Chain',
  'notaryproject/ratify': 'Supply Chain',
  // runtime / cloud native
  'falcosecurity/plugins': 'Runtime Security',
  'kubernetes/kubernetes': 'Cloud Native',
  'coder/coder': 'Cloud Native',
  'netbirdio/netbird': 'Cloud Native',
  // identity / OIDC
  'dexidp/dex': 'OIDC',
  'zalando/skipper': 'OIDC',
  'zitadel/zitadel': 'Identity',
  'goauthentik/authentik': 'Identity',
  // AI infra
  'envoyproxy/ai-gateway': 'AI Gateway',
  // PKI
  'smallstep/certificates': 'PKI',
  'smallstep/cli': 'PKI',
  'cert-manager/cert-manager': 'PKI',
  'enix/x509-certificate-exporter': 'PKI',
  'golang/go': 'PKI',
  // service mesh
  'istio/istio': 'Service Mesh',
  'cilium/cilium': 'Service Mesh',
  // misc
  'prometheus/prometheus': 'Observability',
  'golangci/golangci-lint': 'Tooling',
  'google-gemini/gemini-cli': 'Tooling',
  'pwn2winctf/2020submissions': 'CTF',
};
