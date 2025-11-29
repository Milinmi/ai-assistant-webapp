// ============================================
// LIGHTS ANIMATION - Анимация огоньков в корпусе
// Упрощённая версия для витальных признаков
// ============================================

export default class LightsAnimation {
  constructor(lights, params, breathAnimation) {
    this.lights = lights;
    this.params = params;
    this.breathAnimation = breathAnimation;
    
    this.isRunning = false;
    this.animationFrameId = null;
    this.startTime = 0;
    
    console.log('💡 LightsAnimation создан');
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Анимация огоньков уже запущена');
      return;
    }
    
    console.log('💡 Огоньки: СТАРТ');
    this.isRunning = true;
    this.startTime = Date.now();
    
    this.animate();
  }

  stop() {
    if (!this.isRunning) {
      return;
    }
    
    console.log('💡 Огоньки: СТОП');
    this.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.lights.forEach(light => {
      light.element.opacity(0);
    });
  }

  animate() {
    if (!this.isRunning) return;
    
    const elapsed = Date.now() - this.startTime;
    const pattern = this.params.pattern || 'pulse';
    
    if (pattern === 'pulse') {
      this.pulsePattern(elapsed);
    } else if (pattern === 'static') {
      this.staticPattern();
    } else {
      this.pulsePattern(elapsed);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  staticPattern() {
    const intensity = this.params.intensity || 0.75;
    this.lights.forEach(light => {
      light.element.opacity(intensity);
    });
  }

  pulsePattern(elapsed) {
    const speed = this.params.speed || 1500;
    const intensity = this.params.intensity || 0.75;
    const phase = (elapsed % speed) / speed;
    const opacity = intensity * (0.5 + 0.5 * Math.sin(phase * Math.PI * 2));
    
    this.lights.forEach(light => {
      light.element.opacity(opacity);
    });
  }

  pause() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resume() {
    if (this.isRunning && !this.animationFrameId) {
      this.animate();
    }
  }
}