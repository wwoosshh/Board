import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BoardList from './components/BoardList';
import BoardDetail from './components/BoardDetail';
import BoardForm from './components/BoardForm';
import Login from './components/Login';
import Register from './components/Register';
import { isAuthenticated } from './api/AuthApi';
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

// 인증이 필요한 라우트를 위한 컴포넌트
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
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