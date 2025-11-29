// ============================================
// BLINK ANIMATION - Анимация моргания
// ============================================

export default class BlinkAnimation {
  constructor(eyeElements, params) {
    this.eyes = eyeElements;  // { left: SVG элемент, right: SVG элемент }
    this.params = params;     // Параметры из MBTI
    
    this.isRunning = false;
    this.timeoutId = null;
    
    console.log('👁️ BlinkAnimation создан:', {
      frequency: params.frequency,
      duration: params.duration,
      randomness: params.randomness,
      doubleBlinkChance: params.doubleBlinkChance,
      method: params.method
    });
  }

  /**
   * Запуск анимации моргания
   */
  start() {
    if (this.isRunning) {
      console.warn('⚠️ Моргание уже запущено');
      return;
    }
    
    this.isRunning = true;
    console.log('▶️ Моргание запущено');
    this.scheduleNextBlink();
  }

  /**
   * Остановка анимации
   */
  stop() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    console.log('⏸️ Моргание остановлено');
  }

  /**
   * Планирование следующего моргания
   */
  scheduleNextBlink() {
    if (!this.isRunning) return;
    
    // Вычисляем задержку с учётом randomness
    const baseFrequency = this.params.frequency;
    const randomness = this.params.randomness;
    
    // Добавляем случайное отклонение
    const variation = baseFrequency * randomness;
    const randomOffset = (Math.random() * 2 - 1) * variation;
    const delay = baseFrequency + randomOffset;
    
    // Планируем моргание
    this.timeoutId = setTimeout(() => {
      this.blink();
    }, delay);
  }

  /**
   * Выполнить моргание
   */
  async blink() {
    if (!this.isRunning) return;
    
    // Обычное моргание
    await this.performBlink();
    
    // Проверка на двойное моргание
    if (Math.random() < this.params.doubleBlinkChance) {
      // Короткая пауза между морганиями
      await this.sleep(100);
      await this.performBlink();
    }
    
    // Планируем следующее моргание
    this.scheduleNextBlink();
  }

  /**
   * Выполнить одно моргание
   */
  async performBlink() {
    const duration = this.params.duration;
    const method = this.params.method;
    
    switch (method) {
      case 'opacity':
        await this.blinkOpacity(duration);
        break;
      case 'scale':
        await this.blinkScale(duration);
        break;
      case 'offset':
        await this.blinkOffset(duration);
        break;
      default:
        await this.blinkOpacity(duration);
    }
  }

  /**
   * Моргание методом opacity (прозрачность)
   */
  async blinkOpacity(duration) {
    const halfDuration = duration / 2;
    
    // Закрыть глаза (показать тёмные круги)
    this.eyes.left.animate(halfDuration).opacity(1);
    this.eyes.right.animate(halfDuration).opacity(1);
    
    await this.sleep(halfDuration);
    
    // Открыть глаза (спрятать круги)
    this.eyes.left.animate(halfDuration).opacity(0);
    this.eyes.right.animate(halfDuration).opacity(0);
    
    await this.sleep(halfDuration);
  }

  /**
   * Моргание методом scale (сжатие по вертикали)
   */
  async blinkScale(duration) {
    const halfDuration = duration / 2;
    
    // Закрыть глаза (сжать по Y)
    this.eyes.left.animate(halfDuration).scale(1, 0.1).opacity(1);
    this.eyes.right.animate(halfDuration).scale(1, 0.1).opacity(1);
    
    await this.sleep(halfDuration);
    
    // Открыть глаза
    this.eyes.left.animate(halfDuration).scale(1, 1).opacity(0);
    this.eyes.right.animate(halfDuration).scale(1, 1).opacity(0);
    
    await this.sleep(halfDuration);
  }

  /**
   * Моргание методом offset (сдвиг век)
   */
  async blinkOffset(duration) {
    const halfDuration = duration / 2;
    
    // Сохраняем начальные позиции
    const leftY = this.eyes.left.cy();
    const rightY = this.eyes.right.cy();
    
    // Закрыть глаза (сдвинуть вниз и показать)
    this.eyes.left.animate(halfDuration).cy(leftY + 3).opacity(0.7);
    this.eyes.right.animate(halfDuration).cy(rightY + 3).opacity(0.7);
    
    await this.sleep(halfDuration);
    
    // Открыть глаза
    this.eyes.left.animate(halfDuration).cy(leftY).opacity(0);
    this.eyes.right.animate(halfDuration).cy(rightY).opacity(0);
    
    await this.sleep(halfDuration);
  }

  /**
   * Вспомогательная функция задержки
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Изменить параметры на лету
   */
  updateParams(newParams) {
    this.params = { ...this.params, ...newParams };
    console.log('🔄 Параметры моргания обновлены:', this.params);
  }
}