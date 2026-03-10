import React from 'react';
import { Command, CommandResult } from '../types/terminal';

const ASCII_ART = {
  logo: String.raw`
    :::    :::     :::     ::::    ::: :::   ::: :::  ::  :::  ::::::::  ::::::::::: 
    :+:   :+:    :+: :+:   :+:+:   :+: :+:   :+: :+:  :+:  :+: :+:    :+:     :+:     
    +:+  +:+    +:+   +:+  +:+ +:+  +:+  +:+ +:+  +:+  +:+  +:+ +:+            +:+     
    +#++:++    +#++:++#++ +#+  +:+ +#+   +#++:   +#+  +:+  +#+ +#++:++#++     +#+     
    +#+  +#+   +#+     +#+ +#+   +#+#+#    +#+    +#+ +#+#+ +#+        +#+     +#+     
    #+#   #+#  #+#     #+# #+#    #+#+#    #+#     #+#+# #+#+#  #+#    #+#     #+#     
    ###    ### ###     ### ###     ####    ###      ###   ###    ########      ###     
  `,
  cow: String.raw`
  ________________________________________
 < Mooo! Welcome to KANYWST.OS >
  ----------------------------------------
         \   ^__^
          \  (oo)\_______
             (__)\       )\/\
                 ||----w |
                 ||     ||
  `,
  train: String.raw`
      ______      ____________________
    _//   __\____/                  |_
   [  ______  |                    |  |
    | [__  __] |     KANYWST.OS     |  |
    | [__  __] |                    |  |
    | [__  __] |____________________|  |
    |          |                    |  |
    '--O--O--'                      '--'
  `,
  neofetch: String.raw`
      ___           ___     
     /\  \         /\  \    
    /::\  \       /::\  \   
   /:/\:\  \     /:/\:\  \  
  /::\~\:\  \   /::\~\:\  \ 
 /:/\:\ \:\__\ /:/\:\ \:\__\
 \/__\:\/:/  / \/__\:\/:/  /
      \::/  /       \::/  / 
      /:/  /        /:/  /  
      \/__/         \/__/   `
};

export const COMMANDS: Record<string, Command> = {
  help: {
    name: 'help',
    description: 'Show all available commands',
    action: () => ({
      type: 'info',
      content: (
        <div className="help-simple">
          <div className="help-row"><span>whoami</span>   Display identification logo</div>
          <div className="help-row"><span>social</span>   Connect with me on GitHub</div>
          <div className="help-row"><span>neofetch</span> Show system specifications</div>
          <div className="help-row"><span>sl</span>       Run the steam locomotive</div>
          <div className="help-row"><span>cowsay</span>   Get a message from the cow</div>
          <div className="help-row"><span>clear</span>    Clear the current screen</div>
          <div className="help-row"><span>help</span>     Show this help manual</div>
          
          <div className="help-hint">
            Tip: Use <kbd>TAB</kbd> for completion and <kbd>↑</kbd> <kbd>↓</kbd> for history.
          </div>
        </div>
      ),
    }),
  },
  whoami: {
    name: 'whoami',
    description: 'Display identification logo',
    action: () => ({
      type: 'success',
      content: <pre className="ascii-logo-large">{ASCII_ART.logo}</pre>,
    }),
  },
  neofetch: {
    name: 'neofetch',
    description: 'Show system information',
    action: () => ({
      type: 'info',
      content: (
        <div className="neofetch-container">
          <pre className="neofetch-ascii">{ASCII_ART.neofetch}</pre>
          <div className="neofetch-stats">
            <p><span className="stat-label">OS:</span> KANYWST.OS v0.0.1</p>
            <p><span className="stat-label">Kernel:</span> 6.12.0-kanywst</p>
            <p><span className="stat-label">Shell:</span> kanywst-shell (ksh)</p>
            <p><span className="stat-label">Memory:</span> 32.4GiB / 64GiB</p>
          </div>
        </div>
      ),
    }),
  },
  social: {
    name: 'social',
    description: 'Connect with me on GitHub',
    action: () => ({
      type: 'success',
      content: (
        <div className="social-links">
          <a href="https://github.com/kanywst" target="_blank" className="social-item">GitHub</a>
        </div>
      ),
    }),
  },
  sl: { 
    name: 'sl', 
    description: 'Run the steam locomotive', 
    action: () => ({ 
      type: 'system', 
      content: <div className="sl-animation-container"><pre className="train-ascii">{ASCII_ART.train}</pre></div> 
    }) 
  },
  cowsay: { 
    name: 'cowsay', 
    description: 'Talking cow', 
    action: () => ({ 
      type: 'info', 
      content: <pre className="ascii-cow">{ASCII_ART.cow}</pre> 
    }) 
  },
  clear: { name: 'clear', description: 'Clear screen', action: () => ({ type: 'system', content: null }) },
};
