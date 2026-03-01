import { motion } from 'framer-motion';
import { Section, ProgressBar } from './components/Section';
import { ChaosWall } from './components/ChaosWall';
import { CodeBlock } from './components/CodeBlock';
import { MachineAuthSection } from './components/MachineAuth';

const LogoPair = ({ src, alt, text }: { src: string, alt: string, text: string }) => (
  <div className="border-2 border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center aspect-square transition-all duration-300 hover:border-[var(--color-error)] hover:scale-105 hover:-rotate-2 group relative overflow-hidden">
    <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <img src={src} alt={alt} className="w-16 h-16 object-contain filter grayscale contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:contrast-100 relative z-10" onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/128/111111/666666?text=${alt}` }} />
    <span className="text-sm mt-4 text-zinc-400 font-mono relative z-10 group-hover:text-white">{text}</span>
  </div>
);

function App() {
  return (
    <>
      <ProgressBar />

      {/* Section 1: Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-5xl mx-auto text-center w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8 text-[var(--color-terminal)]" 
            style={{ fontSize: 'clamp(2rem, 6vw, 6rem)', lineHeight: 1.1, fontFamily: 'var(--font-mono)' }}
          >
            I just wanted a login form.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xl md:text-2xl text-gray-500 mt-12 max-w-2xl mx-auto leading-relaxed"
          >
            A short story about modern authentication and authorization.
          </motion.p>
        </div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 text-gray-600 text-4xl"
        >
          ↓
        </motion.div>
      </section>

      {/* Section 2: Simple Auth */}
      <Section className="border-t border-neutral-900 border-dashed">
        <div className="max-w-4xl mx-auto text-center space-y-12 w-full">
          <h2 className="huge-text text-white">You start simple.</h2>
          <p className="text-2xl md:text-4xl text-gray-400">Username and Password in a database.</p>
          <div className="text-xl md:text-3xl text-[var(--color-terminal)] border-l-4 border-[var(--color-terminal)] pl-4 text-left mx-auto max-w-2xl mt-8">
            "It works. Users can log in."
          </div>
          <div className="pt-12 text-gray-600 font-bold uppercase tracking-widest text-xl">But then...</div>
        </div>
      </Section>

      {/* Section 3: Social Login */}
      <Section className="bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center space-y-16 w-full">
          <h2 className="huge-text text-[var(--color-error)]">Users forget passwords.</h2>
          <p className="text-2xl md:text-4xl text-gray-300 flex flex-col gap-4">
            <span>So you decide to add "Sign in with Google."</span>
            <span className="text-xl md:text-3xl mt-4">You investigate <span className="bg-[var(--color-error)] text-white px-3 py-1 font-bold">OAuth 2.0</span> and <span className="bg-[var(--color-error)] text-white px-3 py-1 font-bold">OIDC</span>.</span>
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            <LogoPair src="/logos/auth0.png" alt="Auth0" text="Auth0" />
            <LogoPair src="/logos/cognito.png" alt="Cognito" text="Cognito" />
            <LogoPair src="/logos/supabase.png" alt="Supabase" text="Supabase" />
            <LogoPair src="/logos/firebase.png" alt="Firebase" text="Firebase" />
          </div>
          <p className="text-xl text-gray-500 font-bold tracking-widest uppercase">Okay, social logins handled. Cool.</p>
        </div>
      </Section>

      {/* Section 4: B2B Enterprise */}
      <Section className="border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center space-y-16 w-full">
          <h2 className="huge-text">Then B2B happens.</h2>
          <p className="text-2xl md:text-4xl text-gray-300">
            An Enterprise customer says:
          </p>
          <div className="text-[var(--color-terminal)] text-xl md:text-3xl border-l-4 border-[var(--color-terminal)] pl-6 text-left mx-auto max-w-4xl py-4 bg-zinc-900/50">
            "We only use Corporate SSO. Can you just connect to our Active Directory?"
          </div>
          <p className="text-xl md:text-2xl text-gray-400">
            You start with <span className="text-white font-bold bg-zinc-800 px-2 py-1">LDAP</span>. It's horrible. <br className="hidden md:block"/>
            Then they ask for <span className="text-white font-bold bg-zinc-800 px-2 py-1">SAML</span>. You learn XML again.<br className="hidden md:block"/>
            Finally, everyone agrees on <span className="text-white font-bold bg-zinc-800 px-2 py-1">OIDC</span> Federation.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            <LogoPair src="/logos/ldap.png" alt="OpenLDAP" text="LDAP" />
            <LogoPair src="/logos/okta.png" alt="Okta" text="Okta" />
            <LogoPair src="/logos/pingidentity.png" alt="PingIdentity" text="PingIdentity" />
            <LogoPair src="/logos/zitadel.png" alt="Zitadel" text="Zitadel" />
          </div>
          <p className="text-xl text-gray-500 font-bold uppercase">Identity Providers orchestration begins. You survive.</p>
        </div>
      </Section>

      {/* Section 5: Authorization - RBAC */}
      <Section className="bg-neutral-950 border-t border-neutral-900 border-dashed">
        <div className="max-w-5xl mx-auto text-center space-y-16 w-full">
          <h2 className="huge-text text-[var(--color-warning)]">Wait. Who can do what?</h2>
          <p className="text-xl md:text-3xl text-gray-300">
            Authentication is solved. Now you need Authorization.
            <br/><br/>
            You implement <span className="font-bold border-b-2 border-white">RBAC</span> (Role-Based Access Control).
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-12 max-w-2xl mx-auto">
            <LogoPair src="/logos/keycloak.png" alt="Keycloak" text="Keycloak" />
            <LogoPair src="/logos/clerk.png" alt="Clerk" text="Clerk" />
          </div>
          <p className="text-xl text-gray-500 font-bold uppercase">Admin, Editor, Viewer. Simple.</p>
        </div>
      </Section>

      {/* Section 6: ABAC */}
      <Section className="border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center space-y-16 w-full">
          <h2 className="huge-text text-[var(--color-error)]">RBAC IS DEAD.</h2>
          <p className="text-xl md:text-3xl text-gray-300">
            Your CEO drops this requirement:
          </p>
          <div className="text-[var(--color-terminal)] border-l-4 border-[var(--color-terminal)] pl-6 text-left mx-auto max-w-4xl text-xl md:text-2xl py-6 bg-zinc-900/50 leading-relaxed">
            "A manager can edit a document ONLY IF the document belongs to their department AND they are accessing it during business hours AND their account is not flagged."
          </div>
          <p className="text-xl md:text-2xl text-gray-400">
            Roles aren't enough. You need Attributes. <br className="md:hidden"/> Enter <span className="bg-[var(--color-error)] text-white px-2 py-1 font-bold inline-block mt-4 md:mt-0">ABAC</span>.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            <LogoPair src="/logos/open-policy-agent.png" alt="OPA" text="Open Policy Agent" />
            <LogoPair src="/logos/cedar.png" alt="Cedar" text="Cedar" />
            <LogoPair src="/logos/casbin.png" alt="Casbin" text="Casbin" />
            <LogoPair src="/logos/oso.png" alt="Oso" text="Oso" />
          </div>
          <p className="text-xl text-gray-500 font-bold uppercase">You write Rego. You write Cedar. You write Polar.</p>
        </div>
      </Section>

      {/* Section 7: ReBAC */}
      <Section className="bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center space-y-16 w-full">
          <h2 className="huge-text text-[var(--color-terminal)]">What about Sharing?</h2>
          <p className="text-xl md:text-3xl text-gray-300">
            A user asks:
          </p>
          <div className="text-[var(--color-error)] border-l-4 border-[var(--color-error)] pl-6 text-left mx-auto max-w-4xl text-xl md:text-2xl py-6 bg-red-950/20 leading-relaxed">
            "I want to share this specific nested folder with exactly two external contractors, but they can only view documents that were created before Tuesday."
          </div>
          <p className="text-xl md:text-3xl text-gray-400">
            Welcome to Relationships. Welcome to <span className="border-b-2 border-white font-bold text-white">ReBAC</span>.<br/><br/>
            Google wrote a paper called "Zanzibar" and now it's your problem.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            <LogoPair src="/logos/google-zanzibar.png" alt="Zanzibar" text="Google Zanzibar" />
            <LogoPair src="/logos/spicedb.png" alt="SpiceDB" text="SpiceDB" />
            <LogoPair src="/logos/openfga.png" alt="OpenFGA" text="OpenFGA" />
            <LogoPair src="/logos/permify.png" alt="Permify" text="Permify" />
          </div>
        </div>
      </Section>

      {/* Section 8: Machine Auth Diagram */}
      <MachineAuthSection />

      {/* Section 9: Chaos Wall */}
      <ChaosWall />

      {/* Section 9: Resignation */}
      <Section className="bg-neutral-950 border-t border-zinc-900 border-dashed">
        <h2 className="text-3xl md:text-5xl mb-24 text-gray-600 font-bold uppercase tracking-widest text-center max-w-4xl">So you do what you have to do.</h2>
        <CodeBlock />
      </Section>

      {/* Footer */}
      <footer className="py-24 bg-black text-center border-t border-zinc-900 border-dashed flex flex-col items-center">
        <p className="text-sm text-gray-600 uppercase tracking-widest leading-loose">
          Made with frustration by a security developer. <br/>
          Please don't ask me about Auth.
        </p>
        <a href="https://github.com/kanywst/kanywst.github.io" className="mt-8 text-[var(--color-terminal)] hover:text-white border-b border-[var(--color-terminal)] hover:border-white transition-colors text-sm font-bold tracking-widest p-1">
          VIEW SOURCE ON GITHUB
        </a>
      </footer>
    </>
  );
}

export default App;
