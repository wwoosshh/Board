// src/api/ServerHealthApi.js
import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  
  : 'http://localhost:5159/api';

// 서버 상태 체크용 axios 인스턴스 (타임아웃 짧게 설정)
const healthCheckClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5초 타임아웃
});

// 서버 헬스체크 함수
export const checkServerHealth = async () => {
  // 여러 엔드포인트를 순서대로 시도
  const endpoints = [
    '/auth/test',     // 기존에 잘 작동하는 엔드포인트
    '/health',        // 새로 만든 헬스체크 엔드포인트
    '/ping'           // 간단한 ping 엔드포인트
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await healthCheckClient.get(endpoint, {
        timeout: 5000 // 5초 타임아웃
      });
      
      // 성공적인 응답 처리
      const serverData = response.data || {};
      let status = 'online';
      let message = '서버가 정상적으로 동작 중입니다.';
      
      // 서버 상태에 따른 분류
      if (serverData.status === 'MAINTENANCE') {
        status = 'maintenance';
        message = serverData.message || '시스템 점검 중입니다.';
      } else if (serverData.status === 'UP' || serverData.status === 'pong' || response.status === 200) {
        status = 'online';
        message = serverData.message || '서버가 정상적으로 동작 중입니다.';
      }
      
      return {
        isOnline: true,
        status,
        message,
        endpoint: endpoint,
        serverInfo: {
          version: serverData.version,
          uptime: serverData.uptime,
          timestamp: serverData.timestamp,
          server: serverData.server
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      // 503 상태 코드는 점검 중 (즉시 반환)
      if (error.response?.status === 503) {
        return {
          isOnline: false,
          status: 'maintenance',
          message: error.response?.data?.message || '시스템 점검 중입니다.',
          error: error.message,
          httpStatus: error.response?.status,
          endpoint: endpoint,
          timestamp: new Date().toISOString()
        };
      }
      
      // 마지막 엔드포인트까지 실패한 경우에만 에러 반환
      if (endpoint === endpoints[endpoints.length - 1]) {
        // 에러 타입에 따른 상세 분석
        let status = 'offline';
        let message = '서버에 연결할 수 없습니다.';
        
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          status = 'down';
          message = '서버가 실행되지 않고 있습니다.';
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
          status = 'timeout';
          message = '서버 응답 시간이 초과되었습니다.';
        } else if (error.response?.status >= 500) {
          status = 'error';
          message = '서버에 오류가 발생했습니다.';
        } else if (error.response?.status >= 400) {
          status = 'client_error';
          message = '클라이언트 요청에 문제가 있습니다.';
        }
        
        return {
          isOnline: false,
          status,
          message,
          error: error.message,
          httpStatus: error.response?.status,
          endpoint: endpoint,
          allEndpointsFailed: true,
          timestamp: new Date().toISOString()
        };
      }
    }
  }
  
  // 모든 엔드포인트 실패 (여기까지 오면 안 되지만 안전장치)
  return {
    isOnline: false,
    status: 'unknown',
    message: '서버 상태를 확인할 수 없습니다.',
    timestamp: new Date().toISOString()
  };
};

// 주기적으로 서버 상태를 체크하는 함수
export const startServerHealthMonitoring = (onStatusChange, intervalMs = 30000) => {
  let intervalId;
  
  const checkAndNotify = async () => {
    const healthStatus = await checkServerHealth();
    onStatusChange(healthStatus);
  };
  
  // 즉시 한 번 체크
  checkAndNotify();
  
  // 주기적으로 체크
  intervalId = setInterval(checkAndNotify, intervalMs);
  
  // 정리 함수 반환
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

// 서버 재연결 시도 함수
export const attemptServerReconnection = async (maxAttempts = 3, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const healthStatus = await checkServerHealth();
    
    if (healthStatus.isOnline) {
      return healthStatus;
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 1.5; // 지수 백오프
    }
  }
  
  return { isOnline: false, status: 'failed_reconnection' };
};