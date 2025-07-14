import axios from 'axios';
import { authHeader } from './AuthApi';

const BASE_URL = 'http://localhost:5159/api/manager';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: BASE_URL
});

// 요청 인터셉터에 인증 헤더 추가
axiosInstance.interceptors.request.use(
  config => {
    const headers = authHeader();
    if (headers.Authorization) {
      config.headers = {
        ...config.headers,
        ...headers
      };
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// ================================
// 사용자 관리 API
// ================================

export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    console.error('사용자 목록 가져오기 실패:', error);
    throw error;
  }
};

export const fetchUser = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('사용자 상세 가져오기 실패:', error);
    throw error;
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const response = await axiosInstance.put(`/users/${id}/role?role=${role}`);
    return response.data;
  } catch (error) {
    console.error('사용자 역할 변경 실패:', error);
    throw error;
  }
};

export const suspendUser = async (id, suspend) => {
  try {
    const response = await axiosInstance.post(`/users/${id}/suspend?suspend=${suspend}`);
    return response.data;
  } catch (error) {
    console.error('사용자 정지 처리 실패:', error);
    throw error;
  }
};

export const warnUser = async (id) => {
  try {
    const response = await axiosInstance.post(`/users/${id}/warn`);
    return response.data;
  } catch (error) {
    console.error('사용자 경고 실패:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await axiosInstance.delete(`/users/${id}`);
    return true;
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    throw error;
  }
};

// ================================
// 게시판 관리 API
// ================================

export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    return response.data;
  } catch (error) {
    console.error('카테고리 목록 가져오기 실패:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('카테고리 생성 실패:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('카테고리 수정 실패:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    await axiosInstance.delete(`/categories/${id}`);
    return true;
  } catch (error) {
    console.error('카테고리 삭제 실패:', error);
    throw error;
  }
};

// ================================
// 관리자회원 게시판 할당 API
// ================================

export const assignCategoryToModerator = async (userId, categoryId) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('카테고리 할당 실패:', error);
    throw error;
  }
};

export const removeCategoryFromModerator = async (userId, categoryId) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('카테고리 할당 해제 실패:', error);
    throw error;
  }
};

// ================================
// 대시보드 API
// ================================

export const fetchManagerDashboard = async () => {
  try {
    const response = await axiosInstance.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('매니저 대시보드 가져오기 실패:', error);
    throw error;
  }
};