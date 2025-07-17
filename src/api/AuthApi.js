// src/api/AuthApi.js (서버 연결 상태 감지 향상)
import axios from 'axios';

// 🌐 HTTP로 다시 변경 (HTTPS 대신)
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  
  : 'http://localhost:5159/api';
console.log('🌐 현재 BASE_URL:', BASE_URL);

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10초 타임아웃
});

// 서버 연결 상태 전역 변수
let isServerConnected = true;
let serverConnectionCallbacks = [];

// 서버 연결 상태 변경 시 호출될 콜백 등록
export const onServerConnectionChange = (callback) => {
  serverConnectionCallbacks.push(callback);
  return () => {
    serverConnectionCallbacks = serverConnectionCallbacks.filter(cb => cb !== callback);
  };
};

// 서버 연결 상태 알림
const notifyServerConnectionChange = (connected, error = null) => {
  const wasConnected = isServerConnected;
  isServerConnected = connected;
  
  if (wasConnected !== connected) {
    serverConnectionCallbacks.forEach(callback => {
      try {
        callback(connected, error);
      } catch (err) {
        console.error('서버 연결 상태 콜백 오류:', err);
      }
    });
  }
};

// 서버 연결 오류 감지 함수
const detectServerConnectionError = (error) => {
  if (!error) return false;
  
  // 네트워크 오류 패턴들
  const networkErrorPatterns = [
    'Network Error',
    'ECONNREFUSED',
    'ENOTFOUND', 
    'ETIMEDOUT',
    'ECONNRESET',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED'
  ];
  
  // 오류 메시지 체크
  const errorMessage = error.message || '';
  const isNetworkError = networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern)
  );
  
  // 오류 코드 체크
  const errorCode = error.code || '';
  const isConnectionError = networkErrorPatterns.some(pattern => 
    errorCode.includes(pattern)
  );
  
  // 타임아웃 체크
  const isTimeout = error.code === 'ECONNABORTED' || errorMessage.includes('timeout');
  
  // 서버 응답이 아예 없는 경우
  const noResponse = !error.response;
  
  return isNetworkError || isConnectionError || isTimeout || noResponse;
};

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

// JWT 토큰 디코딩 (만료 시간 확인용)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 오류:', error);
    return null;
  }
};

// 토큰 만료 확인
const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  const bufferTime = 60; // 1분 버퍼
  
  return decoded.exp < (currentTime + bufferTime);
};

// 토큰 만료까지 남은 시간 (분)
const getTokenRemainingTime = (token) => {
  if (!token) return 0;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return 0;
  
  const currentTime = Date.now() / 1000;
  const remainingSeconds = decoded.exp - currentTime;
  
  return Math.max(0, Math.floor(remainingSeconds / 60));
};

// 자동 로그아웃 및 알림
const handleTokenExpiration = (message = '로그인이 만료되었습니다. 다시 로그인해주세요.') => {
  // 토큰 정리
  clearAuthData();
  
  // 사용자에게 알림
  if (window.showTokenExpiredNotification) {
    window.showTokenExpiredNotification(message);
  } else {
    alert(message);
  }
  
  // 3초 후 로그인 페이지로 이동
  setTimeout(() => {
    window.location.href = '/login';
  }, 3000);
};

