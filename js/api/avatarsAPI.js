// ============================================
// AVATARS API - Работа с аватарами
// ============================================

import apiClient from './apiClient.js';

/**
 * Получить список всех аватаров
 */
export async function getAvatarsList() {
  try {
    console.log('🎨 Загрузка списка аватаров...');
    const response = await apiClient.get('/api/avatars');
    
    if (response.success) {
      console.log(`✅ Загружено аватаров: ${response.avatars.length}`);
      return response.avatars;
    } else {
      throw new Error('Не удалось загрузить список аватаров');
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки аватаров:', error);
    throw error;
  }
}

/**
 * Получить полную информацию об аватаре
 * @param {string} avatarId - ID аватара (например, 'cyborg-female')
 */
export async function getAvatar(avatarId) {
  try {
    console.log(`🎨 Загрузка аватара: ${avatarId}`);
    const response = await apiClient.get(`/api/avatars/${avatarId}`);
    
    if (response.success) {
      console.log(`✅ Аватар загружен: ${response.metadata.name}`);
      
      // Добавляем полный URL изображения
      response.imageURL = apiClient.getImageURL(response.imageUrl);
      
      return {
        id: avatarId,
        name: response.metadata.name,
        description: response.metadata.description,
        metadata: response.metadata,
        calibration: response.calibration,
        imageURL: response.imageURL
      };
    } else {
      throw new Error(`Аватар ${avatarId} не найден`);
    }
  } catch (error) {
    console.error(`❌ Ошибка загрузки аватара ${avatarId}:`, error);
    throw error;
  }
}

/**
 * Получить URL изображения аватара
 * @param {string} avatarId - ID аватара
 */
export function getAvatarImageURL(avatarId) {
  return apiClient.getImageURL(`/api/avatars/${avatarId}/image`);
}