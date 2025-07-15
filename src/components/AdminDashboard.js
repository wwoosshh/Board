import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import * as AdminApi from '../api/AdminApi';
import { getRoleDisplayName, getCurrentUser } from '../api/AuthApi';

// 색상 팔레트
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

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
  background: ${colors.light};
  min-height: calc(100vh - 70px);
`;

const DashboardHeader = styled.div`
  background: ${colors.cardBg};
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px ${colors.shadow};
  border: 1px solid ${colors.border};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(135deg, #ffd43b 0%, #f59f00 100%);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 300px;
`;

const Title = styled.h1`
  font-size: 36px;
  color: ${colors.dark};
  margin: 0 0 12px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  &:before {
    content: '🔑';
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  color: ${colors.secondary};
  font-size: 18px;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const AdminBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #ffd43b 0%, #f59f00 100%);
  color: ${colors.dark};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(245, 159, 0, 0.3);
`;

const AdminInfo = styled.div`
  background: linear-gradient(135deg, rgba(245, 159, 0, 0.1) 0%, rgba(255, 212, 59, 0.1) 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(245, 159, 0, 0.2);
  min-width: 280px;
`;

const InfoTitle = styled.h3`
  color: ${colors.dark};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '👤';
    font-size: 14px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(245, 159, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: ${colors.secondary};
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.dark};
`;

const TabContainer = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.border};
  margin-bottom: 30px;
  overflow: hidden;
`;

const TabList = styled.div`
  display: flex;
  background: ${colors.light};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.border};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.warning};
    border-radius: 2px;
  }
`;

const Tab = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  text-decoration: none;
  color: ${colors.secondary};
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
  position: relative;
  
  &:hover {
    color: ${colors.warning};
    background: rgba(245, 159, 0, 0.05);
  }
  
  &.active {
    color: ${colors.warning};
    border-bottom-color: ${colors.warning};
    background: white;
    font-weight: 600;
  }
  
  &:before {
    content: '${props => props.icon}';
    font-size: 16px;
  }
`;

const ContentArea = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.border};
  overflow: hidden;
  min-height: 600px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  padding: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient});
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  transform: perspective(1000px) rotateX(0deg);
  transition: all 0.3s ease;
  
  &:hover {
    transform: perspective(1000px) rotateX(-5deg) translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: float 8s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
  }
`;

const StatIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${colors.light};
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: ${colors.dark};
  border-bottom: 2px solid ${colors.border};
  font-size: 14px;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid ${colors.border};
  font-size: 14px;
`;

const TableContainer = styled.div`
  padding: 30px;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const TableTitle = styled.h2`
  color: ${colors.dark};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:before {
    content: '${props => props.icon}';
    font-size: 20px;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 0 2px;
  
  &.primary { 
    background: ${colors.primary}; 
    color: white; 
    
    &:hover {
      background: ${colors.primaryDark};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(66, 99, 235, 0.3);
    }
  }
  
  &.danger { 
    background: ${colors.danger}; 
    color: white; 
    
    &:hover {
      background: #fa5252;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    }
  }
  
  &.warning { 
    background: ${colors.warning}; 
    color: ${colors.dark}; 
    
    &:hover {
      background: #fcc419;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 212, 59, 0.3);
    }
  }
  
  &.success { 
    background: ${colors.success}; 
    color: white; 
    
    &:hover {
      background: #40c057;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(81, 207, 102, 0.3);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  font-size: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.warning};
    box-shadow: 0 0 0 3px rgba(245, 159, 0, 0.1);
  }
  
  &:disabled {
    background: ${colors.light};
    cursor: not-allowed;
  }
`;

const UserRow = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(245, 159, 0, 0.05);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  
  &.active {
    background: rgba(81, 207, 102, 0.1);
    color: ${colors.success};
  }
  
  &.locked {
    background: rgba(255, 107, 107, 0.1);
    color: ${colors.danger};
  }
`;

const WarningBadge = styled.div`
  font-size: 11px;
  color: ${colors.warning};
  margin-top: 2px;
  font-weight: 500;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.warning};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  float: left;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const PermissionNote = styled.div`
  background: rgba(245, 159, 0, 0.1);
  color: ${colors.accent};
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px 30px;
  border: 1px solid rgba(245, 159, 0, 0.2);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '⚠️';
    font-size: 16px;
  }
`;

// 관리자 대시보드 메인 컴포넌트
const AdminDashboard = () => {
  const location = useLocation();
  const currentUser = getCurrentUser();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/users')) return 'users';
    return 'dashboard';
  };
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderContent>
          <TitleSection>
            <Title>관리자 대시보드</Title>
            <Subtitle>
              사용자 관리 및 시스템 모니터링을 위한 관리자 전용 페이지입니다.
            </Subtitle>
            <AdminBadge>관리자 권한</AdminBadge>
          </TitleSection>
          <AdminInfo>
            <InfoTitle>관리자 정보</InfoTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>사용자명</InfoLabel>
                <InfoValue>{currentUser?.username}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>권한 수준</InfoLabel>
                <InfoValue>관리자</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>접근 범위</InfoLabel>
                <InfoValue>사용자 관리</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>제한 사항</InfoLabel>
                <InfoValue>매니저 권한 제한</InfoValue>
              </InfoItem>
            </InfoGrid>
          </AdminInfo>
        </HeaderContent>
      </DashboardHeader>

      <TabContainer>
        <TabList>
          <Tab 
            to="/admin" 
            className={getActiveTab() === 'dashboard' ? 'active' : ''}
            icon="📊"
          >
            대시보드
          </Tab>
          <Tab 
            to="/admin/users" 
            className={getActiveTab() === 'users' ? 'active' : ''}
            icon="👥"
          >
            사용자 관리
          </Tab>
        </TabList>
      </TabContainer>

      <ContentArea>
        <Routes>
          <Route path="/" element={<AdminDashboardHome />} />
          <Route path="/users" element={<AdminUserManagement />} />
        </Routes>
      </ContentArea>
    </DashboardContainer>
  );
};

