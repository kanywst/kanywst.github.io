import config from './config';

export interface CommandResult {
  output: string;
  isError?: boolean;
}

export type CommandHandler = (args: string[]) => Promise<string> | string;

class Terminal {
  private commands: Map<string, CommandHandler> = new Map();
  private history: string[] = [];
  private historyIndex = -1;

  constructor() {
    this.registerBuiltInCommands();
  }

  private registerBuiltInCommands() {
    this.register('help', () => this.helpCommand());
    this.register('whoami', () => this.whoamiCommand());
    this.register('about', () => this.aboutCommand());
    this.register('projects', () => this.projectsCommand());
    this.register('skills', () => this.skillsCommand());
    this.register('contact', () => this.contactCommand());
    this.register('social', () => this.socialCommand());
    this.register('clear', () => '');
    this.register('pwd', () => '/home/kanywst');
    this.register('ls', () => this.lsCommand());
    this.register('cat', (args) => this.catCommand(args));
    this.register('echo', (args) => args.join(' '));
    this.register('date', () => new Date().toLocaleString());
    this.register('uname', () => 'kanywst-portfolio v1.0.0 (Modern Terminal 2026)');
    this.register('motd', () => this.motdCommand());
    this.register('resume', () => this.resumeCommand());
  }

  private helpCommand(): string {
    const lines = [
      '╔════════════════════════════════════════════════════════════╗',
      '║               Available Commands                           ║',
      '╚════════════════════════════════════════════════════════════╝',
      '',
      'whoami          Show current user information',
      'about           Display personal information',
      'projects        List notable projects',
      'skills          Show technical skills',
      'contact         Display contact information',
      'social          Show social media links',
      'resume          View resume/CV',
      'motd            Message of the day',
      'uname           System information',
      'ls              List available sections',
      'cat [file]      Read file contents',
      'echo [text]     Echo text to terminal',
      'pwd             Print working directory',
      'date            Show current date/time',
      'clear           Clear terminal screen',
      'help            Show this help message',
      '',
      '💡 Tip: Try typing "whoami" or "about" to get started!',
    ];
    return lines.join('\n');
  }

  private whoamiCommand(): string {
    const lines = [
      '',
      ' █████╗  █████╗ ███╗   ██╗██╗   ██╗██╗    ██╗███████╗████████╗',
      '██╔════╝ ██╔══██╗████╗  ██║╚██╗ ██╔╝██║    ██║██╔════╝╚══██╔══╝',
      '███████╗ ███████║██╔██╗ ██║ ╚████╔╝ ██║ █╗ ██║███████╗   ██║   ',
      '╚════██║ ██╔══██║██║╚██╗██║  ╚██╔╝  ██║███╗██║╚════██║   ██║   ',
      ' █████╔╝ ██║  ██║██║ ╚████║   ██║   ╚███╔███╔╝███████║   ██║   ',
      ' ╚════╝  ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚══╝╚══╝ ╚══════╝   ╚═╝   ',
      '',
    ];
    return lines.join('\n');
  }

  private aboutCommand(): string {
    const lines = [
      '',
      '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
      '┃ ✨ ABOUT ME                                              ┃',
      '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫',
      `┃ Name    → ${config.profile.name.padEnd(48)}┃`,
      `┃ Title   → ${config.profile.title.padEnd(48)}┃`,
      `┃ Bio     → ${config.profile.bio.substring(0, 48).padEnd(48)}┃`,
      `┃ ${config.profile.bio.substring(48).padEnd(58)}┃`,
      `┃ Location→ ${config.profile.location.padEnd(48)}┃`,
      '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫',
      '┃ 🚀 Full-stack engineer | Cloud-native architect         ┃',
      '┃ 💻 TypeScript | React | Go | Kubernetes                 ┃',
      '┃ 🌐 Building modern web applications & systems            ┃',
      '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
      '',
    ];
    return lines.join('\n');
  }

