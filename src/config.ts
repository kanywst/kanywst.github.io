export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => string | Promise<string>;
  aliases?: string[];
  category?: string;
}

export interface CommandConfig {
  commands: Record<string, Command>;
  profile: {
    name: string;
    title: string;
    bio: string;
    location: string;
    email: string;
    github: string;
    twitter?: string;
    linkedin?: string;
  };
  projects: Array<{
    name: string;
    description: string;
    url: string;
    tech: string[];
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
  };
  social: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
}

const config: CommandConfig = {
  profile: {
    name: 'kanywst',
    title: 'Software Engineer | Cloud Architect',
    bio: 'Building modern cloud-native systems with cutting-edge technology',
    location: '🌍 Global',
    email: 'hello@kanywst.dev',
    github: 'kanywst',
    twitter: 'kanywst',
    linkedin: 'kanywst',
  },
  projects: [
    {
      name: 'Terminal Portfolio',
      description: 'Modern terminal-style self-introduction web app',
      url: 'https://kanywst.github.io',
      tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    },
    {
      name: 'Cloud Architecture Projects',
      description: 'SPIRE, Istio, and cloud-native security implementations',
      url: 'https://github.com/kanywst',
      tech: ['Kubernetes', 'CNCF', 'Security', 'Infrastructure'],
    },
  ],
  skills: {
    languages: ['TypeScript', 'JavaScript', 'Go', 'Python', 'SQL'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Tailwind CSS'],
    tools: ['Kubernetes', 'Docker', 'Git', 'GitHub Actions', 'Cloud Platforms'],
  },
  social: [
    { name: 'GitHub', url: 'https://github.com/kanywst', icon: '💻' },
    { name: 'Twitter', url: 'https://twitter.com/kanywst', icon: '𝕏' },
    { name: 'Email', url: 'mailto:hello@kanywst.dev', icon: '✉️' },
  ],
  commands: {},
};

export default config;
