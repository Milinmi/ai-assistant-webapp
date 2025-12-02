// ============================================
// AI ASSISTANT WEBAPP v4.1
// v4.1 - Режим тестирования для Google Drive
// v4.0 - Добавлен STT (распознавание речи)
// ============================================

import LivingAvatar from './js/core/LivingAvatar.js';

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

let livingAvatar = null;
let userId = null;
let currentAssistant = 'coach';

// Элементы интерфейса
let messagesContainer = null;
let messageInput = null;
let sendButton = null;
let microphoneBtn = null;

// Озвучка
let speechTimeoutId = null;

// Распознавание речи (STT)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

async function init() {
  try {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   AI ASSISTANT WEBAPP v4.1             ║');
    console.log('║   + STT + Google Drive Test Mode      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    
    // НОВОЕ: Получаем конфигурацию с сервера
    const config = await fetchConfig();
    
    // Инициализация userId с умной логикой
    if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();  // ← добавили
  tg.expand();
  
  const initData = tg.initData;  // ← для валидации на сервере
  
  if (initData && tg.initDataUnsafe?.user?.id) {
    userId = String(tg.initDataUnsafe.user.id);  // ← String()!
    console.log('✅ Telegram userId получен:', userId);
  } else {
    userId = config.testUserId || 'test_user_' + Date.now();
    console.log('⚠️ Telegram ID не получен, используется тестовый:', userId);
  }
    } else {
      // Работаем в обычном браузере (тестирование)
      if (config.nodeEnv === 'development' && config.testUserId) {
        // Режим разработки - используем фиксированный ID
        userId = config.testUserId;
        console.log('🧪 Режим тестирования: фиксированный userId:', userId);
      } else {
        // Production без Telegram - случайный ID
        userId = 'test_user_' + Date.now();
        console.log('⚠️ Браузер (не Telegram): случайный userId:', userId);
      }
    }
    
    // Получаем элементы интерфейса
    messagesContainer = document.getElementById('messages');
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendButton');
    microphoneBtn = document.getElementById('microphoneBtn');
    
    console.log('🤖 Создание LivingAvatar...');
    console.log('   Аватар: cyborg-female');
    console.log('   Характер: ENFJ (Тренер)');
    console.log('');
    
    // Создание живого аватара
    livingAvatar = new LivingAvatar('cyborg-female', 'ENFJ');
    await livingAvatar.init('avatarContainer');
    
    // Настройка обработчиков событий
    setupChatHandlers();
    initSpeechRecognition();
    
    console.log('');
    console.log('✅ Всё готово! Аватар "живой" и готов к общению!');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Ошибка инициализации:', error);
    console.error('');
    
    const container = document.getElementById('avatarContainer');
    if (container) {
      container.innerHTML = `
        <div style="color: red; padding: 20px; text-align: center;">
          <h3>Ошибка загрузки</h3>
          <p>${error.message}</p>
          <p style="font-size: 12px;">Проверьте консоль браузера (F12)</p>
        </div>
      `;
    }
  }
}

// ============================================
// НОВОЕ: ПОЛУЧЕНИЕ КОНФИГУРАЦИИ С СЕРВЕРА
// ============================================

/**
 * Получить конфигурацию приложения с сервера
 * @returns {object} Конфигурация
 */
async function fetchConfig() {
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    
    if (data.success) {
      return data.config;
    } else {
      console.warn('⚠️ Не удалось получить конфигурацию, используются значения по умолчанию');
      return {
        nodeEnv: 'production',
        testUserId: null
      };
    }
  } catch (error) {
    console.error('❌ Ошибка получения конфигурации:', error);
    return {
      nodeEnv: 'production',
      testUserId: null
    };
  }
}

// ============================================
// НАСТРОЙКА ОБРАБОТЧИКОВ ЧАТА
// ============================================

function setupChatHandlers() {
  console.log('💬 Настройка обработчиков чата...');
  
  // Кнопка отправки
  sendButton.addEventListener('click', sendMessage);
  
  // Enter для отправки (Shift+Enter = новая строка)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Автоматическое изменение высоты textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
  });
  
  // Кнопка микрофона
  microphoneBtn.addEventListener('click', toggleVoiceInput);
  
  console.log('✅ Обработчики чата настроены');
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ РАСПОЗНАВАНИЯ РЕЧИ (STT)
// ============================================

