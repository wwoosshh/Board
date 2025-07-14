// src/components/DebugHealthCheck.js
import React, { useState } from 'react';
import { checkServerHealth } from '../api/ServerHealthApi';
import styled from 'styled-components';

const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 10000;
  font-family: 'Courier New', monospace;
  font-size: 12px;
`;

const DebugTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #007bff;
  font-size: 14px;
`;

const DebugButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin: 2px;
  font-size: 11px;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const DebugResult = styled.pre`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-size: 10px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin: 2px;
  
  &.online { background: #d4edda; color: #155724; }
  &.offline { background: #f8d7da; color: #721c24; }
  &.testing { background: #fff3cd; color: #856404; }
`;

const DebugHealthCheck = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState([]);

  // 서버 상태 테스트
  const testServerHealth = async () => {
    setIsTesting(true);
    try {
      const result = await checkServerHealth();
      const timestamp = new Date().toLocaleTimeString();
      
      setResults(prev => [{
        timestamp,
        result,
        success: result.isOnline
      }, ...prev.slice(0, 4)]); // 최대 5개 결과 보관
      
    } catch (error) {
      const timestamp = new Date().toLocaleTimeString();
      setResults(prev => [{
        timestamp,
        error: error.message,
        success: false
      }, ...prev.slice(0, 4)]);
    } finally {
      setIsTesting(false);
    }
  };

  // 직접 API 테스트
  const testDirectAPI = async (endpoint) => {
    setIsTesting(true);
    try {
      const baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5159/api';
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.text();
      const timestamp = new Date().toLocaleTimeString();
      
      setResults(prev => [{
        timestamp,
        endpoint,
        status: response.status,
        statusText: response.statusText,
        data: data.length > 200 ? data.substring(0, 200) + '...' : data,
        success: response.ok
      }, ...prev.slice(0, 4)]);
      
    } catch (error) {
      const timestamp = new Date().toLocaleTimeString();
      setResults(prev => [{
        timestamp,
        endpoint,
        error: error.message,
        success: false
      }, ...prev.slice(0, 4)]);
    } finally {
      setIsTesting(false);
    }
  };

  // 네트워크 정보 확인
  const checkNetworkInfo = () => {
    const timestamp = new Date().toLocaleTimeString();
    const info = {
      userAgent: navigator.userAgent,
      onLine: navigator.onLine,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'N/A',
      baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5159/api',
      environment: process.env.NODE_ENV,
      currentURL: window.location.href
    };
    
    setResults(prev => [{
      timestamp,
      networkInfo: info,
      success: true
    }, ...prev.slice(0, 4)]);
  };

  if (!isVisible) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#007bff',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 10000
        }}
        onClick={() => setIsVisible(true)}
      >
        🔧 Debug
      </div>
    );
  }

  return (
    <DebugContainer>
      <DebugTitle>
        🔧 서버 상태 디버그
        <button
          style={{
            float: 'right',
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </DebugTitle>
      
      <div>
        <DebugButton onClick={testServerHealth} disabled={isTesting}>
          🏥 헬스체크 테스트
        </DebugButton>
        <DebugButton onClick={() => testDirectAPI('/auth/test')} disabled={isTesting}>
          🔐 Auth Test
        </DebugButton>
        <DebugButton onClick={() => testDirectAPI('/health')} disabled={isTesting}>
          ❤️ Health API
        </DebugButton>
        <DebugButton onClick={() => testDirectAPI('/ping')} disabled={isTesting}>
          🏓 Ping
        </DebugButton>
        <DebugButton onClick={checkNetworkInfo} disabled={isTesting}>
          🌐 네트워크 정보
        </DebugButton>
        <DebugButton onClick={() => setResults([])} disabled={isTesting}>
          🗑️ 클리어
        </DebugButton>
      </div>

      {isTesting && (
        <StatusBadge className="testing">
          테스트 중...
        </StatusBadge>
      )}

      <div style={{ marginTop: '10px' }}>
        {results.map((result, index) => (
          <DebugResult key={index}>
            <StatusBadge className={result.success ? 'online' : 'offline'}>
              {result.timestamp}
            </StatusBadge>
            
            {result.endpoint && <div><strong>Endpoint:</strong> {result.endpoint}</div>}
            {result.status && <div><strong>Status:</strong> {result.status} {result.statusText}</div>}
            {result.error && <div><strong>Error:</strong> {result.error}</div>}
            {result.data && <div><strong>Data:</strong> {result.data}</div>}
            {result.networkInfo && (
              <div>
                <strong>Network Info:</strong>
                <div>Online: {result.networkInfo.onLine ? 'Yes' : 'No'}</div>
                <div>Base URL: {result.networkInfo.baseURL}</div>
                <div>Environment: {result.networkInfo.environment}</div>
                {result.networkInfo.connection !== 'N/A' && (
                  <div>Connection: {result.networkInfo.connection.effectiveType}</div>
                )}
              </div>
            )}
            {result.result && (
              <div>
                <strong>Health Result:</strong>
                <div>Online: {result.result.isOnline ? 'Yes' : 'No'}</div>
                <div>Status: {result.result.status}</div>
                <div>Message: {result.result.message}</div>
                {result.result.endpoint && <div>Endpoint Used: {result.result.endpoint}</div>}
                {result.result.error && <div>Error: {result.result.error}</div>}
              </div>
            )}
          </DebugResult>
        ))}
      </div>
    </DebugContainer>
  );
};

export default DebugHealthCheck;