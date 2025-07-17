// src/api/FileApi.js - 개선된 파일 업로드 함수

import apiClient from './AuthApi';

// 업로드 재시도 설정
const UPLOAD_RETRY_COUNT = 3;
const UPLOAD_RETRY_DELAY = 1000; // 1초

// 지연 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 파일명 안전성 검사 함수
const sanitizeFileName = (fileName) => {
  // 특수 문자 제거 및 공백을 언더스코어로 변경
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_') // 연속된 언더스코어를 하나로
    .toLowerCase();
};

// 개선된 단일 파일 업로드 함수
export const uploadFile = async (file, options = {}) => {
  const { retryCount = UPLOAD_RETRY_COUNT, retryDelay = UPLOAD_RETRY_DELAY } = options;
  
  try {
    console.log('📁 파일 업로드 시작:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // 파일 유효성 검사
    if (!file || !file.name) {
      throw new Error('유효하지 않은 파일입니다.');
    }
    
    if (file.size === 0) {
      throw new Error('빈 파일은 업로드할 수 없습니다.');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      throw new Error(`파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다. (현재: ${Math.round(file.size / 1024 / 1024 * 100) / 100}MB)`);
    }
    
    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    
    // 추가 메타데이터 포함
    formData.append('originalName', file.name);
    formData.append('contentType', file.type);
    formData.append('size', file.size.toString());
    formData.append('uploadTimestamp', Date.now().toString());
    
    // 업로드 요청 설정
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000, // 30초 타임아웃
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📊 업로드 진행률: ${percentCompleted}% (${file.name})`);
      }
    };
    
    // 재시도 로직
    let lastError;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`🔄 업로드 시도 ${attempt}/${retryCount}: ${file.name}`);
        
        // 첫 번째 시도가 아닌 경우 지연
        if (attempt > 1) {
          console.log(`⏳ ${retryDelay}ms 대기 중...`);
          await delay(retryDelay * attempt); // 지수 백오프
        }
        
        const response = await apiClient.post('/files/upload', formData, config);
        
        // 응답 유효성 검사
        if (!response || !response.data) {
          throw new Error('서버 응답이 없습니다.');
        }
        
        const { fileName, fileUrl, message } = response.data;
        
        if (!fileName) {
          throw new Error('서버에서 파일명을 반환하지 않았습니다.');
        }
        
        console.log('✅ 파일 업로드 성공:', {
          originalName: file.name,
          savedName: fileName,
          url: fileUrl,
          message: message,
          attempt: attempt,
          responseStatus: response.status
        });
        
        return {
          fileName: fileName,
          fileUrl: fileUrl || `/api/files/temp/${fileName}`,
          originalName: file.name,
          contentType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          message: message
        };
        
      } catch (error) {
        lastError = error;
        
        console.error(`❌ 업로드 시도 ${attempt} 실패:`, {
          fileName: file.name,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        
        // 특정 오류 유형별 처리
        if (error.response?.status === 403) {
          console.warn('🚫 403 Forbidden - 권한 문제 또는 서버 제한');
          
          // 403 오류의 경우 더 긴 지연
          if (attempt < retryCount) {
            await delay(retryDelay * 2);
          }
        } else if (error.response?.status === 413) {
          // 413 Payload Too Large - 파일 크기 초과
          throw new Error('파일 크기가 서버 제한을 초과했습니다.');
        } else if (error.response?.status === 415) {
          // 415 Unsupported Media Type - 지원하지 않는 파일 형식
          throw new Error('지원하지 않는 파일 형식입니다.');
        } else if (error.response?.status >= 500) {
          // 서버 오류 - 재시도 가능
          console.warn('🔧 서버 오류 - 재시도 예정');
        } else if (error.code === 'ECONNABORTED') {
          // 타임아웃 오류
          console.warn('⏰ 업로드 타임아웃 - 재시도 예정');
        } else {
          // 기타 클라이언트 오류 - 재시도하지 않음
          break;
        }
        
        // 마지막 시도인 경우 오류 던지기
        if (attempt === retryCount) {
          throw lastError;
        }
      }
    }
    
    // 모든 재시도 실패
    throw lastError;
    
  } catch (error) {
    console.error('❌ 파일 업로드 최종 실패:', {
      fileName: file.name,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    });
    
    // 사용자 친화적인 오류 메시지
    let userMessage = '파일 업로드에 실패했습니다.';
    
    if (error.response?.status === 403) {
      userMessage = '파일 업로드 권한이 없습니다. 로그인 상태를 확인해주세요.';
    } else if (error.response?.status === 413) {
      userMessage = '파일 크기가 너무 큽니다. (최대 10MB)';
    } else if (error.response?.status === 415) {
      userMessage = '지원하지 않는 파일 형식입니다.';
    } else if (error.response?.status >= 500) {
      userMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.code === 'ECONNABORTED') {
      userMessage = '업로드 시간이 초과되었습니다. 네트워크를 확인하고 다시 시도해주세요.';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    // 커스텀 오류 객체 생성
    const uploadError = new Error(userMessage);
    uploadError.originalError = error;
    uploadError.fileName = file.name;
    uploadError.fileSize = file.size;
    uploadError.status = error.response?.status;
    
    throw uploadError;
  }
};

// 개선된 다중 파일 업로드 함수 (순차적 처리)
export const uploadMultipleFiles = async (files, options = {}) => {
  const { onProgress, onFileComplete, onFileError } = options;
  
  try {
    console.log('📁 다중 파일 업로드 시작:', files.length, '개 파일');
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // 진행률 콜백 호출
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            percent: Math.round(((i + 1) / files.length) * 100)
          });
        }
        
        // 파일 업로드 (재시도 포함)
        const result = await uploadFile(file, {
          retryCount: 2, // 다중 업로드 시 재시도 횟수 줄임
          retryDelay: 800
        });
        
        results.push(result);
        
        // 파일 완료 콜백 호출
        if (onFileComplete) {
          onFileComplete(result, i + 1, files.length);
        }
        
        // 다음 파일 업로드 전 잠시 대기 (서버 부하 방지)
        if (i < files.length - 1) {
          await delay(300);
        }
        
      } catch (error) {
        console.error(`❌ 파일 업로드 실패 (${i + 1}/${files.length}):`, error);
        
        errors.push({
          file: file,
          error: error,
          index: i
        });
        
        // 파일 오류 콜백 호출
        if (onFileError) {
          onFileError(error, file, i + 1, files.length);
        }
        
        // 403 오류가 연속으로 발생하는 경우 더 긴 지연
        if (error.status === 403) {
          await delay(1000);
        }
      }
    }
    
    console.log('📊 다중 파일 업로드 완료:', {
      성공: results.length,
      실패: errors.length,
      전체: files.length
    });
    
    return {
      success: results,
      errors: errors,
      total: files.length,
      successCount: results.length,
      errorCount: errors.length
    };
    
  } catch (error) {
    console.error('❌ 다중 파일 업로드 프로세스 오류:', error);
    throw error;
  }
};

// 기존 함수들 (개선된 오류 처리 포함)
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
      },
      timeout: 60000 // 60초 타임아웃 (파일 업로드 포함)
    });
    
    console.log('✅ 첨부파일 포함 게시글 작성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 첨부파일 포함 게시글 작성 실패:', error);
    throw error;
  }
};

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
      },
      timeout: 60000 // 60초 타임아웃
    });
    
    console.log('✅ 첨부파일 포함 게시글 수정 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 첨부파일 포함 게시글 수정 실패:', error);
    throw error;
  }
};