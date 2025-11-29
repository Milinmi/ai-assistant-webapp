// ============================================
// CHARACTERS API - Работа с характерами MBTI
// ============================================

import apiClient from './apiClient.js';

/**
 * Получить список всех типов MBTI
 */
export async function getCharactersList() {
  try {
    console.log('🧠 Загрузка списка MBTI типов...');
    const response = await apiClient.get('/api/characters');
    
    if (response.success) {
      console.log(`✅ Загружено типов: ${response.characters.length}`);
      return response.characters;
    } else {
      throw new Error('Не удалось загрузить список типов');
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки типов:', error);
    throw error;
  }
}

/**
 * Получить полную информацию о типе личности
 * @param {string} mbtiType - Тип MBTI (например, 'ENFJ', 'INFP')
 */
export async function getCharacter(mbtiType) {
  try {
    console.log(`🧠 Загрузка характера: ${mbtiType}`);
    const response = await apiClient.get(`/api/characters/${mbtiType.toUpperCase()}`);
    
    if (response.success) {
      console.log(`✅ Характер загружен: ${response.character.characterName} (${mbtiType})`);
      return response.character;
    } else {
      throw new Error(`Характер ${mbtiType} не найден`);
    }
  } catch (error) {
    console.error(`❌ Ошибка загрузки характера ${mbtiType}:`, error);
    throw error;
  }
}

/**
 * Получить параметры анимации для типа
 * @param {string} mbtiType - Тип MBTI
 */
export async function getAnimationParams(mbtiType) {
  try {
    const character = await getCharacter(mbtiType);
    
    if (character.animations) {
      console.log(`✅ Параметры анимации для ${mbtiType} получены`);
      return character.animations;
    } else {
      throw new Error(`У характера ${mbtiType} нет параметров анимации`);
    }
  } catch (error) {
    console.error(`❌ Ошибка получения параметров анимации:`, error);
    throw error;
  }
}