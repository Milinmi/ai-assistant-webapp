// ============================================
// API CLIENT - Базовый клиент для работы с API
// ============================================

class APIClient {
  constructor() {
    this.baseURL = window.location.origin;
    console.log('🔗 API Client инициализирован:', this.baseURL);
  }

  /**
   * Универсальный GET запрос
   */
  async get(endpoint) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`📡 GET ${endpoint}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ GET ${endpoint} успешно`);
      
      return data;
    } catch (error) {
      console.error(`❌ GET ${endpoint} ошибка:`, error);
      throw error;
    }
  }

  /**
   * Универсальный POST запрос
   */
  async post(endpoint, body) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`📡 POST ${endpoint}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ POST ${endpoint} успешно`);
      
      return data;
    } catch (error) {
      console.error(`❌ POST ${endpoint} ошибка:`, error);
      throw error;
    }
  }

  /**
   * Получить URL изображения
   */
  getImageURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }
}

// Экспортируем единственный экземпляр
export default new APIClient();