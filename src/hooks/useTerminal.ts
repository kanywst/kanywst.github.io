import { useState, useCallback, useRef, useEffect } from 'react';
import { COMMANDS } from '../config/commands';
import { TerminalHistory, CommandResult } from '../types/terminal';

export const useTerminal = () => {
  const [history, setHistory] = useState<TerminalHistory[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const executeCommand = useCallback(async (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    // Add to command history (for up/down keys)
    setCommandHistory(prev => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const [cmdName, ...args] = trimmed.split(' ');
    const command = COMMANDS[cmdName.toLowerCase()];

    let result: CommandResult;

    if (cmdName.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (command) {
      try {
        result = await command.action(args);
      } catch (error) {
        result = {
          content: `sh: command execution failed: ${cmdName}`,
          type: 'error',
        };
      }
    } else {
      result = {
        content: `sh: command not found: ${cmdName}. Type 'help' for available commands.`,
        type: 'error',
      };
    }

    setHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        result,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setInput('');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const availableCommands = Object.keys(COMMANDS);
      const match = availableCommands.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return {
    history,
    input,
    setInput,
    executeCommand,
    handleKeyDown,
  };
};
