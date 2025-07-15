import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import * as ManagerApi from '../api/ManagerApi';
import { getRoleDisplayName } from '../api/AuthApi';

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
    background: linear-gradient(135deg, #ff6b6b 0%, #ff922b 100%);
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
    content: '👑';
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  color: ${colors.secondary};
  font-size: 18px;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const ManagerBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff922b 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
`;

const SystemStatus = styled.div`
  background: linear-gradient(135deg, rgba(81, 207, 102, 0.1) 0%, rgba(66, 99, 235, 0.1) 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(81, 207, 102, 0.2);
  min-width: 280px;
`;

const StatusTitle = styled.h3`
  color: ${colors.dark};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '⚡';
    font-size: 14px;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatusItem = styled.div`
  text-align: center;
`;

const StatusValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.success};
  margin-bottom: 4px;
`;

const StatusLabel = styled.div`
  font-size: 12px;
  color: ${colors.secondary};
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
    background: ${colors.primary};
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
    color: ${colors.primary};
    background: rgba(66, 99, 235, 0.05);
  }
  
  &.active {
    color: ${colors.primary};
    border-bottom-color: ${colors.primary};
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
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
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
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
  }
`;

const AddButton = styled.button`
  background: ${colors.gradient};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:before {
    content: '➕';
    font-size: 14px;
  }
`;

const FormContainer = styled.div`
  padding: 30px;
  background: ${colors.light};
  border-radius: 12px;
  margin: 20px 30px;
  border: 2px dashed ${colors.border};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${colors.dark};
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  min-height: 100px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
  }
