class PortfolioApp {
  constructor() {
    this.portfolioData = null;
    this.terminalInstance = null;
    this.adminInstance = null;
    this.activeFilter = 'all';

    this.init();
  }

  async init() {
    try {
      const response = await fetch('./data/portfolio.json');
      this.portfolioData = await response.json();
      
      // Load UI and events
      this.updatePortfolioUI(this.portfolioData);
      this.initTypingEffect();
      this.initContactForm();
      this.initIntersectionObservers();
      this.initNavScrollHighlight();

      // Load sub-modules
      if (window.PortfolioTerminal) {
        this.terminalInstance = new window.PortfolioTerminal();
        this.terminalInstance.setData(this.portfolioData);
      }
      if (window.PortfolioAdmin) {
        this.adminInstance = new window.PortfolioAdmin(this);
      }

    } catch (err) {
      console.error('Failed to load portfolio.json configuration:', err);
    }
  }

  updatePortfolioUI(data) {
    this.portfolioData = data; // Keep in memory

    // Load Personal Header Details
    document.querySelectorAll('.user-name').forEach(el => el.textContent = data.personal.name);
    document.querySelectorAll('.user-title').forEach(el => el.textContent = data.personal.title);
    document.getElementById('heroTagline').textContent = data.personal.tagline;
    document.getElementById('aboutBio').textContent = data.personal.bio;

    // Set Social link values
    document.querySelectorAll('.social-github').forEach(el => el.href = data.personal.github);
    document.querySelectorAll('.social-linkedin').forEach(el => el.href = data.personal.linkedin);
    document.querySelectorAll('.social-email').forEach(el => el.href = `mailto:${data.personal.email}`);
    document.querySelectorAll('.social-phone').forEach(el => el.href = `tel:${data.personal.phone}`);
    document.getElementById('contactValEmail').textContent = data.personal.email;
    document.getElementById('contactValLocation').textContent = data.personal.location;
    const phoneValEl = document.getElementById('contactValPhone');
    if (phoneValEl) phoneValEl.textContent = data.personal.phone;

    // Render stats
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
      statsContainer.innerHTML = '';
      data.stats.forEach(stat => {
        statsContainer.innerHTML += `
          <div class="stat-card glass-panel">
            <div class="stat-num">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
          </div>
        `;
      });
    }

