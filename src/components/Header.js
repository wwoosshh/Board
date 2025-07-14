import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchCategories } from '../api/BoardApi';
import { isAuthenticated, getCurrentUser, logout, isAdmin, isModerator } from '../api/AuthApi';

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
  display: ${props => props["data-isopen"] ? 'block' : 'none'};
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
  
  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload(); // 페이지 새로고침하여 인증 상태 업데이트
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
            <DropdownMenu data-isopen={boardDropdownOpen}>
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
          
          {/* 관리자 메뉴 */}
          {isAdmin() && (
            <NavItem to="/admin">관리자</NavItem>
          )}
          
          {/* 인증 상태에 따른 메뉴 */}
          {authenticated ? (
            <UserInfo>
              <UserName>{currentUser.username}</UserName>
              <DropdownContainer>
                <DropdownButton onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                  ▼
                </DropdownButton>
                <DropdownMenu data-isopen={userDropdownOpen}>
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