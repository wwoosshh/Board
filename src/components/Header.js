import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchCategories } from '../api/BoardApi';
import { isAuthenticated, getCurrentUser, logout, isAdmin, isModerator, isManager, isAdminOrAbove } from '../api/AuthApi';

// Styled Components 정의 (컴포넌트 함수 외부에서 정의)
const HeaderContainer = styled.header`
  background-color: #333;
  color: white;
  padding: 1rem;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavItem = styled(Link)`
  color: white;
  text-decoration: none;
  margin-left: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #444;
  }
`;

const NavButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  margin-left: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 16px;
  
  &:hover {
    background-color: #444;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 20px;
`;

const DropdownButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #444;
  }
`;

const DropdownMenu = styled.div`
  display: ${props => props.isopen ? 'block' : 'none'};
  position: absolute;
  background-color: #333;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
  right: 0;
`;

const DropdownItem = styled(Link)`
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #444;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
`;

const UserName = styled.span`
  margin-right: 10px;
`;

const RoleBadge = styled.span`
  background-color: ${props => {
    switch (props.role) {
      case 'ROLE_MANAGER': return '#9C27B0';
      case 'ROLE_ADMIN': return '#F44336';
      case 'ROLE_MODERATOR': return '#FF9800';
      default: return '#4CAF50';
    }
  }};
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  margin-left: 8px;
`;

// Header 컴포넌트
const Header = () => {
  const [categories, setCategories] = useState([]);
  const [boardDropdownOpen, setBoardDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  // 로그인 상태 및 사용자 정보
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('카테고리 로딩 중 오류 발생:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  const handleLogout = async () => {
    try {
      console.log('🚪 로그아웃 시작');
      await logout();
      console.log('✅ 로그아웃 완료');
      
      // 홈으로 이동
      navigate('/');
      
      // 상태 업데이트를 위해 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('❌ 로그아웃 중 오류:', error);
      // 오류가 발생해도 로컬 데이터는 정리
      window.location.href = '/';
    }
  };

  // 권한명을 한글로 변환
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ROLE_MANAGER': return '매니저';
      case 'ROLE_ADMIN': return '관리자';
      case 'ROLE_MODERATOR': return '관리자회원';
      case 'ROLE_USER': return '일반회원';
      default: return '일반회원';
    }
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">게시판 홈</Logo>
        <Nav>
          <DropdownContainer>
            <DropdownButton onClick={() => setBoardDropdownOpen(!boardDropdownOpen)}>
              게시판 목록 ▼
            </DropdownButton>
            <DropdownMenu isopen={boardDropdownOpen}>
              {categories.map(category => (
                <DropdownItem 
                  key={category.id} 
                  to={`/category/${category.id}`}
                  onClick={() => setBoardDropdownOpen(false)}
                >
                  {category.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>
          
          {authenticated ? (
            <NavItem to="/write">글쓰기</NavItem>
          ) : (
            <NavItem to="/login" onClick={() => alert('로그인이 필요합니다.')}>글쓰기</NavItem>
          )}
          
          {/* 권한별 관리 메뉴 */}
          {authenticated && currentUser && (
            <>
              {/* 매니저 메뉴 (최고 권한) */}
              {currentUser.role === 'ROLE_MANAGER' && (
                <NavItem to="/manager">매니저</NavItem>
              )}
              
              {/* 관리자 메뉴 (매니저가 아닌 관리자만) */}
              {currentUser.role === 'ROLE_ADMIN' && (
                <NavItem to="/admin">관리자</NavItem>
              )}
            </>
          )}
          
          {/* 인증 상태에 따른 메뉴 */}
          {authenticated && currentUser ? (
            <UserInfo>
              <UserName>
                {currentUser.username}
                <RoleBadge role={currentUser.role}>
                  {getRoleDisplayName(currentUser.role)}
                </RoleBadge>
              </UserName>
              <DropdownContainer>
                <DropdownButton onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                  ▼
                </DropdownButton>
                <DropdownMenu isopen={userDropdownOpen}>
                  <DropdownItem 
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    내 프로필
                  </DropdownItem>
                  <DropdownItem 
                    to="/"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    로그아웃
                  </DropdownItem>
                </DropdownMenu>
              </DropdownContainer>
            </UserInfo>
          ) : (
            <>
              <NavItem to="/login">로그인</NavItem>
              <NavItem to="/register">회원가입</NavItem>
            </>
          )}
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;