import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTerminal } from '../hooks/useTerminal';
import '../styles/terminal.css';

const Prompt = () => (
  <div className="prompt-wrapper">
    <span className="user-part">guest@kanywst.os</span>
    <span className="prompt-sep">:</span>
    <span className="path-part">~</span>
    <span className="prompt-symbol">$</span>
  </div>
);

export const Terminal: React.FC = () => {
  const { history, input, setInput, executeCommand, handleKeyDown } = useTerminal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="terminal-container" onClick={focusInput}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="terminal-window"
      >
        <div className="terminal-header">
          <div className="header-left">
            <span>guest@kanywst.os: ~</span>
          </div>
          <div className="header-controls">
            <div className="control-dot"></div>
            <div className="control-dot"></div>
            <div className="control-dot close"></div>
          </div>
        </div>

        <div className="terminal-content" ref={scrollRef}>
          <div className="welcome-msg">
            <h1 className="glitch-text">KANYWST.OS</h1>
            <p className="system-info">WELCOME TO THE TERMINAL. TYPE 'help' TO DISCOVER AVAILABLE COMMANDS.</p>
          </div>

          <div className="history-list">
            {history.map((entry, i) => (
              <div key={i} className="history-item">
                <div className="history-line">
                  <Prompt />
                  <span className="command-text">{entry.command}</span>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`history-result ${entry.result.type}`}
                >
                  {entry.result.content}
                </motion.div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="input-line">
            <Prompt />
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoFocus
                className="command-input"
              />
            </div>
          </form>
        </div>
      </motion.div>
      
      <div className="scanline"></div>
    </div>
  );
};
