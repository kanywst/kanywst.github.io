"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="animated-bg"></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <div className="relative w-32 h-32 mx-auto mb-6 overflow-hidden rounded-full border-4 border-white/20 shadow-lg">
            <Image
              src="/images/avatar.jpg"
              alt="kanywst"
              width={128}
              height={128}
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">kanywst</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Security Engineer</p>
          
          <div className="flex justify-center mt-6">
            <a 
              href="https://github.com/kanywst" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="GitHub Profile"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </header>

        <section className="profile-section">
          <h2 className="profile-heading">About Me</h2>
          <p className="mb-6">
            I'm a security engineer with a deep focus on system design, architecture, security, and DevOps. 
            Rather than just writing code, I'm interest in designing robust systems, creating secure architectures, and implementing 
            best practices across the entire development lifecycle.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white/5 dark:bg-black/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-2 text-lg">Professional Role</h3>
              <p>Security Engineer with expertise in architecture, security, and cloud infrastructure</p>
            </div>
            <div className="bg-white/5 dark:bg-black/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-2 text-lg">Industry Focus</h3>
              <p>Cloud-native and security-focused products</p>
            </div>
            <div className="bg-white/5 dark:bg-black/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-2 text-lg">Technical Approach</h3>
              <p>Understanding fundamentals from RFCs, IETF standards, and NIST guidelines rather than just following trends</p>
            </div>
            <div className="bg-white/5 dark:bg-black/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-2 text-lg">Documentation</h3>
              <p>Creating clear, detailed documentation with Mermaid diagrams and ASCII art for better knowledge sharing</p>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-heading">Core Expertise</h2>
          
          <div className="mb-8">
            <h3 className="font-bold mb-3 text-lg">Authentication & Authorization</h3>
            <div className="mb-4">
              <span className="skill-tag tag-security">OAuth</span>
              <span className="skill-tag tag-security">OIDC</span>
              <span className="skill-tag tag-security">AuthZEN</span>
              <span className="skill-tag tag-security">SPIFFE/SPIRE</span>
              <span className="skill-tag tag-security">Zanzibar</span>
              <span className="skill-tag tag-security">SpiceDB</span>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10 shadow-xl overflow-hidden">
              <h4 className="text-lg font-bold mb-4 text-center">AuthZEN: The Future of Authorization</h4>
              
              <div className="relative h-80 mb-4">
                {/* Interactive AuthZEN Visualization */}
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* Central Authorization Engine */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/30 to-violet-500/30 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-fuchsia-600/40 to-violet-600/40 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm font-bold">AuthZEN</div>
                        <div className="text-xs opacity-80">Policy Engine</div>
                      </div>
                    </div>
                    
                    {/* Rotating Outer Ring */}
                    <div className="absolute inset-[-10px] border-4 border-dashed border-fuchsia-500/30 rounded-full animate-spin-slow"></div>
                  </div>
                  
                  {/* Dynamic Policy Evaluation */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4 h-16 bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 rounded-lg border border-fuchsia-500/20 flex flex-col items-center justify-center">
                    <div className="text-xs font-bold mb-1">Real-time Policy Evaluation</div>
                    <div className="flex space-x-2">
                      <div className="px-2 py-1 bg-fuchsia-500/20 rounded text-[10px] animate-pulse">Context</div>
                      <div className="px-2 py-1 bg-violet-500/20 rounded text-[10px] animate-pulse delay-100">Identity</div>
                      <div className="px-2 py-1 bg-pink-500/20 rounded text-[10px] animate-pulse delay-200">Resource</div>
                      <div className="px-2 py-1 bg-indigo-500/20 rounded text-[10px] animate-pulse delay-300">Action</div>
                    </div>
                  </div>
                  
                  {/* Resource Hierarchy */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-24 h-48">
                    <div className="absolute inset-0 flex flex-col items-center">
                      <div className="text-xs font-bold mb-2">Resource Hierarchy</div>
                      
                      {/* Tree Structure */}
                      <div className="relative w-full h-40">
                        {/* Root Node */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-violet-500/30 rounded flex items-center justify-center text-[10px] font-semibold">
                          Root
                        </div>
                        
                        {/* Connecting Lines */}
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-violet-500/30"></div>
                        
                        {/* Middle Nodes */}
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full flex justify-around">
                          <div className="w-8 h-6 bg-violet-500/30 rounded flex items-center justify-center text-[8px]">
                            Folder
                          </div>
                          <div className="w-8 h-6 bg-violet-500/30 rounded flex items-center justify-center text-[8px]">
                            Folder
                          </div>
                        </div>
                        
                        {/* Connecting Lines */}
                        <div className="absolute top-18 left-1/4 transform -translate-x-1/2 w-0.5 h-4 bg-violet-500/30"></div>
                        <div className="absolute top-18 left-3/4 transform -translate-x-1/2 w-0.5 h-4 bg-violet-500/30"></div>
                        
                        {/* Leaf Nodes */}
                        <div className="absolute top-22 w-full flex justify-around">
                          <div className="w-6 h-5 bg-violet-500/30 rounded flex items-center justify-center text-[7px]">
                            Doc
                          </div>
                          <div className="w-6 h-5 bg-violet-500/30 rounded flex items-center justify-center text-[7px]">
                            Doc
                          </div>
                          <div className="w-6 h-5 bg-violet-500/30 rounded flex items-center justify-center text-[7px]">
                            Doc
                          </div>
                        </div>
                        
                        {/* Highlight Animation */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-8 border border-yellow-400 rounded opacity-0 animate-ping" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
                        <div className="absolute top-12 left-1/4 transform -translate-x-1/2 w-8 h-6 border border-yellow-400 rounded opacity-0 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                        <div className="absolute top-22 left-1/6 transform -translate-x-1/2 w-6 h-5 border border-yellow-400 rounded opacity-0 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Relationship Graph */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-24 h-48">
                    <div className="absolute inset-0 flex flex-col items-center">
                      <div className="text-xs font-bold mb-2">Relationship Graph</div>
                      
                      {/* Graph Nodes */}
                      <div className="relative w-full h-40">
                        {/* User Node */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-fuchsia-500/30 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-fuchsia-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        
                        {/* Group Nodes */}
                        <div className="absolute top-20 left-1/4 transform -translate-x-1/2 w-8 h-8 bg-pink-500/30 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-pink-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                          </svg>
                        </div>
                        
                        <div className="absolute top-20 right-0 transform translate-x-1/2 w-8 h-8 bg-pink-500/30 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-pink-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                          </svg>
                        </div>
                        
                        {/* Resource Node */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-indigo-500/30 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        
                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <line x1="50" y1="14" x2="25" y2="40" stroke="rgba(219, 39, 119, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
                          <line x1="50" y1="14" x2="75" y2="40" stroke="rgba(219, 39, 119, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
                          <line x1="25" y1="40" x2="50" y2="70" stroke="rgba(79, 70, 229, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
                          <line x1="75" y1="40" x2="50" y2="70" stroke="rgba(79, 70, 229, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
                        </svg>
                        
                        {/* Animated Highlight */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 border-2 border-yellow-400 rounded-full opacity-0 animate-ping" style={{ animationDuration: '4s', animationDelay: '0s' }}></div>
                        <div className="absolute top-20 left-1/4 transform -translate-x-1/2 w-8 h-8 border-2 border-yellow-400 rounded-full opacity-0 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 border-2 border-yellow-400 rounded-full opacity-0 animate-ping" style={{ animationDuration: '4s', animationDelay: '2s' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decision Points */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-16 bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 rounded-lg border border-fuchsia-500/20 flex items-center justify-around px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center mb-1">
                        <svg className="w-5 h-5 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="text-[10px]">Allow</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-yellow-500/30 rounded-full flex items-center justify-center mb-1">
                        <svg className="w-5 h-5 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="text-[10px]">Challenge</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center mb-1">
                        <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="text-[10px]">Deny</span>
                    </div>
                  </div>
                  
                  {/* Animated Decision Path */}
                  <div className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                      <path d="M200,40 C120,80 120,150 120,220" stroke="rgba(217, 70, 239, 0)" strokeWidth="2" strokeDasharray="6,3" fill="none">
                        <animate attributeName="stroke" values="rgba(217, 70, 239, 0); rgba(217, 70, 239, 0.6); rgba(217, 70, 239, 0)" dur="4s" repeatCount="indefinite" />
                      </path>
                      <path d="M200,40 C280,80 280,150 280,220" stroke="rgba(139, 92, 246, 0)" strokeWidth="2" strokeDasharray="6,3" fill="none">
                        <animate attributeName="stroke" values="rgba(139, 92, 246, 0); rgba(139, 92, 246, 0.6); rgba(139, 92, 246, 0)" dur="4s" repeatCount="indefinite" begin="2s" />
                      </path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <p className="text-sm opacity-80 text-center">
                AuthZEN revolutionizes authorization with dynamic, context-aware policies and fine-grained access control.
                It combines relationship-based permissions, resource hierarchies, and real-time evaluation to make complex
                authorization decisions simple, secure, and scalable!
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-bold mb-3 text-lg">TLS & Certificate Management</h3>
            <div className="mb-4">
              <span className="skill-tag tag-security">Server Certificates</span>
              <span className="skill-tag tag-security">Client Certificates</span>
              <span className="skill-tag tag-security">ACME</span>
              <span className="skill-tag tag-security">mTLS</span>
              <span className="skill-tag tag-security">TLS Handshake</span>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 shadow-xl overflow-hidden">
              <h4 className="text-lg font-bold mb-4 text-center">TLS Handshake: The Secret Tunnel Builder</h4>
              
              <div className="relative h-72 mb-4">
                {/* Interactive TLS Handshake Visualization */}
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* Client Side */}
                  <div className="absolute left-0 top-4 w-1/4 h-64 bg-gradient-to-b from-green-500/10 to-transparent rounded-lg border border-green-500/30 flex flex-col items-center pt-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-1 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold mb-2">Client</span>
                    
                    <div className="w-full px-2">
                      <div className="bg-white/10 rounded p-1 mb-2 text-xs">
                        1. ClientHello
                        <div className="text-[10px] opacity-70">Supported TLS versions, cipher suites</div>
                      </div>
                      <div className="bg-white/10 rounded p-1 mb-2 text-xs">
                        3. Client Key Exchange
                        <div className="text-[10px] opacity-70">Encrypted pre-master secret</div>
                      </div>
                      <div className="bg-white/10 rounded p-1 mb-2 text-xs">
                        4. Finished
                        <div className="text-[10px] opacity-70">Verify handshake success</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Server Side */}
                  <div className="absolute right-0 top-4 w-1/4 h-64 bg-gradient-to-b from-blue-500/10 to-transparent rounded-lg border border-blue-500/30 flex flex-col items-center pt-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-1 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold mb-2">Server</span>
                    
                    <div className="w-full px-2">
                      <div className="bg-white/10 rounded p-1 mb-2 text-xs">
                        2. ServerHello + Certificate
                        <div className="text-[10px] opacity-70">Server's identity proof</div>
                      </div>
                      <div className="bg-white/10 rounded p-1 mb-2 text-xs">
                        5. Finished
                        <div className="text-[10px] opacity-70">Handshake complete</div>
                      </div>
                      <div className="bg-white/10 rounded p-1 text-xs">
                        6. Encrypted Application Data
                      </div>
                    </div>
                  </div>
                  
                  {/* The Secure Tunnel */}
                  <div className="absolute left-1/4 right-1/4 top-1/2 transform -translate-y-1/2 h-16 flex items-center justify-center">
                    {/* Tunnel Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-blue-500/20 rounded-full blur-md"></div>
                    
                    {/* Encryption Visualization */}
                    <div className="relative w-full h-8 overflow-hidden">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full flex justify-around">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className={`h-6 w-6 rounded-full bg-gradient-to-r from-green-400 to-blue-400 opacity-80 animate-pulse`} style={{animationDelay: `${i * 0.2}s`}}></div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                          Encrypted Tunnel
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Certificate Detail */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 bg-white/10 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-xs font-mono mb-1 text-center font-bold">X.509 Certificate</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      <div className="px-2 py-1 bg-blue-500/20 rounded text-[10px]">Subject</div>
                      <div className="px-2 py-1 bg-green-500/20 rounded text-[10px]">Issuer</div>
                      <div className="px-2 py-1 bg-purple-500/20 rounded text-[10px]">Public Key</div>
                      <div className="px-2 py-1 bg-amber-500/20 rounded text-[10px]">Validity</div>
                      <div className="px-2 py-1 bg-red-500/20 rounded text-[10px]">Signature</div>
                    </div>
                    <div className="mt-2 text-[10px] opacity-80 text-center">
                      Digital ID cards that prove server identity and enable encryption
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm opacity-80 text-center">
                TLS creates a magical encrypted tunnel between you and servers, protecting your data from eavesdroppers.
                It's like having a private conversation in a crowded room where only you and the server can understand each other!
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-bold mb-3 text-lg">Kubernetes & Cloud Native</h3>
            <div className="mb-4">
              <span className="skill-tag tag-kubernetes">Webhook</span>
              <span className="skill-tag tag-kubernetes">CSI/CNI</span>
              <span className="skill-tag tag-kubernetes">StatefulSet</span>
              <span className="skill-tag tag-kubernetes">cert-manager</span>
              <span className="skill-tag tag-kubernetes">Istio Ambient Mesh</span>
              <span className="skill-tag tag-kubernetes">Envoy</span>
              <span className="skill-tag tag-kubernetes">Gatekeeper</span>
              <span className="skill-tag tag-kubernetes">OPA</span>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 shadow-xl overflow-hidden">
              <h4 className="text-lg font-bold mb-4 text-center">Kubernetes: The Container Orchestra Conductor</h4>
              
              <div className="relative h-80 mb-4">
                {/* Interactive Kubernetes Architecture Visualization */}
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* Control Plane */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-lg border border-blue-500/30 flex flex-col items-center justify-center">
                    <div className="text-sm font-bold mb-1">Control Plane</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <div className="px-2 py-1 bg-blue-500/20 rounded text-xs">API Server</div>
                      <div className="px-2 py-1 bg-blue-500/20 rounded text-xs">Scheduler</div>
                      <div className="px-2 py-1 bg-blue-500/20 rounded text-xs">Controller Manager</div>
                      <div className="px-2 py-1 bg-blue-500/20 rounded text-xs">etcd</div>
                    </div>
                  </div>
                  
                  {/* Worker Nodes */}
                  <div className="absolute top-32 left-0 right-0 flex justify-around">
                    {/* Node 1 */}
                    <div className="w-[30%] h-40 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-lg border border-cyan-500/30 p-2">
                      <div className="text-xs font-bold mb-2 text-center">Worker Node 1</div>
                      <div className="flex justify-center mb-2">
                        <div className="px-2 py-1 bg-cyan-500/20 rounded text-xs">kubelet</div>
                      </div>
                      
                      {/* Pods */}
                      <div className="flex flex-wrap justify-center gap-1">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="w-6 h-6 bg-blue-500/40 rounded-md"></div>
                        </div>
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center animate-pulse delay-100">
                          <div className="w-6 h-6 bg-purple-500/40 rounded-md"></div>
                        </div>
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center animate-pulse delay-200">
                          <div className="w-6 h-6 bg-green-500/40 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Node 2 */}
                    <div className="w-[30%] h-40 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-lg border border-cyan-500/30 p-2">
                      <div className="text-xs font-bold mb-2 text-center">Worker Node 2</div>
                      <div className="flex justify-center mb-2">
                        <div className="px-2 py-1 bg-cyan-500/20 rounded text-xs">kubelet</div>
                      </div>
                      
                      {/* Pods */}
                      <div className="flex flex-wrap justify-center gap-1">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center animate-pulse delay-150">
                          <div className="w-6 h-6 bg-blue-500/40 rounded-md"></div>
                        </div>
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center animate-pulse delay-250">
                          <div className="w-6 h-6 bg-purple-500/40 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Node 3 */}
                    <div className="w-[30%] h-40 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-lg border border-cyan-500/30 p-2">
                      <div className="text-xs font-bold mb-2 text-center">Worker Node 3</div>
                      <div className="flex justify-center mb-2">
                        <div className="px-2 py-1 bg-cyan-500/20 rounded text-xs">kubelet</div>
                      </div>
                      
                      {/* Pods */}
                      <div className="flex flex-wrap justify-center gap-1">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center animate-pulse delay-200">
                          <div className="w-6 h-6 bg-blue-500/40 rounded-md"></div>
                        </div>
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center animate-pulse delay-300">
                          <div className="w-6 h-6 bg-green-500/40 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Mesh Overlay */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/30 flex flex-col items-center justify-center">
                    <div className="text-sm font-bold mb-1">Service Mesh</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <div className="px-2 py-1 bg-indigo-500/20 rounded text-xs">Traffic Management</div>
                      <div className="px-2 py-1 bg-indigo-500/20 rounded text-xs">Security</div>
                      <div className="px-2 py-1 bg-indigo-500/20 rounded text-xs">Observability</div>
                    </div>
                    
                    {/* Connection Lines */}
                    <div className="absolute inset-0">
                      <svg className="w-full h-full" viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20,0 C20,12 40,12 40,24" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="0.5" fill="none" strokeDasharray="1,1" />
                        <path d="M50,0 C50,12 50,12 50,24" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="0.5" fill="none" strokeDasharray="1,1" />
                        <path d="M80,0 C80,12 60,12 60,24" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="0.5" fill="none" strokeDasharray="1,1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm opacity-80 text-center">
                Kubernetes orchestrates containers like a symphony conductor, ensuring your applications are always running, 
                scaling, and healing automatically. It's like having a team of robot sysadmins working 24/7!
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-3 text-lg">Zero Trust & Security</h3>
            <div className="mb-4">
              <span className="skill-tag tag-security">Zero Trust</span>
              <span className="skill-tag tag-security">RFC/IETF</span>
              <span className="skill-tag tag-security">NIST</span>
              <span className="skill-tag tag-devops">Secure CI/CD</span>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-red-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 shadow-xl overflow-hidden">
              <h4 className="text-lg font-bold mb-4 text-center">Zero Trust: Trust Nothing, Verify Everything</h4>
              
              <div className="relative h-80 mb-4">
                {/* Interactive Zero Trust Visualization */}
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* Traditional Perimeter (Faded) */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4/5 h-72 border-2 border-dashed border-gray-500/30 rounded-lg flex items-center justify-center">
                    <div className="absolute top-0 transform -translate-y-3 bg-gray-800/80 px-3 py-1 rounded text-xs">
                      Traditional Perimeter (Obsolete)
                    </div>
                    <div className="absolute -bottom-3 right-8 text-xs text-gray-500/70">
                      "Castle and Moat" approach
                    </div>
                  </div>
                  
                  {/* Zero Trust Elements */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                    {/* Central Policy Engine */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full flex items-center justify-center border border-purple-500/50 z-20 animate-pulse">
                      <div className="text-center">
                        <div className="text-xs font-bold">Policy Engine</div>
                        <div className="text-[10px] opacity-70">Zero Trust</div>
                      </div>
                    </div>
                    
                    {/* Orbiting Elements */}
                    <div className="absolute inset-0 animate-spin-slow">
                      {/* User */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-lg flex flex-col items-center justify-center border border-blue-500/50">
                          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                          </svg>
                          <div className="text-[10px] mt-1">Users</div>
                        </div>
                      </div>
                      
                      {/* Devices */}
                      <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-lg flex flex-col items-center justify-center border border-green-500/50">
                          <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v3.586l-1 1V3H6v3.586l-1 1V2zm3.5 5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-3zm-3 3a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-9z" clipRule="evenodd"></path>
                          </svg>
                          <div className="text-[10px] mt-1">Devices</div>
                        </div>
                      </div>
                      
                      {/* Applications */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-700/20 rounded-lg flex flex-col items-center justify-center border border-amber-500/50">
                          <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"></path>
                          </svg>
                          <div className="text-[10px] mt-1">Applications</div>
                        </div>
                      </div>
                      
                      {/* Data */}
                      <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex flex-col items-center justify-center border border-red-500/50">
                          <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd"></path>
                          </svg>
                          <div className="text-[10px] mt-1">Data</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Verification Beams */}
                    <div className="absolute inset-0">
                      <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <line x1="50" y1="0" x2="50" y2="38" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse" />
                        <line x1="100" y1="50" x2="62" y2="50" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse delay-100" />
                        <line x1="50" y1="100" x2="50" y2="62" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse delay-200" />
                        <line x1="0" y1="50" x2="38" y2="50" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse delay-300" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Verification Labels */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full flex justify-center gap-2">
                    <div className="px-2 py-1 bg-purple-500/20 rounded text-xs">Identity</div>
                    <div className="px-2 py-1 bg-purple-500/20 rounded text-xs">Context</div>
                    <div className="px-2 py-1 bg-purple-500/20 rounded text-xs">Policy</div>
                    <div className="px-2 py-1 bg-purple-500/20 rounded text-xs">Risk</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 dark:bg-black/10 p-4 rounded-lg backdrop-blur-sm">
                <p className="text-sm italic">
                  "Zero Trust is a security model based on the principle of maintaining strict access controls and not trusting anyone by default, 
                  even those already inside the network perimeter. In this model, verification is required from everyone trying to access resources 
                  in the network."
                </p>
                <p className="text-right text-xs mt-2">— NIST Special Publication 800-207</p>
              </div>
              
              <p className="text-sm opacity-80 text-center mt-4">
                Zero Trust flips traditional security on its head: instead of trusting everything inside your network,
                it trusts nothing and verifies everything. Every access request is treated as if it originates from an untrusted network!
              </p>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-heading">Projects & Interests</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-bold mb-3 text-lg">Architecture & System Design</h3>
              <p className="mb-4">
                I'm passionate about designing scalable, secure, and maintainable systems. I focus on creating architectures 
                that balance technical excellence with practical implementation, always considering security from the ground up.
              </p>
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold mb-2">Zero Trust Architecture</h4>
                    <p className="text-sm opacity-80">A security model that requires strict verification for every person and device trying to access resources, regardless of whether they're inside or outside the network perimeter. "Never trust, always verify" is the core principle.</p>
                  </div>
                  
                  <div className="w-32 h-32 relative">
                    <div className="absolute inset-0">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 border-4 border-purple-500/70 rounded-full flex items-center justify-center relative">
                          <div className="w-16 h-16 border-4 border-pink-500/70 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                          </div>
                          <div className="absolute top-0 w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div className="absolute right-0 w-3 h-3 bg-pink-500 rounded-full"></div>
                          <div className="absolute bottom-0 w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div className="absolute left-0 w-3 h-3 bg-pink-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 text-lg">Deep Diving into Standards</h3>
              <p>
                I enjoy exploring RFCs, IETF documents, and NIST guidelines to understand the fundamental principles behind 
                technologies. This approach helps me build more robust and future-proof solutions rather than just following trends.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 dark:bg-black/10 p-4 rounded-lg">
                  <p className="text-sm font-semibold">Recent Explorations:</p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>RFC 6749 - OAuth 2.0 Framework</li>
                    <li>RFC 8705 - OAuth Mutual TLS</li>
                    <li>NIST SP 800-207 - Zero Trust Architecture</li>
                    <li>RFC 8446 - TLS 1.3</li>
                  </ul>
                </div>
                <div className="bg-white/5 dark:bg-black/10 p-4 rounded-lg">
                  <p className="text-sm font-semibold">Current Interests:</p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>AuthZEN - Next-gen authorization</li>
                    <li>GNAP - Grant Negotiation and Authorization Protocol</li>
                    <li>DPoP - Demonstrating Proof of Possession</li>
                    <li>SPIFFE/SPIRE - Secure identity framework</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 text-lg">Documentation & Knowledge Sharing</h3>
              <p className="mb-4">
                I believe in the power of clear, well-structured documentation. I use tools like Mermaid and ASCII diagrams to 
                visualize complex systems and make them more accessible to team members.
              </p>
              <div className="p-6 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold mb-2">Documentation & Knowledge Sharing</h4>
                    <p className="text-sm opacity-80">Clear documentation with visual diagrams helps teams understand complex systems. Well-structured documentation reduces onboarding time, prevents knowledge silos, and enables better collaboration across teams.</p>
                  </div>
                  
                  <div className="w-32 h-32 relative">
                    <div className="absolute inset-4 bg-white/10 dark:bg-gray-800/40 rounded-lg p-2">
                      <div className="w-full h-4 bg-amber-500/40 rounded mb-2"></div>
                      <div className="w-3/4 h-2 bg-amber-500/30 rounded mb-2"></div>
                      <div className="w-full h-2 bg-amber-500/30 rounded mb-2"></div>
                      <div className="w-5/6 h-2 bg-amber-500/30 rounded mb-2"></div>
                      <div className="flex justify-center mt-2">
                        <div className="w-12 h-8 border border-orange-500/50 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mx-0.5 animate-pulse"></div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full mx-0.5 animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full mx-0.5 animate-pulse delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center mt-16 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 kanywst | Built with Next.js</p>
          {mounted && (
            <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          )}
        </footer>
      </div>
    </>
  );
}
