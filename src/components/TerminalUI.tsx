import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from '../terminal';
import Typewriter from './Typewriter';

interface HistoryItem {
  command: string;
  output: string;
  isError?: boolean;
  showTypewriter?: boolean;
}

const TerminalUI: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: '',
      output: `
 █████╗  █████╗ ███╗   ██╗██╗   ██╗██╗    ██╗███████╗████████╗
██╔════╝ ██╔══██╗████╗  ██║╚██╗ ██╔╝██║    ██║██╔════╝╚══██╔══╝
███████╗ ███████║██╔██╗ ██║ ╚████╔╝ ██║ █╗ ██║███████╗   ██║   
╚════██║ ██╔══██║██║╚██╗██║  ╚██╔╝  ██║███╗██║╚════██║   ██║   
 █████╔╝ ██║  ██║██║ ╚████║   ██║   ╚███╔███╔╝███████║   ██║   
 ╚════╝  ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚══╝╚══╝ ╚══════╝   ╚═╝   

✨ Welcome to kanywst's Modern Terminal Portfolio
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Try these commands to get started:
   • whoami    - Display ASCII art greeting
   • about     - Learn about me
   • projects  - See my work
   • skills    - Check out my tech stack
   • help      - View all commands

Type 'help' for the complete command list!`,
      showTypewriter: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalRef = useRef<Terminal>(new Terminal());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 0);
    }
  }, [history]);

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
            showTypewriter: true,
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
      className="w-full h-screen bg-slate-950 overflow-hidden flex flex-col font-mono relative"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Smooth background gradients - future-forward design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
        
        {/* Flowing orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full blur-3xl will-change-transform"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 120, 0],
            scale: [1.5, 1, 1.5],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500 rounded-full blur-3xl will-change-transform"
        />
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, 80, 0],
            scale: [1.2, 1.3, 1.2],
            opacity: [0.04, 0.12, 0.04],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/3 left-1/2 w-72 h-72 bg-purple-500 rounded-full blur-3xl will-change-transform"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 px-8 py-6 border-b border-cyan-500/20 backdrop-blur-2xl bg-slate-900/40"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 10px rgba(0, 240, 255, 0.4)',
                  '0 0 30px rgba(0, 240, 255, 0.8)',
                  '0 0 10px rgba(0, 240, 255, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-3 h-3 rounded-full bg-cyan-400"
            />
            <span className="text-cyan-300 font-mono text-xs tracking-widest">KANYWST@TERMINAL</span>
            <span className="text-cyan-500/60">→</span>
            <span className="text-slate-400 font-mono text-xs">portfolio</span>
          </div>
          <motion.span
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-cyan-400/60 text-xs font-mono"
          >
            ◆ LIVE
          </motion.span>
        </div>
      </motion.div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative z-10 px-8 py-6 space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {history.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-2"
            >
              {/* Command line */}
              {item.command && (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                    className="text-green-400 font-bold"
                  >
                    ➜
                  </motion.span>
                  <span className="text-cyan-300 font-mono">{item.command}</span>
                </motion.div>
              )}

              {/* Output */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`pl-6 ${item.isError ? 'text-red-400' : 'text-slate-300'}`}
              >
                {item.showTypewriter ? (
                  <Typewriter text={item.output} delay={100} speed={15} />
                ) : (
                  <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {item.output}
                  </pre>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-cyan-400"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⟳
            </motion.span>
            <span className="text-cyan-300">Processing...</span>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        onSubmit={handleSubmit}
        className="relative z-10 px-8 py-6 border-t border-cyan-500/20 backdrop-blur-2xl bg-slate-900/40"
      >
        <div className="flex items-center gap-4">
          <motion.span
            animate={{
              scale: [1, 1.15, 1],
              color: ['#00f0ff', '#ff006e', '#00f0ff'],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="font-bold text-lg"
          >
            ❯
          </motion.span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-cyan-300 placeholder-slate-500 outline-none font-mono text-sm caret-pink-400 focus:text-cyan-200 transition-colors duration-300"
            autoComplete="off"
            spellCheck="false"
          />
          <motion.div
            animate={{
              opacity: [0.4, 1, 0.4],
              boxShadow: [
                '0 0 5px rgba(0, 240, 255, 0.3)',
                '0 0 15px rgba(255, 0, 110, 0.6)',
                '0 0 5px rgba(0, 240, 255, 0.3)',
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-pink-400 rounded-full"
          />
        </div>
      </motion.form>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 px-8 py-3 text-center border-t border-cyan-500/10 backdrop-blur-xl bg-slate-900/20"
      >
        <p className="text-cyan-500/70 font-mono text-xs tracking-wider">↑ ↓ history • help • whoami • about</p>
        <p className="text-slate-500 text-xs mt-1">2026 • Modern Terminal Portfolio</p>
      </motion.div>
    </div>
  );
};

export default TerminalUI;
