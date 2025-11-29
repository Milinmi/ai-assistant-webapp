// ============================================
// BREATH ANIMATION - Анимация дыхания
// Покачивание головы (изображения аватара)
// ============================================

export default class BreathAnimation {
  constructor(imageElement, params) {
    this.image = imageElement;  // SVG image элемент
    this.params = params;       // Параметры из MBTI
    
    this.isRunning = false;
    this.animationFrame = null;
    this.startTime = 0;
    
    console.log('🌊 BreathAnimation создан:', {
      angle: params.angle,
      speed: params.speed,
      axis: params.axis,
      pattern: params.pattern
    });
  }

  /**
   * Запуск анимации дыхания
   */
  start() {
    if (this.isRunning) {
      console.warn('⚠️ Дыхание уже запущено');
      return;
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    console.log('▶️ Дыхание запущено');
    
    this.animate();
  }

  /**
   * Остановка анимации
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Возвращаем в исходное положение
    this.image.transform({ scale: 1.0 });
    
    console.log('⏸️ Дыхание остановлено');
  }

  /**
   * Главный цикл анимации
   */
  animate() {
    if (!this.isRunning) return;
    
    const elapsed = Date.now() - this.startTime;
    const { angle, speed, pattern } = this.params;
    
    // Преобразуем angle в процент масштаба
    // angle: 5 → 0.015 (1.5% изменение размера)
    const scaleAmount = angle * 0.003;
    
    // Вычисляем текущий масштаб
    let scale = 1.0;
    
    if (pattern === 'sine') {
      // Плавное синусоидальное движение
      const progress = (elapsed % speed) / speed;
      const sineValue = Math.sin(progress * Math.PI * 2);
      
      // Преобразуем -1...+1 в диапазон 1.0 ... 1.0+scaleAmount
      scale = 1.0 + (sineValue + 1) / 2 * scaleAmount;
    } else if (pattern === 'random') {
      // Хаотичное движение (для спонтанных типов)
      const progress = (elapsed % speed) / speed;
      const randomFactor = Math.sin(progress * Math.PI * 2 + elapsed * 0.001);
      
      scale = 1.0 + (randomFactor + 1) / 2 * scaleAmount;
    }
    
    // Применяем масштабирование (имитация "вперёд-назад")
    this.image.transform({ scale: scale });
    
    // Следующий кадр
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Изменить параметры на лету
   */
  updateParams(newParams) {
    this.params = { ...this.params, ...newParams };
    console.log('🔄 Параметры дыхания обновлены:', this.params);
  }

  /**
   * Получить текущую фазу дыхания (0-1)
   */
  getCurrentPhase() {
    if (!this.isRunning) return 0;
    
    const elapsed = Date.now() - this.startTime;
    return (elapsed % this.params.speed) / this.params.speed;
  }
}