  private projectsCommand(): string {
    const lines = [
      '',
      '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
      '┃ 📦 PROJECTS                                              ┃',
      '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫',
    ];

    config.projects.forEach((project, idx) => {
      lines.push(`┃                                                         ┃`);
      lines.push(`┃ ${`${idx + 1}. ${project.name}`.padEnd(57)}┃`);
      lines.push(`┃    ${project.description.substring(0, 53).padEnd(53)}┃`);
      lines.push(`┃    🛠️  ${project.tech.join(' • ').substring(0, 49).padEnd(49)}┃`);
      lines.push(`┃    🔗 ${project.url.substring(0, 51).padEnd(51)}┃`);
    });

    lines.push('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫');
    lines.push('┃ Want to see more? Check out my GitHub!                 ┃');
    lines.push('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
    lines.push('');

    return lines.join('\n');
  }

  private skillsCommand(): string {
    const lines = [
      '',
      '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
      '┃ 🛠️  TECHNICAL SKILLS                                    ┃',
      '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫',
      '┃                                                         ┃',
      `┃ 💬 Languages                                            ┃`,
      `┃    ${config.skills.languages.join(' • ').substring(0, 51)}┃`,
      '┃                                                         ┃',
      `┃ ⚛️  Frameworks & Libraries                              ┃`,
      `┃    ${config.skills.frameworks.join(' • ').substring(0, 51)}┃`,
      '┃                                                         ┃',
      `┃ 🔧 Tools & Platforms                                    ┃`,
      `┃    ${config.skills.tools.join(' • ').substring(0, 51)}┃`,
      '┃                                                         ┃',
      '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
      '',
    ];
    return lines.join('\n');
  }

  private contactCommand(): string {
    const lines = [
      '',
      '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
      '┃ 📧 CONTACT ME                                           ┃',
      '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫',
      '┃                                                         ┃',
      `┃ 📬 Email                                                ┃`,
      `┃    ${config.profile.email.padEnd(53)}┃`,
      '┃                                                         ┃',
      `┃ 🐙 GitHub                                               ┃`,
      `┃    github.com/${config.profile.github.padEnd(41)}┃`,
      ...(config.profile.twitter 
        ? [
            '┃                                                         ┃',
            `┃ 𝕏  Twitter                                              ┃`,
            `┃    @${config.profile.twitter.padEnd(50)}┃`,
          ]
        : []),
      ...(config.profile.linkedin
        ? [
            '┃                                                         ┃',
            `┃ 🔗 LinkedIn                                             ┃`,
            `┃    ${config.profile.linkedin.padEnd(53)}┃`,
          ]
        : []),
      '┃                                                         ┃',
      '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
      '',
    ];
    return lines.join('\n');
  }

  private socialCommand(): string {
    const lines = [
      '',
      '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
      '┃ 🌐 FOLLOW ME                                            ┃',
      '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫',
      '┃                                                         ┃',
      ...config.social.map((s) => `┃ ${s.icon} ${s.name.padEnd(15)} ${s.url.substring(0, 32).padEnd(32)}┃`),
      '┃                                                         ┃',
      '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
      '',
    ];
    return lines.join('\n');
  }

  private lsCommand(): string {
    return 'about  projects  skills  contact  social  .github  .config';
  }

  private catCommand(args: string[]): string {
    const file = args[0];
    if (!file) return 'cat: missing file operand';

    const fileContents: Record<string, string> = {
      '.config': 'Custom command configuration file',
      '.github': 'GitHub profile information',
      'README.md': 'This is the portfolio terminal!',
    };

    return fileContents[file] || `cat: ${file}: No such file or directory`;
  }

  private motdCommand(): string {
    const messages = [
      '🚀 Welcome to kanywst\'s modern terminal portfolio!',
      '✨ Built with React, TypeScript, Vite & Tailwind CSS',
      '🎯 Type "help" to see available commands',
      '💫 Command history: Use ↑ and ↓ to navigate',
    ];
    const today = new Date().toLocaleDateString();
    const lines = [
      '╭─ Message of the Day ─────────────────────────────╮',
      `│ ${today}`,
      '│',
      ...messages.map((msg) => `│ ${msg}`),
      '│',
      '╰───────────────────────────────────────────────────╯',
      '',
    ];
    return lines.join('\n');
  }

  private resumeCommand(): string {
    const lines = [
      '',
      '╭─ Resume ─────────────────────────────────────────╮',
      `│ Name: ${config.profile.name}`,
      `│ Title: ${config.profile.title}`,
      '│',
      '│ Quick Summary:',
      '│ Full-stack engineer with expertise in cloud-native',
      '│ systems, DevOps, and modern web technologies.',
      '│',
      '│ Contact: ' + config.profile.email,
      '│ GitHub: https://github.com/' + config.profile.github,
      '│',
      '│ For full resume, visit LinkedIn or GitHub profile',
      '╰───────────────────────────────────────────────────╯',
      '',
    ];
    return lines.join('\n');
  }

  register(name: string, handler: CommandHandler) {
    this.commands.set(name.toLowerCase(), handler);
  }

  async execute(input: string): Promise<CommandResult> {
    if (!input.trim()) {
      return { output: '' };
    }

    this.history.push(input);
    this.historyIndex = -1;

    const [command, ...args] = input.trim().split(/\s+/);
    const cmd = command.toLowerCase();

    if (cmd === 'clear') {
      return { output: 'CLEAR_SCREEN' };
    }

    const handler = this.commands.get(cmd);
    if (!handler) {
      return {
        output: `${cmd}: command not found. Type 'help' for available commands.`,
        isError: true,
      };
    }

    try {
      const output = await Promise.resolve(handler(args));
      return { output };
    } catch (error) {
      return {
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true,
      };
    }
  }

  getHistory(): string[] {
    return this.history;
  }

  getPreviousCommand(): string | null {
    if (this.history.length === 0) return null;
    this.historyIndex = Math.min(this.historyIndex + 1, this.history.length - 1);
    return this.history[this.history.length - 1 - this.historyIndex];
  }

  getNextCommand(): string | null {
    if (this.historyIndex <= 0) {
      this.historyIndex = -1;
      return null;
    }
    this.historyIndex--;
    return this.history[this.history.length - 1 - this.historyIndex];
  }
}

export default Terminal;
