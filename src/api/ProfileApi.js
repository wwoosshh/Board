// src/api/ProfileApi.js
import apiClient from './AuthApi';

// 현재 사용자의 프로필 정보 가져오기
export const fetchMyProfile = async () => {
  try {
    console.log('🔍 내 프로필 요청');
    const response = await apiClient.get('/profile/me');
    return response.data;
  } catch (error) {
    console.error('❌ 프로필 정보 가져오기 실패:', error);
    throw error;
  }
};

// 특정 사용자의 프로필 정보 가져오기
export const fetchUserProfile = async (username) => {
  try {
    console.log('🔍 사용자 프로필 요청:', username);
    const response = await apiClient.get(`/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error('❌ 사용자 프로필 정보 가져오기 실패:', error);
    throw error;
  }
};

// 프로필 정보 업데이트
export const updateProfile = async (profileData) => {
  try {
    console.log('✏️ 프로필 업데이트 요청:', profileData);
    const response = await apiClient.put('/profile/update', profileData);
    console.log('✅ 프로필 업데이트 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 프로필 업데이트 실패:', error);
    throw error;
  }
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (imageFile) => {
  try {
    console.log('🖼️ 프로필 이미지 업로드 요청');
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ 프로필 이미지 업로드 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 프로필 이미지 업로드 실패:', error);
    throw error;
  }
};