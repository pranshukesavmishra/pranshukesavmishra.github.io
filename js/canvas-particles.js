class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  init() {
    this.resize();
    this.createParticles();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    // Adjust density based on screen size
    const numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 10000);
    const colors = [
      'rgba(100, 255, 218, 0.4)', // Teal/Cyan
      'rgba(188, 122, 255, 0.4)', // Purple
      'rgba(0, 191, 255, 0.4)'    // Deep Sky Blue
    ];
    
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * (this.canvas.width - size * 2) + size;
      const y = Math.random() * (this.canvas.height - size * 2) + size;
      const directionX = (Math.random() * 0.8) - 0.4;
      const directionY = (Math.random() * 0.8) - 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({ x, y, directionX, directionY, size, color });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw & Move particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.directionX;
      p.y += p.directionY;
      
      // Bounce off boundary walls
      if (p.x > this.canvas.width || p.x < 0) p.directionX = -p.directionX;
      if (p.y > this.canvas.height || p.y < 0) p.directionY = -p.directionY;
      
      // Mouse interactions: push particles away gently
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          p.x -= (dx / distance) * force * 1.5;
          p.y -= (dy / distance) * force * 1.5;
        }
      }

      // Draw particle circle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    }
    
    // Connect particles
    this.connect();
  }

  connect() {
    let opacityValue = 1;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const maxDistance = 110;
        if (distance < maxDistance) {
          opacityValue = 1 - (distance / maxDistance);
          this.ctx.strokeStyle = `rgba(100, 255, 218, ${opacityValue * 0.12})`;
          this.ctx.lineWidth = 0.7;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
          this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
          this.ctx.stroke();
        }
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem('bgCanvas');
});
