import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPost, createPost, updatePost, fetchCategories } from '../api/BoardApi';
import { getCurrentUser } from '../api/AuthApi';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
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
  font-size: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 300px;
  font-size: 16px;
  font-family: inherit;
`;

const AuthorDisplay = styled.div`
  padding: 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const AuthorBadge = styled.span`
  background-color: #4CAF50;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
`;

const SubmitButton = styled(Button)`
  background-color: #4CAF50;
  color: white;
  
  &:hover {
    background-color: #45a049;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f2f2f2;
  color: #333;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const BoardForm = () => {
  const { id, categoryId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const currentUser = getCurrentUser();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: categoryId || ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 카테고리 목록 가져오기
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        
        if (isEdit) {
          // 수정 모드일 경우 게시글 정보 가져오기
          const postData = await fetchPost(id);
          setFormData({
            title: postData.title,
            content: postData.content,
            categoryId: postData.categoryId || ''
          });
        } else {
          // 새 글 작성 시 카테고리 설정
          setFormData(prev => ({
            ...prev,
            categoryId: categoryId || ''
          }));
        }
        
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit, categoryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 간단한 유효성 검사
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.categoryId) {
      alert('게시판을 선택해주세요.');
      return;
    }

    // 작성자는 서버에서 자동으로 설정됨 (현재 로그인한 사용자의 닉네임)
    const submitData = {
      title: formData.title,
      content: formData.content,
      categoryId: formData.categoryId
      // author 필드는 제거 - 서버에서 자동 설정
    };

    try {
      if (isEdit) {
        // 수정 모드: 게시글 업데이트
        await updatePost(id, submitData);
        alert('게시글이 수정되었습니다.');
      } else {
        // 작성 모드: 새 게시글 생성
        await createPost(submitData);
        alert('게시글이 등록되었습니다.');
      }
      navigate(formData.categoryId ? `/category/${formData.categoryId}` : '/');
    } catch (err) {
      alert(isEdit ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
      navigate(isEdit ? `/post/${id}` : '/');
    }
  };

  // 권한 표시 함수
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ROLE_MANAGER': return '매니저';
      case 'ROLE_ADMIN': return '관리자';
      case 'ROLE_MODERATOR': return '관리자회원';
      case 'ROLE_USER': return '일반회원';
      default: return '회원';
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <FormContainer>
      <Title>{isEdit ? '게시글 수정' : '새 게시글 작성'}</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="categoryId">게시판</Label>
          <Select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">게시판을 선택하세요</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="title">제목</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
            required
          />
        </FormGroup>
        
        {/* 작성자 정보 표시 (수정 불가) */}
        <FormGroup>
          <Label>작성자</Label>
          <AuthorDisplay>
            {currentUser ? (
              <>
                {currentUser.nickname || currentUser.name || currentUser.username}
                <AuthorBadge>{getRoleDisplayName(currentUser.role)}</AuthorBadge>
              </>
            ) : (
              '로그인된 사용자'
            )}
          </AuthorDisplay>
          <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
            작성자는 현재 로그인한 사용자의 닉네임으로 자동 설정됩니다.
          </small>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
          />
        </FormGroup>
        
        <ButtonGroup>
          <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
          <SubmitButton type="submit">{isEdit ? '수정하기' : '등록하기'}</SubmitButton>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default BoardForm;