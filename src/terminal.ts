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
    return `${config.profile.name}@terminal:~$ ${config.profile.name}`;
  }

  private aboutCommand(): string {
    const lines = [
      '',
      '╭─ About ─────────────────────────────────────────────────╮',
      `│ Name:     ${config.profile.name}`,
      `│ Title:    ${config.profile.title}`,
      `│ Bio:      ${config.profile.bio}`,
      `│ Location: ${config.profile.location}`,
      '╰──────────────────────────────────────────────────────────╯',
      '',
    ];
    return lines.join('\n');
  }

  private projectsCommand(): string {
    const lines = [
      '',
      '╭─ Projects ──────────────────────────────────────────────╮',
    ];

    config.projects.forEach((project, index) => {
      lines.push(`│`);
      lines.push(`│ ${index + 1}. ${project.name}`);
      lines.push(`│    ${project.description}`);
      lines.push(`│    Tech: ${project.tech.join(', ')}`);
      lines.push(`│    ${project.url}`);
    });

    lines.push('│');
    lines.push('╰──────────────────────────────────────────────────────────╯');
    lines.push('');

    return lines.join('\n');
  }

  private skillsCommand(): string {
    const lines = [
      '',
      '╭─ Technical Skills ──────────────────────────────────────╮',
      `│`,
      `│ Languages:   ${config.skills.languages.join(', ')}`,
      `│ Frameworks:  ${config.skills.frameworks.join(', ')}`,
      `│ Tools:       ${config.skills.tools.join(', ')}`,
      `│`,
      '╰──────────────────────────────────────────────────────────╯',
      '',
    ];
    return lines.join('\n');
  }

  private contactCommand(): string {
    const lines = [
      '',
      '╭─ Contact ───────────────────────────────────────────────╮',
      `│ Email:  ${config.profile.email}`,
      `│ GitHub: github.com/${config.profile.github}`,
      config.profile.twitter ? `│ Twitter: @${config.profile.twitter}` : '',
      config.profile.linkedin ? `│ LinkedIn: ${config.profile.linkedin}` : '',
      '╰──────────────────────────────────────────────────────────╯',
      '',
    ];
    return lines.filter(Boolean).join('\n');
  }

  private socialCommand(): string {
    const lines = [
      '',
      '╭─ Follow Me ─────────────────────────────────────────────╮',
      ...config.social.map((s) => `│ ${s.icon} ${s.name}: ${s.url}`),
      '╰──────────────────────────────────────────────────────────╯',
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