function initSpeechRecognition() {
  if (!SpeechRecognition) {
    console.warn('⚠️ Web Speech API не поддерживается в этом браузере');
    microphoneBtn.disabled = true;
    microphoneBtn.title = 'Ваш браузер не поддерживает распознавание речи';
    return;
  }
  
  console.log('🎤 Инициализация Web Speech API...');
  
  recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU'; // Русский язык
  recognition.continuous = false; // Остановка после фразы
  recognition.interimResults = false; // Только финальный результат
  
  // Когда распознавание начинается
  recognition.onstart = () => {
    console.log('🎤 Распознавание речи началось');
    isRecording = true;
    
    // Меняем состояние кнопки на "слушает"
    microphoneBtn.classList.add('listening');
    microphoneBtn.classList.remove('processing');
    
    // Меняем состояние аватара
    livingAvatar.setState('listening');
  };
  
  // Когда получен результат
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('✅ Распознано:', transcript);
    
    // Вставляем текст в поле ввода
    messageInput.value = transcript;
    
    // Меняем состояние кнопки на "обрабатывает"
    microphoneBtn.classList.remove('listening');
    microphoneBtn.classList.add('processing');
    
    // Автоматически отправляем сообщение
    sendMessage();
  };
  
  // Когда распознавание закончилось
  recognition.onend = () => {
    console.log('🎤 Распознавание речи завершено');
    isRecording = false;
    
    // Возвращаем кнопку в нормальное состояние
    microphoneBtn.classList.remove('listening', 'processing');
  };
  
  // Обработка ошибок
  recognition.onerror = (event) => {
    console.error('❌ Ошибка распознавания речи:', event.error);
    
    isRecording = false;
    microphoneBtn.classList.remove('listening', 'processing');
    
    // Показываем пользователю понятное сообщение
    let errorMessage = 'Ошибка распознавания речи';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'Речь не обнаружена. Попробуйте снова.';
        break;
      case 'audio-capture':
        errorMessage = 'Микрофон недоступен. Проверьте настройки.';
        break;
      case 'not-allowed':
        errorMessage = 'Доступ к микрофону запрещён. Разрешите в настройках браузера.';
        break;
      case 'network':
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        break;
    }
    
    addMessage(errorMessage, 'system');
    livingAvatar.setState('idle');
  };
  
  console.log('✅ Web Speech API инициализирован');
}

// ============================================
// УПРАВЛЕНИЕ ГОЛОСОВЫМ ВВОДОМ
// ============================================

/**
 * Переключатель записи голоса (вкл/выкл)
 */
function toggleVoiceInput() {
  if (isRecording) {
    stopVoiceInput();
  } else {
    startVoiceInput();
  }
}

/**
 * Начать запись голоса
 */
function startVoiceInput() {
  if (!recognition) {
    console.error('❌ Web Speech API не инициализирован');
    return;
  }
  
  try {
    console.log('🎤 Начинаю запись...');
    recognition.start();
  } catch (error) {
    console.error('❌ Ошибка запуска записи:', error);
  }
}

/**
 * Остановить запись голоса
 */
function stopVoiceInput() {
  if (!recognition) return;
  
  try {
    console.log('🎤 Останавливаю запись...');
    recognition.stop();
  } catch (error) {
    console.error('❌ Ошибка остановки записи:', error);
  }
}

