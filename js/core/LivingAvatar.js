// ============================================
// LIVING AVATAR - Класс "живого" аватара
// v5 - Финальная настройка: размер рта, скорость, размер LED
// ============================================

import { getAvatar } from '../api/avatarsAPI.js';
import { getCharacter } from '../api/charactersAPI.js';
import BlinkAnimation from '../animations/BlinkAnimation.js';
import BreathAnimation from '../animations/BreathAnimation.js';
import LightsAnimation from '../animations/LightsAnimation.js';
import EqualizerAnimation from '../animations/EqualizerAnimation.js';
import MouthLEDAnimation from '../animations/MouthLEDAnimation.js';

export default class LivingAvatar {
  constructor(avatarId, characterMBTI) {
    this.avatarId = avatarId;
    this.characterMBTI = characterMBTI;
    
    // Данные
    this.avatarData = null;
    this.characterData = null;
    
    // SVG элементы
    this.svg = null;
    this.elements = {
      image: null,
      eyes: { left: null, right: null },
      mouth: { leds: [] },
      display: { background: null, bars: [] },
      lights: []
    };
    
    // Анимации
    this.animations = {
      blink: null,
      breath: null,
      lights: null,
      equalizer: null,
      mouthLED: null
    };
    
    // Состояние
    this.state = 'idle';
    
    console.log(`🤖 LivingAvatar создан: ${avatarId} (${characterMBTI})`);
  }

  async init(containerId) {
    try {
      console.log('🔄 Инициализация LivingAvatar...');
      
      await this.loadData();
      await this.createSVG(containerId);
      this.createElements();
      this.startVitalSigns();
      
      console.log('✅ LivingAvatar инициализирован!');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации LivingAvatar:', error);
      throw error;
    }
  }

  async loadData() {
    console.log('📥 Загрузка данных...');
    
    const [avatarData, characterData] = await Promise.all([
      getAvatar(this.avatarId),
      getCharacter(this.characterMBTI)
    ]);
    
    this.avatarData = avatarData;
    this.characterData = characterData;
    
    console.log(`✅ Аватар: ${avatarData.name}`);
    console.log(`✅ Характер: ${characterData.characterName} (${this.characterMBTI})`);
  }

  async createSVG(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Контейнер #${containerId} не найден`);
    }
    
    this.svg = SVG().addTo(container).size(256, 256);
    
    // Изображение на заднем плане
    this.elements.image = this.svg.image(this.avatarData.imageURL).size(256, 256);
    
