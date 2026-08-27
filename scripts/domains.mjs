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
  'aserto-dev/azm': 'Authorization',
  'cerbos/cerbos': 'Authorization',
  'php-casbin/php-casbin': 'Authorization',
  'openid/authzen': 'Authorization',
  'FairwindsOps/polaris': 'Authorization',
  // workload identity
  'spiffe/spire': 'Workload Identity',
  'spiffe/spiffe': 'Workload Identity',
  'ietf-wg-wimse/draft-ietf-wimse-s2s-protocol': 'Workload Identity',
  'kumahq/kuma': 'Workload Identity',
  // supply chain
  'sigstore/sigstore-go': 'Supply Chain',
  'sigstore/cosign': 'Supply Chain',
  'in-toto/in-toto-golang': 'Supply Chain',
  'theupdateframework/go-tuf': 'Supply Chain',
  'kubewarden/policies': 'Supply Chain',
  'oras-project/oras-go': 'Supply Chain',
  'sigstore/rekor': 'Supply Chain',
  'sigstore/gitsign': 'Supply Chain',
  'guacsec/guac': 'Supply Chain',
  'sse-secure-systems/connaisseur': 'Supply Chain',
  'woodpecker-ci/woodpecker': 'Supply Chain',
  'aquasecurity/trivy': 'Supply Chain',
  'notaryproject/notation-go': 'Supply Chain',
  'notaryproject/ratify': 'Supply Chain',
  // runtime / cloud native
  'falcosecurity/plugins': 'Runtime Security',
  'kubernetes/kubernetes': 'Cloud Native',
  'coder/coder': 'Cloud Native',
  'netbirdio/netbird': 'Cloud Native',
  'envoyproxy/gateway': 'Cloud Native',
  'kgateway-dev/kgateway': 'Cloud Native',
  // identity / OIDC
  'dexidp/dex': 'OIDC',
  'zalando/skipper': 'OIDC',
  'zitadel/zitadel': 'Identity',
  'goauthentik/authentik': 'Identity',
  'ory/polis': 'Identity',
  'supabase/auth': 'Identity',
  'glauth/glauth': 'Identity',
  'lldap/lldap': 'Identity',
  'Infisical/infisical': 'Identity',
  'vouch/vouch-proxy': 'OIDC',
  'cloudflare/workers-oauth-provider': 'OIDC',
  'openpubkey/openpubkey': 'OIDC',
  'go-jose/go-jose': 'OIDC',
  'lestrrat-go/jwx': 'OIDC',
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
  'rothgar/awesome-tuis': 'Tooling',
  'pwn2winctf/2020submissions': 'CTF',
};
