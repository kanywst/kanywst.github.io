import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Section } from "./Section";

// ---- A realistic Istio-based production stack ----
// You picked ONE service mesh. Here's what comes with it.

interface Node {
  id: string;
  name: string;
  sub: string;
  src?: string;
  color: string;
  snark: string;
}

const layer1: Node[] = [
  {
    id: "istiod",
    name: "Istiod",
    sub: "Control Plane / Root CA",
    src: "/logos/istio.png",
    color: "#466BB0",
    snark:
      "Manages your entire mesh config via xDS. One misconfiguration and every deployment silently fails.",
  },
  {
    id: "spire",
    name: "SPIRE Server",
    sub: "Workload Identity (SVID)",
    src: "/logos/spiffe.png",
    color: "#2E8B57",
    snark: "Issues X.509 SVIDs to every pod. Because trusting the IP address was so 2010.",
  },
  {
    id: "gatekeeper",
    name: "OPA Gatekeeper",
    sub: "Admission Controller",
    src: "/logos/open-policy-agent.png",
    color: "#2D8A81",
    snark:
      "Validates every pod before it starts. Written in Rego, a language nobody asked for.",
  },
];

const layer2: Node[] = [
  {
    id: "agent",
    name: "SPIRE Agent",
    sub: "DaemonSet — every node",
    src: "/logos/spiffe.png",
    color: "#2E8B57",
    snark:
      "Runs on every single node. Talks to SPIRE Server to attest workload identity via node attestation.",
  },
  {
    id: "cilium",
    name: "Cilium CNI",
    sub: "eBPF network layer",
    src: "/logos/cilium.png",
    color: "#F0DF65",
    snark:
      "Handles L3/L4 NetworkPolicy via eBPF. Doesn't replace the mesh, just adds another layer of config.",
  },
];

const NodeCard = ({
  node,
  isHovered,
  onEnter,
  onLeave,
  compact = false,
}: {
  node: Node;
  isHovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  compact?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35 }}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    className="relative cursor-help flex-1"
  >
    <div
      className={`border bg-black flex ${compact ? "flex-row gap-3 items-center p-2" : "flex-col items-center gap-2 p-3"} transition-all duration-200 h-full`}
      style={{
        borderColor: isHovered ? node.color : "#27272a",
        boxShadow: isHovered ? `0 0 14px ${node.color}40` : "none",
      }}
    >
      {node.src ? (
        <img
          src={node.src}
          alt={node.name}
          className={`object-contain transition-all duration-200 ${compact ? "w-6 h-6" : "w-8 h-8"} ${isHovered ? "" : "filter grayscale opacity-50"}`}
        />
      ) : (
        <div className={`${compact ? "w-6 h-6" : "w-8 h-8"} flex items-center justify-center font-bold text-[10px] border`} style={{ color: node.color, borderColor: node.color + "55" }}>
          —
        </div>
      )}
      <div className={compact ? "" : "text-center"}>
        <div className={`font-bold text-white leading-tight ${compact ? "text-xs" : "text-xs"}`}>{node.name}</div>
        <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{node.sub}</div>
      </div>
    </div>

    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-zinc-900 border border-zinc-700 p-3 text-xs text-zinc-300 rounded shadow-2xl z-50 text-center"
          style={{ borderTopColor: node.color, borderTopWidth: 2 }}
        >
          <em>"{node.snark}"</em>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// Animated dashed vertical arrow
const DownArrow = ({ label, color = "#3f3f46", delay = 0 }: { label?: string; color?: string; delay?: number }) => (
  <div className="flex flex-col items-center py-1 gap-0.5">
    <svg width="2" height="28" className="overflow-visible">
      <motion.line
        x1="1" y1="0" x2="1" y2="28"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
      />
    </svg>
    {label && (
      <div className="text-[9px] uppercase tracking-widest px-2" style={{ color }}>
        {label}
      </div>
    )}
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: delay + 0.5 }}
      style={{ color }}
      className="text-sm leading-none"
    >
      ▼
    </motion.div>
  </div>
);

