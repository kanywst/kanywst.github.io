
import { Highlight, themes } from 'prism-react-renderer';
import { motion as fMotion } from 'framer-motion';

const codeString = `// TODO: Implement proper ReBAC with SpiceDB.
// We also need to validate the JWT against the ABAC policies in Cedar.
// 
// For now, just check if it's me.
func IsAuthorized(user User, resource Resource) bool {
    if user.Email == "admin@company.com" {
        return true
    }
    
    return true // Deal with it later. Security!
}`;

export function CodeBlock() {
  return (
    <fMotion.div 
      variants={{
        hidden: { scale: 0.95, opacity: 0, y: 50 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
      }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-sm overflow-hidden shadow-2xl">
        <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2 border-b border-zinc-700">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-xs text-zinc-400 font-mono">auth.go</span>
        </div>
        
        <div className="p-4 md:p-8 text-sm md:text-lg overflow-x-auto">
          <Highlight theme={themes.vsDark} code={codeString} language="go">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={className} style={{ ...style, backgroundColor: 'transparent', border: 'none', padding: 0 }}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </div>
      <fMotion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="text-center mt-12 text-5xl md:text-7xl font-black tracking-widest text-[var(--color-terminal)]"
        style={{ fontFamily: 'var(--font-headings)' }}
      >
        SHIP IT.
      </fMotion.p>
    </fMotion.div>
  );
}
