import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as AdminApi from '../api/AdminApi';
import { getRoleDisplayName, getCurrentUser } from '../api/AuthApi';

// 스타일 컴포넌트들
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

const TabContainer = styled.div`
  border-bottom: 2px solid #ddd;
  margin-bottom: 30px;
`;

const Tab = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  margin-right: 10px;
  text-decoration: none;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  
  &:hover {
    color: #333;
  }
  
  &.active {
    color: #2196F3;
    border-bottom-color: #2196F3;
  }
`;

const ContentArea = styled.div`
  min-height: 500px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  background-color: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const Button = styled.button`
  padding: 6px 12px;
  margin: 0 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &.primary { background-color: #2196F3; color: white; }
  &.danger { background-color: #f44336; color: white; }
  &.warning { background-color: #ff9800; color: white; }
  &.success { background-color: #4CAF50; color: white; }
  
  &:hover { opacity: 0.8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Select = styled.select`
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
`;

const StatsCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 20px;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2196F3;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

// 관리자 대시보드 메인 컴포넌트
const AdminDashboard = () => {
  const currentUser = getCurrentUser();
  
  return (
    <DashboardContainer>
      <Header>
        <Title>관리자 대시보드</Title>
        <Subtitle>사용자 관리 및 시스템 모니터링을 위한 관리자 전용 페이지입니다.</Subtitle>
      </Header>

      <TabContainer>
        <Tab to="/admin" className="active">대시보드</Tab>
        <Tab to="/admin/users">사용자 관리</Tab>
      </TabContainer>

      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/users" element={<AdminUserManagement />} />
      </Routes>
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

  if (loading) return <div>로딩 중...</div>;

  return (
    <ContentArea>
      <h2>시스템 현황</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <StatsCard>
          <StatNumber>{stats?.total || 0}</StatNumber>
          <StatLabel>전체 사용자</StatLabel>
        </StatsCard>
        <StatsCard>
          <StatNumber>{stats?.user || 0}</StatNumber>
          <StatLabel>일반회원</StatLabel>
        </StatsCard>
        <StatsCard>
          <StatNumber>{stats?.moderator || 0}</StatNumber>
          <StatLabel>관리자회원</StatLabel>
        </StatsCard>
        <StatsCard>
          <StatNumber>{stats?.admin || 0}</StatNumber>
          <StatLabel>관리자</StatLabel>
        </StatsCard>
        <StatsCard>
          <StatNumber>{stats?.locked || 0}</StatNumber>
          <StatLabel>정지된 사용자</StatLabel>
        </StatsCard>
        <StatsCard>
          <StatNumber>{stats?.warned || 0}</StatNumber>
          <StatLabel>경고받은 사용자</StatLabel>
        </StatsCard>
      </div>
    </ContentArea>
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

  if (loading) return <div>로딩 중...</div>;

  return (
    <ContentArea>
      <h2>사용자 관리</h2>
      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>사용자명</Th>
            <Th>이름</Th>
            <Th>이메일</Th>
            <Th>권한</Th>
            <Th>상태</Th>
            <Th>관리</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <Td>{user.id}</Td>
              <Td>{user.username}</Td>
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
                    <option value="ROLE_MANAGER">매니저</option>
                  )}
                </Select>
              </Td>
              <Td>
                {user.locked ? '정지됨' : '활성'}
                {user.warningCount > 0 && ` (경고: ${user.warningCount})`}
              </Td>
              <Td>
                <Button 
                  className="warning" 
                  onClick={() => handleWarn(user.id)}
                  disabled={user.role === 'ROLE_MANAGER' || user.id === currentUser?.id}
                >
                  경고
                </Button>
                <Button 
                  className={user.locked ? "success" : "warning"} 
                  onClick={() => handleLock(user.id, !user.locked)}
                  disabled={user.role === 'ROLE_MANAGER' || user.id === currentUser?.id}
                >
                  {user.locked ? '해제' : '정지'}
                </Button>
                {user.role !== 'ROLE_MANAGER' && user.id !== currentUser?.id && (
                  <Button 
                    className="danger" 
                    onClick={() => handleDelete(user.id)}
                  >
                    삭제
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ContentArea>
  );
};

export default AdminDashboard;