// 요청 인터셉터 - Authorization 헤더 추가 및 토큰 체크
apiClient.interceptors.request.use(
  async (config) => {
    // 인증이 필요없는 경로는 건너뛰기
    if (config.url.includes('/auth/')) {
      return config;
    }
    
    const token = getToken();
    
    if (token) {
      // 토큰 만료 체크
      if (isTokenExpired(token)) {
        try {
          const newToken = await refreshTokenSilently();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            throw new Error('토큰 갱신 실패');
          }
        } catch (error) {
          // 서버 연결 오류인지 확인
          if (detectServerConnectionError(error)) {
            notifyServerConnectionChange(false, error);
            return Promise.reject(error);
          }
          
          handleTokenExpiration('세션이 만료되었습니다. 다시 로그인해주세요.');
          return Promise.reject(error);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 갱신 및 서버 연결 상태 감지
apiClient.interceptors.response.use(
  (response) => {
    // 성공적인 응답이면 서버 연결 상태 업데이트
    notifyServerConnectionChange(true);
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // 서버 연결 오류 감지
    if (detectServerConnectionError(error)) {
      notifyServerConnectionChange(false, error);
      return Promise.reject(error);
    }
    
    // 서버 연결은 되지만 5xx 오류인 경우
    if (response?.status >= 500) {
      notifyServerConnectionChange(true); // 연결은 되지만 서버 오류
    }
    
    if (response?.status === 401 && !config._retry) {
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
        // 토큰 갱신도 서버 연결 오류인지 확인
        if (detectServerConnectionError(refreshError)) {
          notifyServerConnectionChange(false, refreshError);
        } else {
          handleTokenExpiration('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 자동 토큰 갱신 (요청 전 호출)
const refreshTokenSilently = async () => {
  try {
    const refreshTokenStr = getRefreshToken();
    if (!refreshTokenStr) {
      throw new Error('Refresh token이 없습니다.');
    }

    const response = await axios.post(`${BASE_URL}/auth/refresh`, { 
      refreshToken: refreshTokenStr 
    }, {
      timeout: 5000 // 토큰 갱신은 짧은 타임아웃
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    setToken(accessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }
    
    return accessToken;
  } catch (error) {
    return null;
  }
};

// 나머지 함수들은 기존과 동일하게 유지...
// (register, login, refreshToken, logout, setToken, getToken 등)

// 사용자 등록 (회원가입)
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    // 서버 연결 오류인지 확인
    if (detectServerConnectionError(error)) {
      notifyServerConnectionChange(false, error);
    }
    
    throw error;
  }
};

// 사용자 로그인
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    // 응답 데이터 구조 확인
    const { accessToken, refreshToken, user } = response.data;
    
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
    
    // 자동 토큰 갱신 타이머 시작
    startTokenRefreshTimer();
    
    // 서버 연결 상태 업데이트
    notifyServerConnectionChange(true);
    
    return response.data;
  } catch (error) {
    // 서버 연결 오류인지 확인
    if (detectServerConnectionError(error)) {
      notifyServerConnectionChange(false, error);
    }
    
    throw error;
  }
};

// 기존의 다른 함수들도 유지 (토큰 관리, 권한 체크 등)
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

// 사용자가 로그인되어 있는지 확인 (토큰 유효성 포함)
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // 토큰이 만료되었으면 false 반환
  if (isTokenExpired(token)) {
    console.log('🔴 토큰 만료됨 - 인증 실패');
    return false;
  }
  
  return true;
};

// 사용자 역할 확인
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// 권한 체크 함수들
export const isAdmin = () => hasRole('ROLE_ADMIN');
export const isModerator = () => hasRole('ROLE_MODERATOR');
export const isManager = () => hasRole('ROLE_MANAGER');
export const isAdminOrAbove = () => hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER');
export const isModeratorOrAbove = () => hasRole('ROLE_MODERATOR') || hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER');

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
    
    // 자동 토큰 갱신 타이머 재시작
    startTokenRefreshTimer();
    
    return accessToken;
  } catch (error) {
    console.error('❌ 토큰 갱신 실패:', error);
    
    // 서버 연결 오류인지 확인
    if (detectServerConnectionError(error)) {
      notifyServerConnectionChange(false, error);
    }
    
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
    stopTokenRefreshTimer();
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error);
    // 서버 오류가 있어도 클라이언트 데이터는 정리
    clearAuthData();
    stopTokenRefreshTimer();
  }
};

// 자동 토큰 갱신 타이머
let tokenRefreshTimer = null;

const startTokenRefreshTimer = () => {
  stopTokenRefreshTimer(); // 기존 타이머 정리
  
  const token = getToken();
  if (!token) return;
  
  const remainingTime = getTokenRemainingTime(token);
  
  if (remainingTime > 5) {
    // 만료 5분 전에 갱신
    const refreshTime = (remainingTime - 5) * 60 * 1000;
    
    tokenRefreshTimer = setTimeout(async () => {
      try {
        await refreshToken();
      } catch (error) {
        // 서버 연결 오류가 아닌 경우에만 로그아웃 처리
        if (!detectServerConnectionError(error)) {
          handleTokenExpiration('세션 갱신에 실패했습니다. 다시 로그인해주세요.');
        }
      }
    }, refreshTime);
  }
};

const stopTokenRefreshTimer = () => {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
};

// 앱 시작 시 토큰 상태 확인
export const initializeAuth = async () => {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    try {
      await refreshTokenSilently();
      startTokenRefreshTimer();
      return true;
    } catch (error) {
      // 서버 연결 오류가 아닌 경우에만 데이터 삭제
      if (!detectServerConnectionError(error)) {
        clearAuthData();
      }
      return false;
    }
  } else {
    startTokenRefreshTimer();
    return true;
  }
};

// 나머지 유틸리티 함수들...
export const isModeratorForCategory = (categoryId) => {
  const user = getCurrentUser();
  return user && 
         user.role === 'ROLE_MODERATOR' && 
         user.managedCategoryIds && 
         user.managedCategoryIds.includes(Number(categoryId));
};

export const getUserLevel = () => {
  const user = getCurrentUser();
  if (!user) return 0;
  
  switch (user.role) {
    case 'ROLE_MANAGER': return 4;
    case 'ROLE_ADMIN': return 3;
    case 'ROLE_MODERATOR': return 2;
    case 'ROLE_USER': return 1;
    default: return 0;
  }
};

export const getRoleDisplayName = (role) => {
  switch (role) {
    case 'ROLE_MANAGER': return '매니저';
    case 'ROLE_ADMIN': return '관리자';
    case 'ROLE_MODERATOR': return '관리자회원';
    case 'ROLE_USER': return '일반회원';
    default: return '알 수 없음';
  }
};

export const getTokenStatus = () => {
  const token = getToken();
  if (!token) return { valid: false, message: '토큰 없음' };
  
  const remainingTime = getTokenRemainingTime(token);
  const expired = isTokenExpired(token);
  
  return {
    valid: !expired,
    remainingTime,
    message: expired ? '토큰 만료됨' : `${remainingTime}분 남음`
  };
};

export default apiClient;