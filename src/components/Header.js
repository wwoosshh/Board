import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchCategories } from '../api/BoardApi';
import { isAuthenticated, getCurrentUser, logout, isAdmin, isModerator, isManager, isAdminOrAbove } from '../api/AuthApi';

// 현대적인 색상 팔레트
const colors = {
  primary: '#4263eb',
  primaryDark: '#364fc7',
  secondary: '#495057',
  accent: '#f59f00',
  success: '#51cf66',
  danger: '#ff6b6b',
  warning: '#ffd43b',
  light: '#f8f9fa',
  dark: '#212529',
  border: '#e9ecef',
  shadow: 'rgba(0, 0, 0, 0.1)',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  cardBg: '#ffffff'
};

// Styled Components 정의
const HeaderContainer = styled.header`
  background: ${colors.gradient};
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px ${colors.shadow};
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:before {
    content: '📝';
    margin-right: 8px;
    font-size: 24px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavItem = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    
    &:before {
      left: 100%;
    }
  }
`;

const NavButton = styled.button`
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:after {
    content: '▼';
    font-size: 12px;
    transition: transform 0.3s ease;
  }
  
  ${props => props.$isOpen && `
    &:after {
      transform: rotate(180deg);
    }
  `}
`;

const DropdownMenu = styled.div`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: absolute;
  background: white;
  min-width: 200px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-radius: 12px;
  right: 0;
  top: calc(100% + 8px);
  border: 1px solid ${colors.border};
  overflow: hidden;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled(Link)`
  color: ${colors.dark};
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  transition: all 0.3s ease;
  font-weight: 500;
  border-bottom: 1px solid ${colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${colors.primary};
    color: white;
    transform: translateX(4px);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 14px;
`;

const UserName = styled.span`
  color: white;
  font-weight: 500;
  font-size: 14px;
`;

const RoleBadge = styled.span`
  background: ${props => {
    switch (props.$role) {
      case 'ROLE_MANAGER': return colors.danger;
      case 'ROLE_ADMIN': return colors.warning;
      case 'ROLE_MODERATOR': return colors.success;
      default: return colors.primary;
    }
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNav = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 20px ${colors.shadow};
    border-radius: 0 0 12px 12px;
    padding: 20px;
  }
`;

// Header 컴포넌트
const Header = () => {
  const [categories, setCategories] = useState([]);
  const [boardDropdownOpen, setBoardDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = (user) => {
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">CONNECT v_1.0.4</Logo>
        
        <Nav style={{ display: window.innerWidth <= 768 ? 'none' : 'flex' }}>
          <DropdownContainer>
            <DropdownButton 
              onClick={() => setBoardDropdownOpen(!boardDropdownOpen)}
              $isOpen={boardDropdownOpen}
            >
              📋 게시판
            </DropdownButton>
            <DropdownMenu $isOpen={boardDropdownOpen}>
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
            <NavItem to="/write">✍️ 글쓰기</NavItem>
          ) : (
            <NavItem to="/login" onClick={() => alert('로그인이 필요합니다.')}>✍️ 글쓰기</NavItem>
          )}
          
          {/* 권한별 관리 메뉴 */}
          {authenticated && currentUser && (
            <>
              {/* 매니저 메뉴 (최고 권한) */}
              {currentUser.role === 'ROLE_MANAGER' && (
                <NavItem to="/manager">👑 매니저</NavItem>
              )}
              
              {/* 관리자 메뉴 (매니저가 아닌 관리자만) */}
              {currentUser.role === 'ROLE_ADMIN' && (
                <NavItem to="/admin">🔑 관리자</NavItem>
              )}
            </>
          )}
          
          {/* 인증 상태에 따른 메뉴 */}
          {authenticated && currentUser ? (
            <UserInfo>
              <UserCard>
                <UserAvatar>{getUserInitial(currentUser)}</UserAvatar>
                <div>
                  <UserName>{currentUser.username}</UserName>
                  <RoleBadge $role={currentUser.role}>
                    {getRoleDisplayName(currentUser.role)}
                  </RoleBadge>
                </div>
              </UserCard>
              <DropdownContainer>
                <DropdownButton 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  $isOpen={userDropdownOpen}
                >
                  ⚙️
                </DropdownButton>
                <DropdownMenu $isOpen={userDropdownOpen}>
                  <DropdownItem 
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    👤 내 프로필
                  </DropdownItem>
                  <DropdownItem 
                    to="/"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    🚪 로그아웃
                  </DropdownItem>
                </DropdownMenu>
              </DropdownContainer>
            </UserInfo>
          ) : (
            <>
              <NavButton as={Link} to="/login">로그인</NavButton>
              <NavButton as={Link} to="/register">회원가입</NavButton>
            </>
          )}
        </Nav>

        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </MobileMenuButton>
      </HeaderContent>
      
      <MobileNav $isOpen={mobileMenuOpen}>
        {/* 모바일 메뉴 내용 */}
        {categories.map(category => (
          <div key={category.id} style={{ padding: '8px 0' }}>
            <Link 
              to={`/category/${category.id}`}
              style={{ color: colors.dark, textDecoration: 'none' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {category.name}
            </Link>
          </div>
        ))}
      </MobileNav>
    </HeaderContainer>
  );
};

export default Header;