`;

// 매니저 대시보드 메인 컴포넌트
const ManagerDashboard = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/users')) return 'users';
    if (path.includes('/categories')) return 'categories';
    return 'dashboard';
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderContent>
          <TitleSection>
            <Title>매니저 대시보드</Title>
            <Subtitle>
              시스템 전체를 관리하고 모니터링할 수 있는 최고 관리자 페이지입니다.
            </Subtitle>
            <ManagerBadge>최고 관리 권한</ManagerBadge>
          </TitleSection>
          <SystemStatus>
            <StatusTitle>시스템 상태</StatusTitle>
            <StatusGrid>
              <StatusItem>
                <StatusValue>99.9%</StatusValue>
                <StatusLabel>가동률</StatusLabel>
              </StatusItem>
              <StatusItem>
                <StatusValue>142ms</StatusValue>
                <StatusLabel>응답시간</StatusLabel>
              </StatusItem>
              <StatusItem>
                <StatusValue>Online</StatusValue>
                <StatusLabel>서버상태</StatusLabel>
              </StatusItem>
              <StatusItem>
                <StatusValue>Secure</StatusValue>
                <StatusLabel>보안상태</StatusLabel>
              </StatusItem>
            </StatusGrid>
          </SystemStatus>
        </HeaderContent>
      </DashboardHeader>

      <TabContainer>
        <TabList>
          <Tab 
            to="/manager" 
            className={getActiveTab() === 'dashboard' ? 'active' : ''}
            icon="📊"
          >
            대시보드
          </Tab>
          <Tab 
            to="/manager/users" 
            className={getActiveTab() === 'users' ? 'active' : ''}
            icon="👥"
          >
            사용자 관리
          </Tab>
          <Tab 
            to="/manager/categories" 
            className={getActiveTab() === 'categories' ? 'active' : ''}
            icon="📁"
          >
            게시판 관리
          </Tab>
        </TabList>
      </TabContainer>

      <ContentArea>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
        </Routes>
      </ContentArea>
    </DashboardContainer>
  );
};

// 대시보드 홈
const DashboardHome = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await ManagerApi.fetchManagerDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('대시보드 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div>데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: colors.danger }}>
        <div>❌ 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      <StatsGrid>
        <StatCard gradient="rgba(66, 99, 235, 1) 0%, rgba(102, 126, 234, 1) 100%">
          <StatIcon>👥</StatIcon>
          <StatNumber>{dashboard.userStats?.total || 0}</StatNumber>
          <StatLabel>전체 사용자</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(255, 107, 107, 1) 0%, rgba(255, 146, 43, 1) 100%">
          <StatIcon>👑</StatIcon>
          <StatNumber>{dashboard.userStats?.manager || 0}</StatNumber>
          <StatLabel>매니저</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(245, 159, 0, 1) 0%, rgba(252, 196, 25, 1) 100%">
          <StatIcon>🔑</StatIcon>
          <StatNumber>{dashboard.userStats?.admin || 0}</StatNumber>
          <StatLabel>관리자</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(81, 207, 102, 1) 0%, rgba(64, 192, 87, 1) 100%">
          <StatIcon>🛡️</StatIcon>
          <StatNumber>{dashboard.userStats?.moderator || 0}</StatNumber>
          <StatLabel>관리자회원</StatLabel>
        </StatCard>
        <StatCard gradient="rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 100%">
          <StatIcon>👤</StatIcon>
          <StatNumber>{dashboard.userStats?.user || 0}</StatNumber>
          <StatLabel>일반회원</StatLabel>
        </StatCard>
      </StatsGrid>

      <TableContainer>
        <TableHeader>
          <TableTitle icon="🆕">최근 가입한 사용자</TableTitle>
        </TableHeader>
        <Table>
          <thead>
            <tr>
              <Th>사용자명</Th>
              <Th>이름</Th>
              <Th>권한</Th>
              <Th>가입일</Th>
              <Th>상태</Th>
            </tr>
          </thead>
          <tbody>
            {dashboard.recentUsers?.map(user => (
              <tr key={user.id}>
                <Td>{user.username}</Td>
                <Td>{user.name}</Td>
                <Td>{getRoleDisplayName(user.role)}</Td>
                <Td>{new Date(user.createdDate).toLocaleDateString()}</Td>
                <Td>
                  <span style={{ 
                    color: user.locked ? colors.danger : colors.success,
                    fontWeight: '600'
                  }}>
                    {user.locked ? '정지됨' : '활성'}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </>
  );
};

// 사용자 관리
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await ManagerApi.fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm('정말로 권한을 변경하시겠습니까?')) {
      try {
        await ManagerApi.updateUserRole(userId, newRole);
        loadUsers();
        alert('권한이 변경되었습니다.');
      } catch (error) {
        alert('권한 변경에 실패했습니다.');
      }
    }
  };

  const handleSuspend = async (userId, suspend) => {
    if (window.confirm(`정말로 사용자를 ${suspend ? '정지' : '정지 해제'}하시겠습니까?`)) {
      try {
        await ManagerApi.suspendUser(userId, suspend);
        loadUsers();
        alert(`사용자가 ${suspend ? '정지' : '정지 해제'}되었습니다.`);
      } catch (error) {
        alert('처리에 실패했습니다.');
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('정말로 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await ManagerApi.deleteUser(userId);
        loadUsers();
        alert('사용자가 삭제되었습니다.');
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
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
      <TableHeader>
        <TableTitle icon="👥">사용자 관리</TableTitle>
        <div style={{ fontSize: '14px', color: colors.secondary }}>
          총 {users.length}명의 사용자가 등록되어 있습니다.
        </div>
      </TableHeader>
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
                  disabled={user.role === 'ROLE_MANAGER'}
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
                <span style={{ 
                  color: user.locked ? colors.danger : colors.success,
                  fontWeight: '600'
                }}>
                  {user.locked ? '정지됨' : '활성'}
                </span>
                {user.warningCount > 0 && (
                  <div style={{ fontSize: '12px', color: colors.warning }}>
                    경고: {user.warningCount}회
                  </div>
                )}
              </Td>
              <Td>
                <ActionButton 
                  className="warning" 
                  onClick={() => handleSuspend(user.id, !user.locked)}
                >
                  {user.locked ? '해제' : '정지'}
                </ActionButton>
                {user.role !== 'ROLE_MANAGER' && (
                  <ActionButton 
                    className="danger" 
                    onClick={() => handleDelete(user.id)}
                  >
                    삭제
                  </ActionButton>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

// 게시판 관리
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await ManagerApi.fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 로딩 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await ManagerApi.updateCategory(editingCategory.id, formData);
        alert('게시판이 수정되었습니다.');
      } else {
        await ManagerApi.createCategory(formData);
        alert('게시판이 생성되었습니다.');
      }
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      setShowForm(false);
      loadCategories();
    } catch (error) {
      alert('처리에 실패했습니다.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('정말로 게시판을 삭제하시겠습니까?')) {
      try {
        await ManagerApi.deleteCategory(categoryId);
        alert('게시판이 삭제되었습니다.');
        loadCategories();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle icon="📁">게시판 관리</TableTitle>
        <AddButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '취소' : '새 게시판'}
        </AddButton>
      </TableHeader>

      {showForm && (
        <FormContainer>
          <h3 style={{ margin: '0 0 20px 0', color: colors.dark }}>
            {editingCategory ? '📝 게시판 수정' : '➕새 게시판 생성'}
          </h3>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <Label>게시판 이름</Label>
                <Input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="게시판 이름을 입력하세요"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>설명</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="게시판 설명을 입력하세요"
                />
              </FormGroup>
            </FormGrid>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ActionButton className="primary" type="submit">
                {editingCategory ? '수정하기' : '생성하기'}
              </ActionButton>
              <ActionButton type="button" onClick={resetForm}>
                취소
              </ActionButton>
            </div>
          </form>
        </FormContainer>
      )}

      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>게시판 이름</Th>
            <Th>설명</Th>
            <Th>생성일</Th>
            <Th>관리</Th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <Td>{category.id}</Td>
              <Td style={{ fontWeight: '600' }}>{category.name}</Td>
              <Td>{category.description}</Td>
              <Td>{new Date(category.createdDate || Date.now()).toLocaleDateString()}</Td>
              <Td>
                <ActionButton 
                  className="primary" 
                  onClick={() => handleEdit(category)}
                >
                  수정
                </ActionButton>
                <ActionButton 
                  className="danger" 
                  onClick={() => handleDelete(category.id)}
                >
                  삭제
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default ManagerDashboard;