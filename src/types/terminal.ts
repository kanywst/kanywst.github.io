export interface CommandResult {
  content: React.ReactNode;
  type: 'success' | 'error' | 'info' | 'system';
}

export interface Command {
  name: string;
  description: string;
  action: (args: string[]) => CommandResult | Promise<CommandResult>;
}

export interface TerminalHistory {
  command: string;
  result: CommandResult;
  timestamp: string;
}