// 관리자 대시보드 홈
const AdminDashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await AdminApi.fetchUsers();
      
      const userStats = {
        total: data.length,
        user: data.filter(u => u.role === 'ROLE_USER').length,
        moderator: data.filter(u => u.role === 'ROLE_MODERATOR').length,
        admin: data.filter(u => u.role === 'ROLE_ADMIN').length,
        manager: data.filter(u => u.role === 'ROLE_MANAGER').length,
        locked: data.filter(u => u.locked).length,
        warned: data.filter(u => u.warningCount > 0).length
      };
      
      setStats(userStats);
    } catch (error) {
      console.error('통계 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div>통계 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <>
      <PermissionNote>
        관리자는 일반회원, 관리자회원, 다른 관리자를 관리할 수 있습니다. 매니저 권한 부여는 불가능합니다.
      </PermissionNote>

      <StatsGrid>
        <StatCard gradient="rgba(66, 99, 235, 1) 0%, rgba(102, 126, 234, 1) 100%">
          <StatIcon>👥</StatIcon>
          <StatNumber>{stats?.total || 0}</StatNumber>
          <StatLabel>전체 사용자</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(81, 207, 102, 1) 0%, rgba(64, 192, 87, 1) 100%">
          <StatIcon>👤</StatIcon>
          <StatNumber>{stats?.user || 0}</StatNumber>
          <StatLabel>일반회원</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(245, 159, 0, 1) 0%, rgba(255, 146, 43, 1) 100%">
          <StatIcon>🛡️</StatIcon>
          <StatNumber>{stats?.moderator || 0}</StatNumber>
          <StatLabel>관리자회원</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(255, 212, 59, 1) 0%, rgba(252, 196, 25, 1) 100%">
          <StatIcon>🔑</StatIcon>
          <StatNumber>{stats?.admin || 0}</StatNumber>
          <StatLabel>관리자</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(255, 107, 107, 1) 0%, rgba(255, 146, 43, 1) 100%">
          <StatIcon>🚫</StatIcon>
          <StatNumber>{stats?.locked || 0}</StatNumber>
          <StatLabel>정지된 사용자</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(255, 146, 43, 1) 0%, rgba(252, 196, 25, 1) 100%">
          <StatIcon>⚠️</StatIcon>
          <StatNumber>{stats?.warned || 0}</StatNumber>
          <StatLabel>경고받은 사용자</StatLabel>
        </StatCard>
      </StatsGrid>
    </>
  );
};