    // Render Skills Matrix
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid) {
      skillsGrid.innerHTML = '';
      data.skills.forEach(cat => {
        let listItemsHtml = '';
        cat.items.forEach(skill => {
          listItemsHtml += `
            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-pct">${skill.level}%</span>
              </div>
              <div class="skill-bar-bg">
                <div class="skill-bar-fill" data-level="${skill.level}"></div>
              </div>
            </div>
          `;
        });

        skillsGrid.innerHTML += `
          <div class="skills-category glass-panel">
            <h3>${cat.category}</h3>
            <div class="skills-list">
              ${listItemsHtml}
            </div>
          </div>
        `;
      });
    }

    // Render Timeline
    const timeline = document.getElementById('experienceTimeline');
    if (timeline) {
      timeline.innerHTML = '';
      data.experience.forEach(exp => {
        timeline.innerHTML += `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content glass-panel">
              <div class="timeline-header">
                <div class="timeline-title">
                  <h3>${exp.role}</h3>
                  <div class="company">${exp.company}</div>
                </div>
                <div class="timeline-date">${exp.period}</div>
              </div>
              <p class="timeline-desc">${exp.description}</p>
            </div>
          </div>
        `;
      });
    }

    // Render Projects
    this.renderProjects();
    this.renderProjectFilters();
    
    // Sync with terminal
    if (this.terminalInstance) {
      this.terminalInstance.setData(data);
    }
  }

  renderProjectFilters() {
    const filterContainer = document.getElementById('projectsFilter');
    if (!filterContainer) return;

    const allTags = new Set();
    this.portfolioData.projects.forEach(p => {
      p.tags.forEach(t => allTags.add(t));
    });

    filterContainer.innerHTML = `
      <button class="filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">All Projects</button>
    `;
    
    // Limit to 5 categories to avoid row wraps on mobile
    Array.from(allTags).slice(0, 5).forEach(tag => {
      filterContainer.innerHTML += `
        <button class="filter-btn ${this.activeFilter === tag ? 'active' : ''}" data-filter="${tag}">${tag}</button>
      `;
    });

    // Wire clicks
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderProjects();
      });
    });
  }

  renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = this.activeFilter === 'all' 
      ? this.portfolioData.projects 
      : this.portfolioData.projects.filter(p => p.tags.includes(this.activeFilter));

    filtered.forEach(p => {
      const tagsHtml = p.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
      grid.innerHTML += `
        <div class="project-card glass-panel">
          <div class="project-img-container">
            <span class="project-placeholder"><i class="fas fa-terminal"></i></span>
          </div>
          <div class="project-content">
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-tags">
              ${tagsHtml}
            </div>
            <div class="project-links">
              <a href="${p.githubUrl}" class="project-link" target="_blank" title="View Source"><i class="fab fa-github"></i></a>
              <a href="${p.liveUrl}" class="project-link" target="_blank" title="Live Demo"><i class="fas fa-external-link-alt"></i></a>
            </div>
          </div>
        </div>
      `;
    });
  }

  initTypingEffect() {
    const titleElement = document.getElementById('typedTitle');
    if (!titleElement) return;
    
    const words = [
      "Crafting high-performance systems",
      "Designing beautiful interactive UIs",
      "Developing scalable backend APIs"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 60;

    const type = () => {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        titleElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        titleElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typingSpeed = 2200; // Stay visible
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 400; // Pause before restarting
      } else {
        typingSpeed = isDeleting ? 25 : 60;
      }

      setTimeout(type, typingSpeed);
    };

    setTimeout(type, 1000);
  }

  initContactForm() {
    const btnTabMsg = document.getElementById('btnTabMsg');
    const btnTabMeet = document.getElementById('btnTabMeet');
    const formMsg = document.getElementById('contactForm');
    const formMeet = document.getElementById('meetForm');
    const statusMsg = document.getElementById('formStatus');
    const statusMeet = document.getElementById('meetStatus');

    if (btnTabMsg && btnTabMeet) {
      btnTabMsg.addEventListener('click', () => {
        btnTabMsg.classList.add('active');
        btnTabMeet.classList.remove('active');
        formMsg.style.display = 'flex';
        formMeet.style.display = 'none';
      });

      btnTabMeet.addEventListener('click', () => {
        btnTabMeet.classList.add('active');
        btnTabMsg.classList.remove('active');
        formMeet.style.display = 'flex';
        formMsg.style.display = 'none';
      });
    }

    // Direct Message Form handler
    if (formMsg) {
      formMsg.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('formName').value.trim();
        const email = document.getElementById('formEmail').value.trim();
        const msg = document.getElementById('formMessage').value.trim();

        if (!name || !email || !msg) {
          statusMsg.textContent = 'Please fill out all fields.';
          statusMsg.className = 'form-status error';
          statusMsg.style.display = 'block';
          return;
        }

        const waText = `Hi Pranshu,\n\nI want to connect with you.\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${msg}`;
        const waUrl = `https://api.whatsapp.com/send?phone=919467871448&text=${encodeURIComponent(waText)}`;
        
        window.open(waUrl, '_blank');

        statusMsg.textContent = `Opening WhatsApp... Transmission prepared for delivery!`;
        statusMsg.className = 'form-status success';
        statusMsg.style.display = 'block';
        formMsg.reset();

        setTimeout(() => { statusMsg.style.display = 'none'; }, 8000);
      });
    }

    // Schedule Meeting Form handler
    if (formMeet) {
      formMeet.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('meetName').value.trim();
        const email = document.getElementById('meetEmail').value.trim();
        const datetime = document.getElementById('meetDateTime').value;
        const topic = document.getElementById('meetMessage').value.trim();

        if (!name || !email || !datetime || !topic) {
          statusMeet.textContent = 'Please complete all details.';
          statusMeet.className = 'form-status error';
          statusMeet.style.display = 'block';
          return;
        }

        const dateObj = new Date(datetime);
        const startFormatted = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDateObj = new Date(dateObj.getTime() + 30 * 60 * 1000); // 30 mins
        const endFormatted = endDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        // 1. Download ICS Calendar invite
        this.downloadICS(name, email, dateObj, topic, startFormatted, endFormatted);

        // 2. Build Google Calendar link for manual addition
        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting+with+Pranshu+Mishra&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent('Topic: ' + topic + '\nClient email: ' + email)}&location=Online`;

        // 3. Send WhatsApp text notification
        const waText = `Hi Pranshu,\n\nI would like to schedule a meeting with you:\n\n*Name:* ${name}\n*Email:* ${email}\n*Time:* ${dateObj.toLocaleString()}\n*Topic:* ${topic}`;
        const waUrl = `https://api.whatsapp.com/send?phone=919467871448&text=${encodeURIComponent(waText)}`;
        
        window.open(waUrl, '_blank');

        // Render response showing download alert & calendar linking
        statusMeet.innerHTML = `
          Meeting invitation (.ics) downloaded!<br>
          Opening WhatsApp notification...<br>
          <a href="${gcalUrl}" target="_blank" style="color: var(--accent-cyan); text-decoration: underline; font-weight: 600; display: inline-block; margin-top: 5px;">
            Add to your Google Calendar <i class="fas fa-calendar-plus"></i>
          </a>
        `;
        statusMeet.className = 'form-status success';
        statusMeet.style.display = 'block';
        formMeet.reset();
      });
    }
  }

  downloadICS(name, email, dateObj, topic, startFormatted, endFormatted) {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Pranshu Mishra Portfolio//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@pranshumishra.com`,
      `DTSTAMP:${startFormatted}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:Meeting with Pranshu Mishra`,
      `DESCRIPTION:Meeting scheduled by ${name} (${email})\\n\\nTopic: ${topic}\\n\\nPranshu will confirm and join via Google Meet.`,
      "LOCATION:Google Meet / Online",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Meet_Pranshu_Mishra.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  initIntersectionObservers() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = entry.target.querySelectorAll('.skill-bar-fill');
          bars.forEach(bar => {
            bar.style.width = bar.dataset.level + '%';
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    // Delay slightly to wait for DOM creation
    setTimeout(() => {
      document.querySelectorAll('.skills-category').forEach(cat => {
        observer.observe(cat);
      });
    }, 300);
  }

  initNavScrollHighlight() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      sections.forEach(sec => {
        const top = window.scrollY;
        const offset = sec.offsetTop - 150;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
          currentSectionId = id;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new PortfolioApp();
});
