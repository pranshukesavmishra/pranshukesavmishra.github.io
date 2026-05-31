class PortfolioTerminal {
  constructor() {
    this.overlay = document.getElementById('terminalOverlay');
    this.body = document.getElementById('terminalBody');
    this.input = document.getElementById('terminalInput');
    this.closeBtn = document.getElementById('terminalClose');
    this.openBtn = document.getElementById('terminalOpenBtn');
    
    this.data = null; // Populated from main.js after dynamic fetch

    if (!this.overlay) return;
    this.initEvents();
  }

  setData(data) {
    this.data = data;
  }

  initEvents() {
    // Mode toggles
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Keyboard trigger (Backtick `)
    window.addEventListener('keydown', (e) => {
      if (e.key === '`') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Auto-focus input when clicking inside body
    this.body.addEventListener('click', () => {
      if (this.input) this.input.focus();
    });
  }

  toggle() {
    if (this.overlay.style.display === 'flex') {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.overlay.style.display = 'flex';
    if (this.body.children.length <= 1) {
      this.printWelcome();
    } else {
      if (this.input) this.input.focus();
    }
  }

  close() {
    this.overlay.style.display = 'none';
  }

  printWelcome() {
    this.body.innerHTML = `
      <div class="terminal-welcome">
        <p>========================================================================</p>
        <p>   Welcome to the Interactive Shell Terminal of Pranshu Mishra   </p>
        <p>========================================================================</p>
        <p>Type <span class="cli-success">'help'</span> for a index of diagnostic queries.</p>
        <p>Type <span class="cli-warning">'gui'</span> to terminate shell and load responsive web portfolio.</p>
        <p>Shortcut: Press the (\`) backtick key at any time to toggle this panel.</p>
      </div>
      <div id="terminalHistory"></div>
      <div class="terminal-input-row">
        <span class="terminal-prompt">guest@pranshu:~$</span>
        <input type="text" id="terminalInput" class="terminal-input" autofocus autocomplete="off" spellcheck="false">
      </div>
    `;
    this.input = document.getElementById('terminalInput');
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        this.input.value = '';
        this.executeCommand(cmd);
      }
    });
    this.input.focus();
  }

  writeLine(text, className = '') {
    const history = document.getElementById('terminalHistory');
    if (!history) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    history.appendChild(line);
    this.body.scrollTop = this.body.scrollHeight;
  }

  executeCommand(cmdRaw) {
    const cmd = cmdRaw.toLowerCase().trim();
    if (!cmd) return;

    // Output input line
    this.writeLine(`<span class="terminal-prompt">guest@pranshu:~$</span> ${cmdRaw}`);

    if (cmd === 'help') {
      this.writeLine('System Diagnostics Utilities:', 'cli-info');
      this.writeLine('  <span class="cli-success">about</span>      Retrieve biography details');
      this.writeLine('  <span class="cli-success">skills</span>     Analyze language & architecture competence');
      this.writeLine('  <span class="cli-success">projects</span>   Audit key software engineering deliverables');
      this.writeLine('  <span class="cli-success">contact</span>    Resolve communication vectors & socials');
      this.writeLine('  <span class="cli-success">gui</span>        Terminate CLI instance');
      this.writeLine('  <span class="cli-success">clear</span>      Purge active buffer history');
    } else if (cmd === 'about') {
      if (!this.data) {
        this.writeLine('Error: Configuration file not loaded.', 'cli-warning');
        return;
      }
      this.writeLine(`Name:      ${this.data.personal.name}`);
      this.writeLine(`Title:     ${this.data.personal.title}`);
      this.writeLine(`Region:    ${this.data.personal.location}`);
      this.writeLine(`Tagline:   ${this.data.personal.tagline}`);
      this.writeLine(`Synopsis:  ${this.data.personal.bio}`);
    } else if (cmd === 'skills') {
      if (!this.data) return;
      this.writeLine('Competency Index Summary:', 'cli-info');
      this.data.skills.forEach(cat => {
        this.writeLine(`\n-- ${cat.category} --`, 'cli-warning');
        cat.items.forEach(skill => {
          const blocks = Math.round(skill.level / 10);
          const bar = '■'.repeat(blocks) + ' '.repeat(10 - blocks);
          this.writeLine(`   ${skill.name.padEnd(15)} [${bar}] ${skill.level}%`);
        });
      });
    } else if (cmd === 'projects') {
      if (!this.data) return;
      this.writeLine('Engineering Portfolios:', 'cli-info');
      this.data.projects.forEach((p, index) => {
        this.writeLine(`\n[${index + 1}] ${p.title}`, 'cli-warning');
        this.writeLine(`    Summary:   ${p.description}`);
        this.writeLine(`    Stack:     ${p.tags.join(', ')}`);
        this.writeLine(`    Reference: ${p.githubUrl}`);
      });
    } else if (cmd === 'contact') {
      if (!this.data) return;
      this.writeLine('Contact Routing Directory:', 'cli-info');
      this.writeLine(`  Direct Email:   ${this.data.personal.email}`);
      this.writeLine(`  Mobile Phone:   ${this.data.personal.phone || 'N/A'}`);
      this.writeLine(`  LinkedIn URI:   ${this.data.personal.linkedin}`);
      this.writeLine(`  GitHub Handle:  ${this.data.personal.github}`);
    } else if (cmd === 'gui') {
      this.close();
    } else if (cmd === 'clear') {
      const history = document.getElementById('terminalHistory');
      if (history) history.innerHTML = '';
    } else {
      this.writeLine(`zsh: command not recognized: ${cmdRaw}. Use <span class="cli-success">'help'</span> to query system options.`, 'cli-warning');
    }
  }
}
window.PortfolioTerminal = PortfolioTerminal;