// ============================================
// ОТПРАВКА СООБЩЕНИЯ
// ============================================

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  
  console.log('📤 Отправка сообщения:', message);
  
  // Добавляем сообщение пользователя в чат
  addMessage(message, 'user');
  
  // Очищаем поле ввода
  messageInput.value = '';
  messageInput.style.height = 'auto';
  
  // Аватар переходит в режим прослушивания
  livingAvatar.setState('listening');
  
  // Показываем индикатор "печатает..."
  showTypingIndicator();
  
  try {
    // Аватар переходит в режим "думает"
    livingAvatar.setState('thinking');
    
    // Отправляем запрос на сервер
    const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:3000' 
  : 'https://ai-assistant-production-fbb5.up.railway.app';
const response = await fetch(`${apiBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assistantId: currentAssistant,
        message: message,
        userId: userId,
        level: 'basic'
      })
    });
    
    const data = await response.json();
    
    // Убираем индикатор "печатает..."
    removeTypingIndicator();
    
    if (data.success) {
      console.log('✅ Получен ответ от AI');
      
      // Добавляем ответ ассистента в чат
      addMessage(data.response, 'assistant');
      
      // Озвучиваем ответ
      await speakResponse(data.response);
      
    } else {
      console.error('❌ Ошибка от API:', data);
      addMessage('Извините, произошла ошибка.', 'assistant');
      livingAvatar.setState('idle');
    }
    
  } catch (error) {
    console.error('❌ Ошибка отправки:', error);
    removeTypingIndicator();
    addMessage('Ошибка соединения с сервером.', 'assistant');
    livingAvatar.setState('idle');
  }
}

// ============================================
// РАБОТА С СООБЩЕНИЯМИ В ЧАТЕ
// ============================================

/**
 * Добавить сообщение в чат
 * @param {string} text - Текст сообщения
 * @param {string} type - Тип: 'user', 'assistant', 'system'
 */
function addMessage(text, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const p = document.createElement('p');
  p.textContent = text;
  
  messageDiv.appendChild(p);
  messagesContainer.appendChild(messageDiv);
  
  // Прокручиваем чат вниз
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  console.log(`💬 Сообщение добавлено (${type}): ${text.substring(0, 50)}...`);
}

/**
 * Показать индикатор "печатает..."
 */
function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'message assistant typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = '<p>Думаю...</p>';
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Убрать индикатор "печатает..."
 */
function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

// ============================================
// ОЗВУЧКА ОТВЕТА (TTS)
// ============================================

/**
 * Озвучка ответа с улучшенной детекцией окончания
 * @param {string} text - Текст для озвучки
 */
async function speakResponse(text) {
  // Аватар переходит в режим "говорит"
  livingAvatar.setState('speaking');
  
  // Очищаем предыдущий таймаут, если есть
  if (speechTimeoutId) {
    clearTimeout(speechTimeoutId);
    speechTimeoutId = null;
  }
  
  // Проверяем поддержку Web Speech API
  if ('speechSynthesis' in window) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9; // Немного медленнее для естественности
      
      // Рассчитываем примерное время озвучки (150мс на символ)
      const estimatedDuration = text.length * 150;
      
      let speechEnded = false;
      
      // Функция завершения озвучки
      const finishSpeech = () => {
        if (speechEnded) return;
        speechEnded = true;
        
        console.log('🔊 Озвучка завершена');
        
        if (speechTimeoutId) {
          clearTimeout(speechTimeoutId);
          speechTimeoutId = null;
        }
        
        // Аватар возвращается в режим покоя
        livingAvatar.setState('idle');
        resolve();
      };
      
      // Обработчики событий озвучки
      utterance.onend = () => {
        console.log('🔊 Событие onend');
        finishSpeech();
      };
      
      utterance.onerror = (e) => {
        console.error('❌ Ошибка озвучки:', e.error);
        finishSpeech();
      };
      
      // Страховочный таймаут (если onend не сработает)
      // +5 секунд запас
      speechTimeoutId = setTimeout(() => {
        console.warn('⚠️ Таймаут озвучки - принудительная остановка');
        speechSynthesis.cancel();
        finishSpeech();
      }, estimatedDuration + 5000);
      
      console.log(`🔊 Начинаю озвучку (${text.length} символов, макс. ${estimatedDuration + 5000}мс)`);
      speechSynthesis.speak(utterance);
    });
  } else {
    console.warn('⚠️ Web Speech API недоступен');
    // Имитируем задержку озвучки
    await new Promise(resolve => setTimeout(resolve, text.length * 150));
    livingAvatar.setState('idle');
  }
}

// ============================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Глобальный доступ к аватару (для отладки в консоли)
window.livingAvatar = livingAvatar;

console.log('💡 Подсказка: можно управлять аватаром через консоль');
console.log('   Например: livingAvatar.setState("thinking")');
