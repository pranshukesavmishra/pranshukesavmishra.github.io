class PortfolioAdmin {
  constructor(mainInstance) {
    this.main = mainInstance;
    this.overlay = document.getElementById('adminOverlay');
    this.openBtn = document.getElementById('adminOpenBtn');
    this.closeBtn = document.getElementById('adminClose');
    this.saveBtn = document.getElementById('adminSave');
    
    // Tab selectors
    this.tabs = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.admin-tab');

    if (!this.overlay) return;
    this.initEvents();
  }

  initEvents() {
    this.openBtn.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.saveBtn.addEventListener('click', () => this.saveData());

    // Switch admin tabs
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.tabs.forEach(t => t.classList.remove('active'));
        this.tabContents.forEach(tc => tc.classList.remove('active'));

        tab.classList.add('active');
        const targetTab = document.getElementById(tab.dataset.tab);
        if (targetTab) targetTab.classList.add('active');
      });
    });

    // Dynamic row addition triggers
    document.getElementById('addProjBtn').addEventListener('click', () => this.addProjectRow());
  }

  open() {
    this.overlay.style.display = 'flex';
    this.populateForm();
  }

  close() {
    this.overlay.style.display = 'none';
  }

  populateForm() {
    const data = this.main.portfolioData;
    if (!data) return;

    // Map General fields
    document.getElementById('admName').value = data.personal.name || '';
    document.getElementById('admTitle').value = data.personal.title || '';
    document.getElementById('admLocation').value = data.personal.location || '';
    document.getElementById('admTagline').value = data.personal.tagline || '';
    document.getElementById('admBio').value = data.personal.bio || '';
    document.getElementById('admEmail').value = data.personal.email || '';
    document.getElementById('admGithub').value = data.personal.github || '';
    document.getElementById('admLinkedin').value = data.personal.linkedin || '';
    document.getElementById('admPhone').value = data.personal.phone || '';
    document.getElementById('admResume').value = data.personal.resumeUrl || '';

    // Map Projects List
    const projContainer = document.getElementById('admProjectsList');
    projContainer.innerHTML = '';
    data.projects.forEach((proj, idx) => {
      this.createProjectRow(proj, idx);
    });
  }

  createProjectRow(proj, idx) {
    const projContainer = document.getElementById('admProjectsList');
    const div = document.createElement('div');
    div.className = 'admin-project-item glass-panel';
    div.style.padding = '15px';
    div.style.marginBottom = '15px';
    div.style.borderRadius = '10px';
    div.innerHTML = `
      <div class="admin-row" style="margin-bottom: 10px;">
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" class="proj-title" value="${proj.title}">
        </div>
        <div class="form-group">
          <label>Stack (split with commas)</label>
          <input type="text" class="proj-tags" value="${proj.tags.join(', ')}">
        </div>
      </div>
      <div class="form-group" style="margin-bottom: 10px;">
        <label>Description</label>
        <textarea class="proj-desc" rows="2" style="resize:vertical;">${proj.description}</textarea>
      </div>
      <div class="admin-row" style="margin-bottom: 10px;">
        <div class="form-group">
          <label>Github URL</label>
          <input type="text" class="proj-github" value="${proj.githubUrl}">
        </div>
        <div class="form-group">
          <label>Live Demo URL</label>
          <input type="text" class="proj-live" value="${proj.liveUrl}">
        </div>
      </div>
      <button class="btn-secondary btn-delete-proj" style="padding: 6px 12px; font-size: 0.8rem; margin-top: 5px; border-color: rgba(255, 64, 129, 0.3);" type="button">Remove Project</button>
    `;
    
    div.querySelector('.btn-delete-proj').addEventListener('click', () => {
      div.remove();
    });

    projContainer.appendChild(div);
  }

  addProjectRow() {
    this.createProjectRow({
      title: 'New Software Work',
      description: 'Brief description of system components and features...',
      tags: ['Next.js', 'FastAPI', 'PostgreSQL'],
      githubUrl: 'https://github.com',
      liveUrl: 'https://github.com'
    }, Date.now());
  }

  saveData() {
    const data = this.main.portfolioData;
    if (!data) return;

    // Parse General
    data.personal.name = document.getElementById('admName').value;
    data.personal.title = document.getElementById('admTitle').value;
    data.personal.location = document.getElementById('admLocation').value;
    data.personal.tagline = document.getElementById('admTagline').value;
    data.personal.bio = document.getElementById('admBio').value;
    data.personal.email = document.getElementById('admEmail').value;
    data.personal.github = document.getElementById('admGithub').value;
    data.personal.linkedin = document.getElementById('admLinkedin').value;
    data.personal.phone = document.getElementById('admPhone').value;
    data.personal.resumeUrl = document.getElementById('admResume').value;

    // Parse Projects
    const projItems = document.querySelectorAll('.admin-project-item');
    data.projects = [];
    projItems.forEach(item => {
      const tagsStr = item.querySelector('.proj-tags').value;
      const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      data.projects.push({
        title: item.querySelector('.proj-title').value,
        description: item.querySelector('.proj-desc').value,
        tags: tags,
        githubUrl: item.querySelector('.proj-github').value,
        liveUrl: item.querySelector('.proj-live').value,
        image: 'placeholder_project.png'
      });
    });

    // Re-render
    this.main.updatePortfolioUI(data);

    // Dynamic Download Generator
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "portfolio.json");
    dlAnchorElem.click();

    this.close();
    
    // Toast Alert Notification
    const formStatus = document.getElementById('formStatus');
    if (formStatus) {
      formStatus.innerText = 'JSON compiled successfully. Please replace "data/portfolio.json" with the downloaded file to persist updates.';
      formStatus.className = 'form-status success';
      formStatus.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { formStatus.style.display = 'none'; }, 8000);
    }
  }
}
window.PortfolioAdmin = PortfolioAdmin;
