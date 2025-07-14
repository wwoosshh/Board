import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as ManagerApi from '../api/ManagerApi';
import { getRoleDisplayName } from '../api/AuthApi';

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
    color: #4CAF50;
    border-bottom-color: #4CAF50;
  }
`;

const ContentArea = styled.div`
  min-height: 500px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
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
  
  &.primary { background-color: #4CAF50; color: white; }
  &.danger { background-color: #f44336; color: white; }
  &.warning { background-color: #ff9800; color: white; }
  
  &:hover { opacity: 0.8; }
`;

const FormContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
`;

// 대시보드 메인 컴포넌트
const ManagerDashboard = () => {
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

  if (loading) return <div>로딩 중...</div>;

  return (
    <DashboardContainer>
      <Header>
        <Title>매니저 대시보드</Title>
        <Subtitle>시스템 전체를 관리할 수 있는 매니저 전용 페이지입니다.</Subtitle>
      </Header>

      <TabContainer>
        <Tab to="/manager" className="active">대시보드</Tab>
        <Tab to="/manager/users">사용자 관리</Tab>
        <Tab to="/manager/categories">게시판 관리</Tab>
      </TabContainer>

      <Routes>
        <Route path="/" element={<DashboardHome dashboard={dashboard} />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/categories" element={<CategoryManagement />} />
      </Routes>
    </DashboardContainer>
  );
};

// 대시보드 홈
const DashboardHome = ({ dashboard }) => {
  if (!dashboard) return <div>데이터를 불러올 수 없습니다.</div>;

  return (
    <ContentArea>
      <h2>시스템 현황</h2>
      <StatsGrid>
        <StatCard>
          <StatNumber>{dashboard.userStats?.total || 0}</StatNumber>
          <StatLabel>전체 사용자</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{dashboard.userStats?.manager || 0}</StatNumber>
          <StatLabel>매니저</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{dashboard.userStats?.admin || 0}</StatNumber>
          <StatLabel>관리자</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{dashboard.userStats?.moderator || 0}</StatNumber>
          <StatLabel>관리자회원</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{dashboard.userStats?.user || 0}</StatNumber>
          <StatLabel>일반회원</StatLabel>
        </StatCard>
      </StatsGrid>

      <h3>최근 가입한 사용자</h3>
      <Table>
        <thead>
          <tr>
            <Th>사용자명</Th>
            <Th>이름</Th>
            <Th>권한</Th>
            <Th>가입일</Th>
          </tr>
        </thead>
        <tbody>
          {dashboard.recentUsers?.map(user => (
            <tr key={user.id}>
              <Td>{user.username}</Td>
              <Td>{user.name}</Td>
              <Td>{getRoleDisplayName(user.role)}</Td>
              <Td>{new Date(user.createdDate).toLocaleDateString()}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ContentArea>
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
        loadUsers(); // 목록 새로고침
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
                {user.locked ? '정지됨' : '활성'}
                {user.warningCount > 0 && ` (경고: ${user.warningCount})`}
              </Td>
              <Td>
                <Button 
                  className="warning" 
                  onClick={() => handleSuspend(user.id, !user.locked)}
                >
                  {user.locked ? '해제' : '정지'}
                </Button>
                {user.role !== 'ROLE_MANAGER' && (
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

  return (
    <ContentArea>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>게시판 관리</h2>
        <Button 
          className="primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '취소' : '새 게시판'}
        </Button>
      </div>

      {showForm && (
        <FormContainer>
          <h3>{editingCategory ? '게시판 수정' : '새 게시판 생성'}</h3>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>게시판 이름</Label>
              <Input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>설명</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </FormGroup>
            <Button className="primary" type="submit">
              {editingCategory ? '수정하기' : '생성하기'}
            </Button>
          </form>
        </FormContainer>
      )}

      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>게시판 이름</Th>
            <Th>설명</Th>
            <Th>관리</Th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <Td>{category.id}</Td>
              <Td>{category.name}</Td>
              <Td>{category.description}</Td>
              <Td>
                <Button 
                  className="primary" 
                  onClick={() => handleEdit(category)}
                >
                  수정
                </Button>
                <Button 
                  className="danger" 
                  onClick={() => handleDelete(category.id)}
                >
                  삭제
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ContentArea>
  );
};

export default ManagerDashboard;