import apiClient from './AuthApi';

// 카테고리 관련 API
export const fetchCategories = async () => {
  try {
    console.log('📋 카테고리 목록 요청');
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('❌ 카테고리 목록 가져오기 실패:', error);
    throw error;
  }
};

export const fetchCategory = async (id) => {
  try {
    console.log('📋 카테고리 상세 요청:', id);
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ 카테고리 상세 가져오기 실패:', error);
    throw error;
  }
};

// 게시글 관련 API
export const fetchPosts = async () => {
  try {
    console.log('📝 전체 게시글 목록 요청');
    const response = await apiClient.get('/posts');
    return response.data;
  } catch (error) {
    console.error('❌ 게시글 목록 가져오기 실패:', error);
    throw error;
  }
};

export const fetchPostsByCategory = async (categoryId) => {
  try {
    console.log('📝 카테고리별 게시글 목록 요청:', categoryId);
    const response = await apiClient.get(`/categories/${categoryId}/posts`);
    return response.data;
  } catch (error) {
    console.error(`❌ 카테고리 ${categoryId}의 게시글 목록 가져오기 실패:`, error);
    throw error;
  }
};

export const fetchPost = async (id) => {
  try {
    console.log('📝 게시글 상세 요청:', id);
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ 게시글 상세 가져오기 실패:', error);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    console.log('✍️ 게시글 작성 요청:', postData);
    const response = await apiClient.post('/posts', postData);
    console.log('✅ 게시글 작성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 게시글 작성 실패:', error);
    throw error;
  }
};

export const updatePost = async (id, postData) => {
  try {
    console.log('📝 게시글 수정 요청:', id, postData);
    const response = await apiClient.put(`/posts/${id}`, postData);
    console.log('✅ 게시글 수정 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 게시글 수정 실패:', error);
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    console.log('🗑️ 게시글 삭제 요청:', id);
    await apiClient.delete(`/posts/${id}`);
    console.log('✅ 게시글 삭제 성공');
    return true;
  } catch (error) {
    console.error('❌ 게시글 삭제 실패:', error);
    throw error;
  }
};