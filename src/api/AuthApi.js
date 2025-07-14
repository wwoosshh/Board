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
  console.log('🔴 토큰 만료 처리:', message);
  
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
        console.log('🔄 토큰 만료 감지 - 자동 갱신 시도');
        
        try {
          const newToken = await refreshTokenSilently();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            console.log('✅ 토큰 자동 갱신 성공');
          } else {
            throw new Error('토큰 갱신 실패');
          }
        } catch (error) {
          console.error('❌ 토큰 자동 갱신 실패:', error);
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
        handleTokenExpiration('인증이 만료되었습니다. 다시 로그인해주세요.');
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
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    setToken(accessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }
    
    return accessToken;
  } catch (error) {
    console.error('❌ 자동 토큰 갱신 실패:', error);
    return null;
  }
};

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
    
    // 자동 토큰 갱신 타이머 시작
    startTokenRefreshTimer();
    
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
    
    // 자동 토큰 갱신 타이머 재시작
    startTokenRefreshTimer();
    
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
    stopTokenRefreshTimer();
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error);
    // 서버 오류가 있어도 클라이언트 데이터는 정리
    clearAuthData();
    stopTokenRefreshTimer();
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

// 사용자가 관리자인지 확인
export const isAdmin = () => {
  return hasRole('ROLE_ADMIN');
};

// 사용자가 관리자 회원인지 확인
export const isModerator = () => {
  return hasRole('ROLE_MODERATOR');
};

// 사용자가 매니저인지 확인
export const isManager = () => {
  return hasRole('ROLE_MANAGER');
};

// 사용자가 관리자 이상 권한인지 확인 (관리자 또는 매니저)
export const isAdminOrAbove = () => {
  return hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER');
};

// 사용자가 관리자회원 이상 권한인지 확인 (관리자회원, 관리자, 매니저)
export const isModeratorOrAbove = () => {
  return hasRole('ROLE_MODERATOR') || hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER');
};

// 사용자가 특정 카테고리의 관리자 회원인지 확인
export const isModeratorForCategory = (categoryId) => {
  const user = getCurrentUser();
  return user && 
         user.role === 'ROLE_MODERATOR' && 
         user.managedCategoryIds && 
         user.managedCategoryIds.includes(Number(categoryId));
};

// 권한 레벨 확인 (숫자로 반환)
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

// 권한명을 한글로 변환
export const getRoleDisplayName = (role) => {
  switch (role) {
    case 'ROLE_MANAGER': return '매니저';
    case 'ROLE_ADMIN': return '관리자';
    case 'ROLE_MODERATOR': return '관리자회원';
    case 'ROLE_USER': return '일반회원';
    default: return '알 수 없음';
  }
};

// 토큰 상태 확인 (디버깅용)
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
      console.log('⏰ 자동 토큰 갱신 시작');
      try {
        await refreshToken();
        console.log('✅ 자동 토큰 갱신 완료');
      } catch (error) {
        console.error('❌ 자동 토큰 갱신 실패:', error);
        handleTokenExpiration('세션 갱신에 실패했습니다. 다시 로그인해주세요.');
      }
    }, refreshTime);
    
    console.log(`⏰ 토큰 자동 갱신 타이머 설정: ${Math.floor(refreshTime / 1000 / 60)}분 후`);
  }
};

const stopTokenRefreshTimer = () => {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
    console.log('⏰ 토큰 갱신 타이머 정지');
  }
};

// 앱 시작 시 토큰 상태 확인
export const initializeAuth = async () => {
  const token = getToken();
  if (!token) {
    console.log('🔍 초기화: 토큰 없음');
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.log('🔄 초기화: 토큰 만료 - 자동 갱신 시도');
    try {
      await refreshTokenSilently();
      startTokenRefreshTimer();
      console.log('✅ 초기화: 토큰 갱신 성공');
      return true;
    } catch (error) {
      console.error('❌ 초기화: 토큰 갱신 실패');
      clearAuthData();
      return false;
    }
  } else {
    console.log('✅ 초기화: 토큰 유효');
    startTokenRefreshTimer();
    return true;
  }
};

export default apiClient;