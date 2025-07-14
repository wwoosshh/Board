// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BoardList from './components/BoardList';
import BoardDetail from './components/BoardDetail';
import BoardForm from './components/BoardForm';
import Login from './components/Login';
import Register from './components/Register';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ServerNotice from './components/ServerNotice';
import { isAuthenticated, isManager, isAdminOrAbove, initializeAuth } from './api/AuthApi';
import { checkServerHealth, startServerHealthMonitoring } from './api/ServerHealthApi';
import styled from 'styled-components';

const AppContainer = styled.div`
  font-family: 'Noto Sans KR', Arial, sans-serif;
  color: #333;
`;

const Main = styled.main`
  min-height: calc(100vh - 180px);
`;

const Footer = styled.footer`
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
  margin-top: 2rem;
  border-top: 1px solid #ddd;
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-right: 15px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 인증이 필요한 라우트를 위한 컴포넌트
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// 매니저 전용 라우트를 위한 컴포넌트
const ManagerRoute = ({ children }) => {
  return isAuthenticated() && isManager() ? children : <Navigate to="/login" />;
};

// 관리자 이상 권한 라우트를 위한 컴포넌트
const AdminRoute = ({ children }) => {
  return isAuthenticated() && isAdminOrAbove() ? children : <Navigate to="/login" />;
};

function App() {
  const [serverStatus, setServerStatus] = useState(null);
  const [showServerNotice, setShowServerNotice] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [healthMonitorCleanup, setHealthMonitorCleanup] = useState(null);

  // 앱 초기화 및 서버 상태 체크
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 앱 초기화 시작...');
      
      try {
        // 1. 서버 상태 먼저 체크
        const healthStatus = await checkServerHealth();
        setServerStatus(healthStatus);
        
        if (!healthStatus.isOnline) {
          console.log('❌ 서버 연결 실패 - 공지사항 표시');
          setShowServerNotice(true);
          setIsInitializing(false);
          return;
        }
        
        // 2. 서버가 온라인이면 인증 상태 초기화
        await initializeAuth();
        
        // 3. 서버 상태 모니터링 시작
        const cleanup = startServerHealthMonitoring(
          (status) => {
            setServerStatus(status);
            
            // 서버가 다운되면 공지사항 표시
            if (!status.isOnline && !showServerNotice) {
              setShowServerNotice(true);
            }
            
            // 서버가 복구되면 공지사항 숨김
            if (status.isOnline && showServerNotice) {
              setShowServerNotice(false);
            }
          },
          60000 // 60초마다 체크
        );
        
        setHealthMonitorCleanup(() => cleanup);
        
      } catch (error) {
        console.error('❌ 앱 초기화 실패:', error);
        // 초기화 실패 시에도 일단 앱은 실행
        setServerStatus({
          isOnline: true,
          status: 'initialization_failed',
          message: '앱 초기화에 실패했지만 계속 진행합니다.'
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    // 컴포넌트 언마운트 시 모니터링 정리
    return () => {
      if (healthMonitorCleanup) {
        healthMonitorCleanup();
      }
    };
  }, []);

  // 서버 재연결 시도 핸들러
  const handleServerRetry = async () => {
    setIsInitializing(true);
    
    const healthStatus = await checkServerHealth();
    setServerStatus(healthStatus);
    
    if (healthStatus.isOnline) {
      setShowServerNotice(false);
      
      // 인증 상태 다시 초기화
      try {
        await initializeAuth();
      } catch (error) {
        console.error('인증 초기화 실패:', error);
      }
    }
    
    setIsInitializing(false);
  };

  // 공지사항 닫기 핸들러 (비상용)
  const handleDismissNotice = () => {
    setShowServerNotice(false);
  };

  // 서버 공지사항이 표시되어야 하는 경우
  if (showServerNotice && serverStatus && !serverStatus.isOnline) {
    return (
      <ServerNotice 
        serverStatus={serverStatus}
        onRetry={handleServerRetry}
        onDismiss={handleDismissNotice}
      />
    );
  }

  // 앱 초기화 중인 경우
  if (isInitializing) {
    return (
      <LoadingScreen>
        <LoadingSpinner />
        <div>
          <div>시스템 초기화 중...</div>
          <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
            서버 연결 및 인증 상태를 확인하고 있습니다.
          </div>
        </div>
      </LoadingScreen>
    );
  }

  // 정상적인 앱 렌더링
  return (
    <Router>
      <AppContainer>
        <Header />
        
        <Main>
          <Routes>
            {/* 홈 경로: 모든 게시글 목록 */}
            <Route path="/" element={<BoardList />} />
            
            {/* 카테고리별 게시글 목록 */}
            <Route path="/category/:categoryId" element={<BoardList />} />
            
            {/* 게시글 상세 */}
            <Route path="/post/:id" element={<BoardDetail />} />
            
            {/* 인증 관련 경로 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 매니저 전용 경로 */}
            <Route 
              path="/manager/*" 
              element={
                <ManagerRoute>
                  <ManagerDashboard />
                </ManagerRoute>
              } 
            />
            
            {/* 관리자 이상 권한 경로 */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* 인증이 필요한 경로 */}
            <Route 
              path="/write" 
              element={
                <PrivateRoute>
                  <BoardForm />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/write/:categoryId" 
              element={
                <PrivateRoute>
                  <BoardForm />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/edit/:id" 
              element={
                <PrivateRoute>
                  <BoardForm />
                </PrivateRoute>
              } 
            />
            
            {/* 404 페이지 */}
            <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
          </Routes>
        </Main>
        
        <Footer>
          <p>© 2025 게시판 애플리케이션. All rights reserved.</p>
        </Footer>
      </AppContainer>
    </Router>
  );
}

export default App;