    console.log('✅ SVG создан');
  }

  createElements() {
    console.log('🎨 Создание элементов анимации...');
    
    const cal = this.avatarData.calibration.calibration;
    
    // Порядок: от заднего плана к переднему
    this.createLights(cal.lights);
    
    if (cal.display) {
      this.createDisplay(cal.display);
    }
    
    this.createEyes(cal.eyes);
    
    // LED рта - последними (на переднем плане)
    this.createMouthLEDs(cal.mouth);
    
    console.log('✅ Элементы созданы');
  }

  createEyes(eyesData) {
    this.elements.eyes.left = this.svg.circle(12)
      .center(eyesData.left.x, eyesData.left.y)
      .fill('#000000')
      .opacity(0);
    
    this.elements.eyes.right = this.svg.circle(12)
      .center(eyesData.right.x, eyesData.right.y)
      .fill('#000000')
      .opacity(0);
    
    console.log('👀 Глаза созданы');
  }

  /**
   * Создание LED огоньков на рту
   * v5 - Размер 4px, рассчитываем по координатам рта
   */
  createMouthLEDs(mouthData) {
    const ledSize = 4;  // Уменьшен в 2 раза
    
    // Вычисляем ширину рта из calibration
    const mouthWidth = mouthData.right.x - mouthData.left.x;
    const spacing = 5;  // Компактный интервал
    
    // Количество LED исходя из ширины рта
    const ledCount = Math.floor(mouthWidth / spacing);
    
    // Стартовая позиция
    const startX = mouthData.left.x;
    const y = mouthData.center.y;
    
    console.log(`💬 Рот: ширина=${mouthWidth}px, LED=${ledCount} шт, размер=${ledSize}px`);
    
    for (let i = 0; i < ledCount; i++) {
      const led = this.svg.circle(ledSize)
        .center(startX + i * spacing, y)
        .fill('#ff3300')
        .stroke({ color: '#ff6600', width: 1.5 })
        .opacity(0);
      
      this.elements.mouth.leds.push(led);
    }
    
    console.log(`💬 LED рта созданы: ${ledCount} шт по ${ledSize}px`);
  }

  createDisplay(displayData) {
    const style = displayData.style;
    const eq = displayData.equalizer;
    
    const width = displayData.bottomRight.x - displayData.topLeft.x;
    const height = displayData.bottomRight.y - displayData.topLeft.y;
    const centerX = displayData.topLeft.x + width / 2;
    const centerY = displayData.topLeft.y + height / 2;
    
    this.elements.display.background = this.svg.rect(width, height)
      .center(centerX, centerY)
      .fill(style.backgroundColor)
      .stroke({ color: style.borderColor, width: style.borderWidth })
      .radius(style.borderRadius)
      .opacity(0);
    
    const totalBarsWidth = eq.barCount * eq.barWidth + (eq.barCount - 1) * eq.barSpacing;
    const startX = centerX - totalBarsWidth / 2 + eq.barWidth / 2;
    
    for (let i = 0; i < eq.barCount; i++) {
      const x = startX + i * (eq.barWidth + eq.barSpacing);
      
      const bar = this.svg.rect(eq.barWidth, eq.barMinHeight)
        .center(x, centerY)
        .fill(eq.barColor)
        .opacity(0);
      
      this.elements.display.bars.push(bar);
    }
    
    console.log('📊 Дисплей создан');
  }

  createLights(lightsData) {
    lightsData.forEach(light => {
      const circle = this.svg.circle(light.size)
        .center(light.x, light.y)
        .fill(light.color)
        .stroke({ color: light.color, width: 2, opacity: 0.5 })
        .opacity(0.6);
      
      this.elements.lights.push({
        element: circle,
        group: light.group,
        color: light.color
      });
    });
    
    console.log(`💡 Огоньки созданы: ${lightsData.length} шт`);
  }

  startVitalSigns() {
    console.log('💫 Запуск витальных признаков...');
    
    this.startBlinking();
    this.startBreathing();
    this.startLights();
    
    console.log('✅ Витальные признаки запущены');
  }

  startBlinking() {
    const params = this.characterData.animations.eyesBlink;
    
    if (!params.enabled) {
      console.log('⏭️ Моргание отключено');
      return;
    }
    
    this.animations.blink = new BlinkAnimation(this.elements.eyes, params);
    this.animations.blink.start();
    
    console.log('✅ Моргание активировано');
  }

  startBreathing() {
    const params = this.characterData.animations.headIdleSwaying;
    
    if (!params.enabled) {
      console.log('⏭️ Дыхание отключено');
      return;
    }
    
    this.animations.breath = new BreathAnimation(this.elements.image, params);
    this.animations.breath.start();
    
    console.log('✅ Дыхание активировано');
  }

  startLights() {
    const params = this.characterData.animations.lightsPulse;
    
    if (!params.enabled) {
      console.log('⏭️ Огоньки отключены');
      return;
    }
    
    this.animations.lights = new LightsAnimation(
      this.elements.lights, 
      params,
      this.animations.breath
    );
    
    this.animations.lights.start();
    
    console.log('✅ Огоньки активированы');
  }

  setState(newState) {
    console.log(`🎭 Состояние: ${this.state} → ${newState}`);
    
    const oldState = this.state;
    this.state = newState;
    
    switch (newState) {
      case 'idle':
        this.setIdleState();
        break;
        
      case 'listening':
        this.setListeningState();
        break;
        
      case 'thinking':
        this.setThinkingState();
        break;
        
      case 'speaking':
        this.setSpeakingState();
        break;
        
      default:
        console.warn(`⚠️ Неизвестное состояние: ${newState}`);
    }
  }

  setIdleState() {
    console.log('😌 Режим: ПОКОЙ');
    
    if (this.animations.equalizer) {
      this.animations.equalizer.stop();
    }
    
    if (this.animations.mouthLED) {
      this.animations.mouthLED.stop();
      console.log('✅ LED рта остановлены');
    }
  }

  setListeningState() {
    console.log('👂 Режим: СЛУШАЕТ');
    
    if (this.animations.equalizer) {
      this.animations.equalizer.stop();
    }
    
    if (!this.animations.mouthLED) {
      this.animations.mouthLED = new MouthLEDAnimation(this.elements.mouth.leds, {
        speed: 500,       // Медленнее в 5 раз
        wormLength: 3,
        wormGap: 2
      });
    }
    
    this.animations.mouthLED.startPulse();
  }

  setThinkingState() {
    console.log('🤔 Режим: ДУМАЕТ');
    
    if (this.animations.mouthLED) {
      this.animations.mouthLED.stop();
    }
    
    if (!this.animations.equalizer) {
      this.animations.equalizer = new EqualizerAnimation(this.elements.display, {
        speed: 100
      });
    }
    
    this.animations.equalizer.start();
  }

  setSpeakingState() {
    console.log('🗣️ Режим: ГОВОРИТ');
    
    if (this.animations.equalizer) {
      this.animations.equalizer.stop();
    }
    
    if (!this.animations.mouthLED) {
      this.animations.mouthLED = new MouthLEDAnimation(this.elements.mouth.leds, {
        speed: 500,       // Медленнее в 5 раз (было 100)
        wormLength: 3,    // Короткий червячок
        wormGap: 2        // Средний интервал
      });
    }
    
    this.animations.mouthLED.start();
  }

  getAnimationParams() {
    return this.characterData.animations;
  }

  destroy() {
    if (this.animations.blink) {
      this.animations.blink.stop();
    }
    if (this.animations.breath) {
      this.animations.breath.stop();
    }
    if (this.animations.lights) {
      this.animations.lights.stop();
    }
    if (this.animations.equalizer) {
      this.animations.equalizer.stop();
    }
    if (this.animations.mouthLED) {
      this.animations.mouthLED.stop();
    }
    
    if (this.svg) {
      this.svg.clear();
      this.svg.remove();
    }
    
    console.log('🗑️ LivingAvatar уничтожен');
  }
}