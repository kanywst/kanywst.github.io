import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '../terminal';

interface HistoryItem {
  command: string;
  output: string;
  isError?: boolean;
}

const TerminalUI: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: '',
      output: `Welcome to kanywst's terminal portfolio! 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Try 'help' for available commands or 'whoami' to get started!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalRef = useRef<Terminal>(new Terminal());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 0);
    }
  }, [history]);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const command = input;
    setInput('');

    try {
      const result = await terminalRef.current.execute(command);

      if (result.output === 'CLEAR_SCREEN') {
        setHistory([]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command,
            output: result.output,
            isError: result.isError,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevCommand = terminalRef.current.getPreviousCommand();
      if (prevCommand) setInput(prevCommand);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCommand = terminalRef.current.getNextCommand();
      setInput(nextCommand || '');
    }
  };

  return (
    <div
      className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-4 border-b border-slate-700/50 backdrop-blur-md bg-slate-900/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
          <span className="text-cyan-300 font-mono text-sm">kanywst@terminal</span>
          <span className="text-slate-500">~</span>
        </div>
      </motion.div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative z-10 px-6 py-4 font-mono text-sm"
      >
        <AnimatePresence>
          {history.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              {/* Command line */}
              {item.command && (
                <div className="flex items-start gap-2 text-cyan-400 mb-2">
                  <span className="text-green-400">$</span>
                  <span className="flex-1 break-words">{item.command}</span>
                </div>
              )}

              {/* Output */}
              <div
                className={`whitespace-pre-wrap break-words leading-relaxed ${
                  item.isError ? 'text-red-400' : 'text-slate-300'
                }`}
              >
                {item.output}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cyan-400"
          >
            <span className="inline-block">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ⟳
              </motion.span>
            </span>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="relative z-10 px-6 py-4 border-t border-slate-700/50 backdrop-blur-md bg-slate-900/30"
      >
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-cyan-300 placeholder-slate-500 outline-none font-mono text-sm"
            autoComplete="off"
            spellCheck="false"
          />
          <motion.div
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-5 bg-cyan-400"
          />
        </div>
      </motion.form>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 px-6 py-2 text-center text-xs text-slate-500 border-t border-slate-700/50 backdrop-blur-md bg-slate-900/30"
      >
        <p>Press ↑ and ↓ to navigate command history • Type 'help' for commands</p>
      </motion.div>
    </div>
  );
};

export default TerminalUI;
