import axios from 'axios';

// 🌐 HTTP로 다시 변경 (HTTPS 대신)
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // 프록시 경로로 변경
  : 'http://localhost:5159/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
let refreshSubscribers = [];

// 토큰 갱신 대기 중인 요청들을 처리하는 함수
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// 요청 인터셉터 - Authorization 헤더 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 토큰 헤더 추가:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('⚠️ 토큰이 없습니다.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    console.log('🔴 API 오류:', response?.status, response?.data);
    
    if (response?.status === 401 && !config._retry) {
      console.log('🔄 401 오류 - 토큰 갱신 시도');
      
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(config));
          });
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenStr = getRefreshToken();
        if (!refreshTokenStr) {
          throw new Error('Refresh token이 없습니다.');
        }

        const response = await apiClient.post('/auth/refresh', { 
          refreshToken: refreshTokenStr 
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        setToken(accessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }
        
        onRefreshed(accessToken);
        
        config.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(config);
      } catch (refreshError) {
        console.error('🔴 토큰 갱신 실패:', refreshError);
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 사용자 등록 (회원가입)
export const register = async (userData) => {
  try {
    console.log('📝 회원가입 요청:', userData);
    const response = await apiClient.post('/auth/register', userData);
    console.log('✅ 회원가입 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 회원가입 실패:', error);
    throw error;
  }
};

// 사용자 로그인
export const login = async (credentials) => {
  try {
    console.log('🔐 로그인 API 요청 시작:', credentials);
    
    const response = await apiClient.post('/auth/login', credentials);
    
    console.log('📨 서버 응답 상태:', response.status);
    console.log('📨 서버 응답 데이터:', response.data);
    
    // 응답 데이터 구조 확인
    const { accessToken, refreshToken, user } = response.data;
    
    console.log('🔑 AccessToken 확인:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL');
    console.log('🔄 RefreshToken 확인:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NULL');
    console.log('👤 User 확인:', user ? user.username : 'NULL');
    
    if (!accessToken) {
      throw new Error('서버에서 AccessToken을 받지 못했습니다.');
    }
    
    if (!refreshToken) {
      throw new Error('서버에서 RefreshToken을 받지 못했습니다.');
    }
    
    if (!user) {
      throw new Error('서버에서 사용자 정보를 받지 못했습니다.');
    }
    
    // 토큰들 저장
    setToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);
    
    console.log('✅ 로그인 처리 완료');
    
    return response.data;
  } catch (error) {
    console.error('❌ 로그인 API 실패:', error);
    console.error('❌ 에러 메시지:', error.message);
    console.error('❌ 응답 상태:', error.response?.status);
    console.error('❌ 응답 데이터:', error.response?.data);
    throw error;
  }
};

// 토큰 갱신
export const refreshToken = async () => {
  try {
    const refreshTokenStr = getRefreshToken();
    if (!refreshTokenStr) {
      throw new Error('Refresh token이 없습니다.');
    }

    const response = await apiClient.post('/auth/refresh', { 
      refreshToken: refreshTokenStr 
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    setToken(accessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }
    
    return accessToken;
  } catch (error) {
    console.error('❌ 토큰 갱신 실패:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    const refreshTokenStr = getRefreshToken();
    if (refreshTokenStr) {
      await apiClient.post('/auth/logout', { refreshToken: refreshTokenStr });
    }
    clearAuthData();
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error);
    // 서버 오류가 있어도 클라이언트 데이터는 정리
    clearAuthData();
  }
};

// 토큰 저장/조회/삭제 함수들
export const setToken = (token) => {
  localStorage.setItem('accessToken', token);
  console.log('💾 Access Token 저장됨');
};

export const getToken = () => {
  return localStorage.getItem('accessToken');
};

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
  console.log('💾 Refresh Token 저장됨');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  console.log('🗑️ 인증 데이터 삭제됨');
};

// 인증 헤더 설정
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 사용자가 로그인되어 있는지 확인
export const isAuthenticated = () => {
  const token = getToken();
  console.log('🔍 인증 상태 확인:', !!token);
  return !!token;
};

// 사용자 역할 확인
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// 사용자가 관리자인지 확인
export const isAdmin = () => {
  return hasRole('ROLE_ADMIN');
};

// 사용자가 관리자 회원인지 확인
export const isModerator = () => {
  return hasRole('ROLE_MODERATOR');
};

// 사용자가 특정 카테고리의 관리자 회원인지 확인
export const isModeratorForCategory = (categoryId) => {
  const user = getCurrentUser();
  return user && 
         user.role === 'ROLE_MODERATOR' && 
         user.managedCategoryIds && 
         user.managedCategoryIds.includes(Number(categoryId));
};

export default apiClient;