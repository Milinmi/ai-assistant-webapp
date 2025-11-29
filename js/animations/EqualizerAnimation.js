// ============================================
// EQUALIZER ANIMATION - Анимация эквалайзера
// Для состояния "thinking" (аватар думает)
// ============================================

export default class EqualizerAnimation {
  constructor(displayElements, params) {
    this.background = displayElements.background;
    this.bars = displayElements.bars;
    this.params = params;
    
    this.isRunning = false;
    this.animationFrameId = null;
    this.barHeights = new Array(this.bars.length).fill(0);
    this.targetHeights = new Array(this.bars.length).fill(0);
    
    console.log('📊 EqualizerAnimation создан');
  }

  /**
   * Запуск анимации
   */
  start() {
    if (this.isRunning) return;
    
    console.log('📊 Эквалайзер: СТАРТ');
    this.isRunning = true;
    
    // Показываем фон и бары
    this.background.opacity(0.8);
    this.bars.forEach(bar => bar.opacity(0.8));
    
    // Генерируем случайные целевые высоты
    this.generateTargetHeights();
    
    // Запускаем анимацию
    this.animate();
  }

  /**
   * Остановка анимации
   */
  stop() {
    if (!this.isRunning) return;
    
    console.log('📊 Эквалайзер: СТОП');
    this.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Скрываем фон и бары
    this.background.opacity(0);
    this.bars.forEach(bar => bar.opacity(0));
  }

  /**
   * Генерация случайных целевых высот
   */
  generateTargetHeights() {
    const calibration = this.getCalibratedParams();
    
    this.targetHeights = this.bars.map(() => {
      return calibration.minHeight + 
             Math.random() * (calibration.maxHeight - calibration.minHeight);
    });
  }

  /**
   * Получение калиброванных параметров из calibration.json
   */
  getCalibratedParams() {
    // Ищем display в calibration через DOM
    const container = this.background.node.ownerSVGElement;
    if (!container) {
      return { minHeight: 4, maxHeight: 14 };
    }
    
    // Используем данные из calibration.json через data-атрибуты
    // Или захардкодим из нашего файла
    return {
      minHeight: 4,  // barMinHeight из calibration
      maxHeight: 14  // barMaxHeight из calibration
    };
  }

  /**
   * Основной цикл анимации
   */
  animate() {
    if (!this.isRunning) return;
    
    let needsUpdate = false;
    
    // Плавное приближение к целевым высотам
    this.bars.forEach((bar, i) => {
      const diff = this.targetHeights[i] - this.barHeights[i];
      
      if (Math.abs(diff) > 0.5) {
        this.barHeights[i] += diff * 0.15; // Скорость интерполяции
        bar.height(this.barHeights[i]);
        needsUpdate = true;
      } else {
        this.barHeights[i] = this.targetHeights[i];
        bar.height(this.barHeights[i]);
      }
    });
    
    // Если достигли целей - генерируем новые
    if (!needsUpdate) {
      this.generateTargetHeights();
    }
    
    // Следующий кадр
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Пауза анимации (не скрывая элементы)
   */
  pause() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Возобновление анимации
   */
  resume() {
    if (this.isRunning && !this.animationFrameId) {
      this.animate();
    }
  }
}