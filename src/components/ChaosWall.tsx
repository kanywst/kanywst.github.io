import { motion } from 'framer-motion';

const allLogos = [
  "keycloak", "auth0", "ory-kratos", "ory-hydra", "zitadel", "clerk", "supabase", "firebase",
  "cognito", "okta", "pingidentity", "open-policy-agent", "cedar", "google-zanzibar", "spicedb",
  "openfga", "casbin", "permify", "oso", "topaz", "biscuits", "macaroons", "spiffe", "spire",
  "teleport", "boundary"
];

// Combine and shuffle multiple times for a huge chaos wall
const chaosLogos = [...allLogos, ...allLogos.slice().reverse(), ...allLogos].slice(0, 48);

export function ChaosWall() {
  return (
    <div className="relative w-full overflow-hidden py-32 border-t border-neutral-900 bg-black flex justify-center items-center min-h-screen">
      <div className="absolute inset-0 z-10 w-full h-full opacity-30 pointer-events-none grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 scale-110">
        {chaosLogos.map((logo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index % 10) * 0.1, duration: 0.5 }}
            className="border border-neutral-800 p-4 flex items-center justify-center aspect-square"
          >
            <img src={`/logos/${logo}.png`} alt={logo} className="w-10 h-10 object-contain filter grayscale" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