// 관리자 사용자 관리
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await AdminApi.fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // 관리자는 MANAGER 권한을 부여할 수 없음
    if (newRole === 'ROLE_MANAGER') {
      alert('매니저 권한은 관리자가 부여할 수 없습니다.');
      return;
    }

    if (window.confirm('정말로 권한을 변경하시겠습니까?')) {
      try {
        await AdminApi.updateUserRole(userId, newRole);
        loadUsers();
        alert('권한이 변경되었습니다.');
      } catch (error) {
        alert('권한 변경에 실패했습니다.');
      }
    }
  };

  const handleLock = async (userId, lock) => {
    if (window.confirm(`정말로 사용자를 ${lock ? '정지' : '정지 해제'}하시겠습니까?`)) {
      try {
        await AdminApi.lockUser(userId, lock);
        loadUsers();
        alert(`사용자가 ${lock ? '정지' : '정지 해제'}되었습니다.`);
      } catch (error) {
        alert('처리에 실패했습니다.');
      }
    }
  };

  const handleWarn = async (userId) => {
    if (window.confirm('정말로 경고를 부여하시겠습니까?')) {
      try {
        await AdminApi.warnUser(userId);
        loadUsers();
        alert('경고가 부여되었습니다.');
      } catch (error) {
        alert('경고 부여에 실패했습니다.');
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('정말로 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await AdminApi.deleteUser(userId);
        loadUsers();
        alert('사용자가 삭제되었습니다.');
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = (username) => {
    return username?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div>사용자 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <TableContainer>
      <PermissionNote>
        관리자는 매니저를 제외한 모든 사용자를 관리할 수 있습니다. 매니저 권한 부여는 불가능합니다.
      </PermissionNote>
      
      <TableHeader>
        <TableTitle icon="👥">사용자 관리</TableTitle>
        <div style={{ fontSize: '14px', color: colors.secondary }}>
          총 {users.length}명의 사용자 중 관리 가능: {users.filter(u => u.role !== 'ROLE_MANAGER').length}명
        </div>
      </TableHeader>
      
      <Table>
        <thead>
          <tr>
            <Th>사용자</Th>
            <Th>이름</Th>
            <Th>이메일</Th>
            <Th>권한</Th>
            <Th>상태</Th>
            <Th>관리</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <UserRow key={user.id}>
              <Td>
                <UserInfo>
                  <UserAvatar>{getUserInitial(user.username)}</UserAvatar>
                  <div>
                    <div style={{ fontWeight: '600' }}>{user.username}</div>
                    <div style={{ fontSize: '11px', color: colors.secondary }}>
                      ID: {user.id}
                    </div>
                  </div>
                </UserInfo>
              </Td>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Select 
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={user.role === 'ROLE_MANAGER' || user.id === currentUser?.id}
                >
                  <option value="ROLE_USER">일반회원</option>
                  <option value="ROLE_MODERATOR">관리자회원</option>
                  <option value="ROLE_ADMIN">관리자</option>
                  {user.role === 'ROLE_MANAGER' && (
                    <option value="ROLE_MANAGER">매니저 (수정불가)</option>
                  )}
                </Select>
              </Td>
              <Td>
                <StatusBadge className={user.locked ? 'locked' : 'active'}>
                  {user.locked ? '정지됨' : '활성'}
                </StatusBadge>
                {user.warningCount > 0 && (
                  <WarningBadge>경고: {user.warningCount}회</WarningBadge>
                )}
              </Td>
              <Td>
                <ActionButton 
                  className="warning" 
                  onClick={() => handleWarn(user.id)}
                  disabled={user.role === 'ROLE_MANAGER' || user.id === currentUser?.id}
                >
                  경고
                </ActionButton>
                <ActionButton 
                  className={user.locked ? "success" : "warning"} 
                  onClick={() => handleLock(user.id, !user.locked)}
                  disabled={user.role === 'ROLE_MANAGER' || user.id === currentUser?.id}
                >
                  {user.locked ? '해제' : '정지'}
                </ActionButton>
                {user.role !== 'ROLE_MANAGER' && user.id !== currentUser?.id && (
                  <ActionButton 
                    className="danger" 
                    onClick={() => handleDelete(user.id)}
                  >
                    삭제
                  </ActionButton>
                )}
              </Td>
            </UserRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default AdminDashboard;