function MachineAuthDiagram() {
  const { ref, isInView } = useScrollReveal({ margin: "-50px" });
  const [hovered, setHovered] = useState<string | null>(null);

  const cost   = useCountUp(1200, isInView, 2500, "$", "/mo");
  const yaml   = useCountUp(8200, isInView, 3000, "", " lines of YAML");
  const certs  = useCountUp(288, isInView, 2000, "", " x.509 certs rotated/day");

  return (
    <div ref={ref} className="w-full mt-10 font-mono">

      {/* Metrics row */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-3 border border-zinc-800 bg-black mb-8"
      >
        {[
          { label: "Auth infra cost",    value: cost.display,  color: "var(--color-error)" },
          { label: "YAML configs",       value: yaml.display,  color: "var(--color-warning)" },
          { label: "Cert rotations/day", value: certs.display, color: "#A855F7" },
        ].map((m, i) => (
          <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-zinc-800" : ""}`}>
            <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">{m.label}</div>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Diagram */}
      <div className="w-full max-w-3xl mx-auto">

        {/* Layer 1: Control Plane */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="border border-zinc-700 bg-zinc-950 p-4"
        >
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
            ① Control Plane
          </div>
          <div className="flex gap-3">
            {layer1.map(n => (
              <NodeCard
                key={n.id}
                node={n}
                isHovered={hovered === n.id}
                onEnter={() => setHovered(n.id)}
                onLeave={() => setHovered(null)}
              />
            ))}
          </div>
          <div className="mt-3 text-[9px] text-zinc-600 border-t border-zinc-800 pt-2">
            Istiod pushes xDS config to every Envoy · SPIRE issues SVID to each workload · Gatekeeper blocks bad manifests on admission
          </div>
        </motion.div>

        <DownArrow label="xDS config + SVID certs" color="#3f3f46" delay={0.2} />

        {/* Layer 2: Node / Network */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="border border-zinc-700 bg-zinc-950 p-4"
        >
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
            ② Node & Network Layer
          </div>
          <div className="flex gap-3">
            {layer2.map(n => (
              <NodeCard
                key={n.id}
                node={n}
                isHovered={hovered === n.id}
                onEnter={() => setHovered(n.id)}
                onLeave={() => setHovered(null)}
              />
            ))}
          </div>
          <div className="mt-3 text-[9px] text-zinc-600 border-t border-zinc-800 pt-2">
            SPIRE Agent runs as DaemonSet on every node · Cilium enforces L3/L4 NetworkPolicy via eBPF
          </div>
        </motion.div>

        <DownArrow label="eBPF identity + L4 policy" color="#3f3f46" delay={0.4} />

        {/* Layer 3: Data plane — the actual apps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="border border-[var(--color-terminal)]/30 bg-black p-4"
        >
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
            ③ Data Plane (your actual apps)
          </div>

          <div className="flex items-stretch gap-2">
            {/* Service A pod */}
            <div className="flex-1 border border-zinc-800 p-2 bg-zinc-950">
              <div className="text-[9px] text-zinc-600 mb-1">Pod: frontend</div>
              <div className="flex gap-2 items-center">
                {/* app container */}
                <div className="border border-zinc-700 bg-black p-1.5 text-center flex-1">
                  <div className="text-[10px] text-white font-bold">app</div>
                  <div className="text-[9px] text-zinc-600">:8080</div>
                </div>
                {/* sidecar */}
                <div className="border border-[#E03C8A]/40 bg-black p-1.5 text-center flex-1">
                  <div className="text-[10px] text-[#E03C8A] font-bold">envoy</div>
                  <div className="text-[9px] text-zinc-600">sidecar</div>
                </div>
              </div>
              <div className="mt-1.5 text-[9px] text-zinc-600 break-all">spiffe://cluster.local/ns/prod/sa/frontend</div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center px-1 gap-0.5">
              <svg width="40" height="16">
                <motion.line
                  x1="0" y1="8" x2="40" y2="8"
                  stroke="var(--color-terminal)"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                />
              </svg>
              <div className="text-[8px] text-[var(--color-terminal)] font-bold text-center leading-tight">mTLS</div>
            </div>

            {/* Service B pod */}
            <div className="flex-1 border border-zinc-800 p-2 bg-zinc-950">
              <div className="text-[9px] text-zinc-600 mb-1">Pod: payment-api</div>
              <div className="flex gap-2 items-center">
                {/* sidecar */}
                <div className="border border-[#E03C8A]/40 bg-black p-1.5 text-center flex-1">
                  <div className="text-[10px] text-[#E03C8A] font-bold">envoy</div>
                  <div className="text-[9px] text-zinc-600">sidecar</div>
                </div>
                {/* app container */}
                <div className="border border-zinc-700 bg-black p-1.5 text-center flex-1">
                  <div className="text-[10px] text-white font-bold">app</div>
                  <div className="text-[9px] text-zinc-600">:8080</div>
                </div>
              </div>
              <div className="mt-1.5 text-[9px] text-zinc-600 break-all">spiffe://cluster.local/ns/prod/sa/payment</div>
            </div>
          </div>

          <div className="mt-3 text-[9px] text-zinc-600 border-t border-[var(--color-terminal)]/10 pt-2">
            Envoy intercepts all traffic · mTLS mutual auth via SPIFFE X.509 SVIDs · Istio AuthorizationPolicy enforced at L7
          </div>
        </motion.div>

        <div className="text-center mt-3 text-[10px] text-zinc-600 italic">
          hover each component to learn why it's there
        </div>
      </div>
    </div>
  );
}

export function MachineAuthSection() {
  return (
    <Section className="border-t border-neutral-900 bg-neutral-950">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", damping: 18 }}
          className="bg-black p-8 border border-[var(--color-error)] text-center shadow-[0_0_40px_rgba(255,0,0,0.35)]"
        >
          <h3 className="text-3xl md:text-5xl font-black mb-5 uppercase text-[var(--color-error)] tracking-tight">
            AND THEN THE MACHINE AUTH ARRIVES
          </h3>
          <p className="text-xl md:text-2xl text-[var(--color-terminal)] mb-3 font-mono">
            "Service-to-service needs auth too. Let's add a service mesh."
          </p>
          <p className="text-lg text-gray-400 font-mono mb-6">
            "We'll use Istio. It's just mTLS. It'll be quick."
          </p>
          <div className="bg-[var(--color-error)] text-white font-bold p-4 text-xl uppercase animate-pulse">
            The two containers just wanted to talk to each other.
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-gray-400 bg-black p-6 border-l-4 border-zinc-700"
        >
          You chose <strong className="text-white">Istio</strong>. Just one service mesh. That's it. <br />
          Here's everything that comes with "just one service mesh" in production:
        </motion.p>

        <MachineAuthDiagram />
      </div>
    </Section>
  );
}
