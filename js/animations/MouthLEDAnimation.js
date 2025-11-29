// ============================================
// MOUTH LED ANIMATION - Анимация LED на рту
// УПРОЩЁННАЯ ВЕРСИЯ: Пульсирующие огоньки БЕЗ fade
// Логика из test-mouth-variants.html - работает идеально!
// ============================================

export default class MouthLEDAnimation {
  constructor(mouthLEDs, params = {}) {
    this.leds = mouthLEDs;
    this.params = {
      speed: params.speed || 500,
      minFrequency: params.minFrequency || 200,   // Минимальная частота пульсации
      maxFrequency: params.maxFrequency || 600    // Максимальная частота пульсации
    };
    
    this.isRunning = false;
    this.animationFrame = null;
    this.startTime = 0;
    this.ledParams = [];  // Параметры для каждого LED
    
    // Генерируем случайные параметры для каждого LED
    this.leds.forEach(() => {
      this.ledParams.push({
        frequency: this.params.minFrequency + 
                   Math.random() * (this.params.maxFrequency - this.params.minFrequency),
        phase: Math.random() * Math.PI * 2
      });
    });
    
    // ВАЖНО: Устанавливаем начальное состояние - невидимо!
    this.leds.forEach(led => {
      led.opacity(0);
    });
    
    console.log('💬 MouthLEDAnimation: пульсирующие огоньки (простая версия)');
  }

  /**
   * Запуск анимации пульсации (сразу, без fade-in)
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ LED анимация уже запущена');
      return;
    }
    
    console.log('💬 LED рта: СТАРТ → ПУЛЬСАЦИЯ');
    this.isRunning = true;
    this.startTime = Date.now();
    
    // КРИТИЧНО: Останавливаем любые предыдущие SVG анимации!
    this.leds.forEach(led => {
      led.timeline().stop();  // Останавливаем timeline элемента
    });
    
    this.animate();
  }

  /**
   * Остановка анимации (сразу, без fade-out)
   */
  stop() {
    if (!this.isRunning) {
      return;
    }
    
    console.log('💬 LED рта: СТОП → НЕВИДИМО');
    this.isRunning = false;
    
    // Останавливаем requestAnimationFrame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // КРИТИЧНО: Останавливаем ВСЕ анимации (включая SVG!)
    this.leds.forEach(led => {
      led.timeline().stop();  // Останавливаем timeline элемента
      led.opacity(0);         // Делаем невидимым
    });
  }

  /**
   * Основной цикл анимации - простая пульсация
   */
  animate() {
    if (!this.isRunning) {
      return;
    }
    
    const elapsed = Date.now() - this.startTime;
    
    // Обновляем каждый LED независимо
    this.leds.forEach((led, i) => {
      const params = this.ledParams[i];
      const phase = (elapsed / params.frequency) * Math.PI * 2 + params.phase;
      
      // Пульсация от 0.4 до 1.0 - как в тесте!
      const opacity = 0.4 + 0.6 * (Math.sin(phase) * 0.5 + 0.5);
      
      led.opacity(opacity);
    });
    
    // Продолжаем анимацию
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Пульсация для режима listening (все LED синхронно)
   */
  startPulse() {
    if (this.isRunning) {
      console.log('⚠️ Пульсация уже запущена');
      return;
    }
    
    console.log('💬 LED рта: СИНХРОННАЯ ПУЛЬСАЦИЯ (listening)');
    this.isRunning = true;
    
    // Все LED пульсируют синхронно через SVG анимацию
    this.leds.forEach((led) => {
      led.attr({
        'fill': '#ff4500',
        'stroke': '#ff6600',
        'stroke-width': 1.5,
        'stroke-opacity': 0.8
      });
      
      led.opacity(0.8)
        .animate(700, 0, 'now')
        .opacity(0.3)
        .loop(true, true);
    });
  }

  /**
   * Остановка пульсации (для listening режима)
   */
  stopPulse() {
    console.log('💬 LED рта: СТОП пульсации (listening)');
    
    this.leds.forEach(led => {
      led.timeline().stop();  // Останавливаем timeline элемента
      led.opacity(0);         // Гасим полностью!
    });
    
    this.isRunning = false;
  }

  /**
   * Пауза анимации
   */
  pause() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Возобновление анимации
   */
  resume() {
    if (this.isRunning && !this.animationFrame) {
      this.animate();
    }
  }

  /**
   * Изменение параметров частоты
   */
  setFrequencyRange(minFreq, maxFreq) {
    this.params.minFrequency = minFreq;
    this.params.maxFrequency = maxFreq;
    
    // Перегенерируем параметры LED
    this.ledParams = [];
    this.leds.forEach(() => {
      this.ledParams.push({
        frequency: minFreq + Math.random() * (maxFreq - minFreq),
        phase: Math.random() * Math.PI * 2
      });
    });
    
    console.log(`🔧 Частота пульсации: ${minFreq}-${maxFreq}мс`);
  }
}