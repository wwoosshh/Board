// src/api/FileApi.js
import apiClient from './AuthApi';

// 단일 파일 업로드 (임시)
export const uploadFile = async (file) => {
  try {
    console.log('📁 파일 업로드 요청:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ 파일 업로드 성공:', response.data);
    console.log('생성된 파일 URL:', response.data.fileUrl);
    return response.data;
  } catch (error) {
    console.error('❌ 파일 업로드 실패:', error);
    console.error('에러 응답:', error.response?.data);
    console.error('에러 상태:', error.response?.status);
    throw error;
  }
};

// 다중 파일 업로드 (임시)
export const uploadMultipleFiles = async (files) => {
  try {
    console.log('📁 다중 파일 업로드 요청:', files.length, '개 파일');
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    const response = await apiClient.post('/files/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ 다중 파일 업로드 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 다중 파일 업로드 실패:', error);
    throw error;
  }
};

// 파일 삭제
export const deleteFile = async (fileName, fileType) => {
  try {
    console.log('🗑️ 파일 삭제 요청:', fileName);
    const response = await apiClient.delete(`/files/${fileType}/${fileName}`);
    console.log('✅ 파일 삭제 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 파일 삭제 실패:', error);
    throw error;
  }
};

// 게시글 작성 시 파일 첨부
export const createPostWithFiles = async (postData, files) => {
  try {
    console.log('✍️ 첨부파일 포함 게시글 작성 요청');
    const formData = new FormData();
    
    // 게시글 데이터는 JSON 문자열로 변환하여 추가
    formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
    
    // 파일 추가
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    }
    
    const response = await apiClient.post('/posts/with-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ 첨부파일 포함 게시글 작성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 첨부파일 포함 게시글 작성 실패:', error);
    throw error;
  }
};

// 게시글 수정 시 파일 첨부/삭제
export const updatePostWithFiles = async (postId, postData, newFiles, deleteFileIds) => {
  try {
    console.log('✏️ 첨부파일 포함 게시글 수정 요청:', postId);
    const formData = new FormData();
    
    // 게시글 데이터는 JSON 문자열로 변환하여 추가
    formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
    
    // 새 파일 추가
    if (newFiles && newFiles.length > 0) {
      for (let i = 0; i < newFiles.length; i++) {
        formData.append('files', newFiles[i]);
      }
    }
    
    // 삭제할 파일 ID 추가
    if (deleteFileIds && deleteFileIds.length > 0) {
      deleteFileIds.forEach(fileId => {
        formData.append('deleteFiles', fileId);
      });
    }
    
    const response = await apiClient.put(`/posts/${postId}/with-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ 첨부파일 포함 게시글 수정 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 첨부파일 포함 게시글 수정 실패:', error);
    throw error;
  }
};