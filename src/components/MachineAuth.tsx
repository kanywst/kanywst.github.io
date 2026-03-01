import { motion } from 'framer-motion';
import { Section } from './Section';

const MiniLogo = ({ src, alt, label }: { src: string, alt: string, label?: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="bg-zinc-950 border border-zinc-800 p-2 relative group overflow-hidden">
      <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <img 
        src={src} 
        alt={alt} 
        className="w-10 h-10 object-contain filter grayscale contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:contrast-100 z-10 relative" 
        onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/64/111111/666666?text=${alt}` }}
      />
    </div>
    {label && <span className="text-xs font-mono text-zinc-500">{label}</span>}
  </div>
);

const MachineAuthDiagram = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-16 p-8 border-2 border-[var(--color-error)] bg-black relative overflow-hidden font-mono">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
            <MiniLogo src="/favicon.png" alt="K8s" />
            <h4 className="text-xl md:text-2xl font-bold uppercase text-white tracking-widest">Kubernetes Cluster Scope</h4>
          </div>
          <span className="bg-[var(--color-error)] text-white px-2 py-1 text-xs font-bold uppercase animate-pulse">Critical Severity</span>
        </div>

        {/* Control Plane Area */}
        <div className="border border-zinc-700 p-6 mb-12 bg-zinc-900/50 relative">
          <span className="absolute -top-3 left-4 bg-black px-2 text-xs text-zinc-400 capitalize">Control Plane (The "God Mode")</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center justify-items-center">
            <MiniLogo src="/logos/istio.png" alt="Istio" label="Istiod (Root CA)" />
            <MiniLogo src="/logos/spiffe.png" alt="SPIRE" label="SPIRE Server" />
            <MiniLogo src="/logos/open-policy-agent.png" alt="OPA Gatekeeper" label="Gatekeeper" />
            <MiniLogo src="/logos/kyverno.png" alt="Kyverno" label="Kyverno" />
          </div>
          <div className="mt-4 text-center text-xs text-zinc-500 border-t border-zinc-800 pt-2 border-dashed">
            Mutating Webhooks & SPIFFE ID Issuance
          </div>
        </div>

        {/* Data Plane Area */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
          
          {/* Service A */}
          <div className="border border-[var(--color-terminal)] p-4 flex-1 w-full bg-zinc-950 relative">
            <span className="absolute -top-3 left-4 bg-black px-2 text-xs text-[var(--color-terminal)]">Workload A (Frontend)</span>
            <div className="flex justify-around items-center mb-4">
              <MiniLogo src="/favicon.png" alt="App" label="App Container" />
              <div className="text-zinc-600 text-xl font-bold">+</div>
              <MiniLogo src="/logos/envoy.png" alt="Envoy" label="Envoy Sidecar" />
            </div>
            <div className="text-[10px] text-[var(--color-terminal)] bg-[var(--color-terminal)]/10 p-2 border border-[var(--color-terminal)]/30 text-center break-all">
              spiffe://cluster.local/ns/prod/sa/frontend
            </div>
          </div>

          {/* Connection Line */}
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-xs text-[var(--color-warning)] font-bold mb-2">mTLS (Strict)</span>
            <div className="w-full flex items-center justify-center text-[var(--color-warning)]">
              <span className="w-full border-t-2 border-dashed border-[var(--color-warning)]"></span>
              <span className="ml-[-8px] font-bold text-xl">▶</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-2">L7 Policy Enforced</span>
          </div>

          {/* Service B */}
          <div className="border border-[var(--color-terminal)] p-4 flex-1 w-full bg-zinc-950 relative">
            <span className="absolute -top-3 left-4 bg-black px-2 text-xs text-[var(--color-terminal)]">Workload B (Payment API)</span>
            <div className="flex justify-around items-center mb-4">
              <MiniLogo src="/logos/envoy.png" alt="Envoy" label="Envoy Sidecar" />
              <div className="text-zinc-600 text-xl font-bold">+</div>
              <MiniLogo src="/favicon.png" alt="App" label="App Container" />
            </div>
            <div className="text-[10px] text-[var(--color-terminal)] bg-[var(--color-terminal)]/10 p-2 border border-[var(--color-terminal)]/30 text-center break-all">
              spiffe://cluster.local/ns/prod/sa/payment
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export function MachineAuthSection() {
  return (
    <Section className="border-t border-neutral-900 bg-neutral-950">
      <div className="max-w-6xl mx-auto text-center space-y-8 w-full">
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative z-20 bg-black/90 p-8 border border-[var(--color-error)] max-w-4xl mx-auto text-center shadow-[0_0_50px_rgba(255,0,0,0.5)]"
        >
          <h3 className="text-3xl md:text-5xl font-black mb-6 uppercase text-[var(--color-error)] tracking-tighter">AND THEN THE MACHINE AUTH ARRIVES</h3>
          <p className="text-xl md:text-3xl text-[var(--color-terminal)] mb-4 font-mono">"Wait, do we need a Service Mesh? Istio or Linkerd?"</p>
          <p className="text-lg md:text-2xl text-gray-400 font-mono mb-8">"Is this L4 or L7? Did you issue the SPIFFE ID?"</p>
          <div className="inline-block bg-[var(--color-error)] text-white font-bold p-4 text-xl md:text-3xl uppercase animate-pulse w-full">
            Your microservices now refuse to talk to each other.
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.8 }}
        >
          <p className="text-xl md:text-2xl text-gray-400 text-left max-w-4xl mx-auto mt-12 bg-black p-6 border-l-4 border-zinc-700">
            You just wanted two containers to communicate. Now you are managing <strong className="text-white">mTLS certificates</strong>, writing <strong className="text-white">Envoy Filters</strong>, deploying a <strong className="text-white">SPIRE Agent</strong> on every node, and enforcing <strong className="text-white">Kyverno/Gatekeeper</strong> admission policies so developers don't accidentally bypass the mesh.
          </p>
          
          <MachineAuthDiagram />
        </motion.div>

      </div>
    </Section>
  );
}
