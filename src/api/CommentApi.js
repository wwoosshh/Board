import apiClient from './AuthApi';

// 댓글 목록 조회
export const fetchComments = async (postId) => {
  try {
    console.log('💬 댓글 목록 요청:', postId);
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('❌ 댓글 목록 가져오기 실패:', error);
    throw error;
  }
};

// 댓글 작성
export const createComment = async (postId, commentData) => {
  try {
    console.log('✍️ 댓글 작성 요청:', postId, commentData);
    const response = await apiClient.post(`/posts/${postId}/comments`, commentData);
    console.log('✅ 댓글 작성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 댓글 작성 실패:', error);
    throw error;
  }
};

// 댓글 수정
export const updateComment = async (commentId, commentData) => {
  try {
    console.log('📝 댓글 수정 요청:', commentId, commentData);
    const response = await apiClient.put(`/comments/${commentId}`, commentData);
    console.log('✅ 댓글 수정 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 댓글 수정 실패:', error);
    throw error;
  }
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
  try {
    console.log('🗑️ 댓글 삭제 요청:', commentId);
    await apiClient.delete(`/comments/${commentId}`);
    console.log('✅ 댓글 삭제 성공');
    return true;
  } catch (error) {
    console.error('❌ 댓글 삭제 실패:', error);
    throw error;
  }
};

// 댓글 수 조회
export const fetchCommentCount = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/${postId}/comments/count`);
    return response.data.count;
  } catch (error) {
    console.error('❌ 댓글 수 조회 실패:', error);
    throw error;
  }
};