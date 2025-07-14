import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPost, deletePost } from '../api/BoardApi';
import { isAuthenticated, getCurrentUser, isManager, isAdminOrAbove, isModeratorOrAbove } from '../api/AuthApi';
import CommentSection from './CommentSection';
import styled from 'styled-components';

// 스타일 컴포넌트 정의
const DetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  border-bottom: 2px solid #ddd;
  padding-bottom: 15px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  background-color: #e7f3fe;
  color: #1a73e8;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
`;

const Content = styled.div`
  min-height: 300px;
  margin-bottom: 30px;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
`;

const BackButton = styled(Link)`
  background-color: #f2f2f2;
  color: #333;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  display: inline-block;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const EditButton = styled(Link)`
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  margin-right: 10px;
  display: inline-block;
  
  &:hover {
    background-color: #45a049;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #f44336;
  color: white;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

// BoardDetail 컴포넌트
const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 현재 사용자 정보
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  
  // 게시글 정보 가져오기
  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await fetchPost(id);
        setPost(data);
        setLoading(false);
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (!authenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await deletePost(id);
        alert('게시글이 삭제되었습니다.');
        
        // 삭제 후 해당 카테고리 페이지로 이동 (없으면 홈으로)
        if (post.categoryId) {
          navigate(`/category/${post.categoryId}`);
        } else {
          navigate('/');
        }
      } catch (err) {
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 사용자에게 수정/삭제 권한이 있는지 확인 (권한 체계 수정)
  const hasPermission = () => {
    if (!authenticated || !currentUser || !post) return false;
    
    // 매니저는 모든 게시글 수정/삭제 가능
    if (isManager()) {
      console.log('👑 매니저 권한으로 수정/삭제 가능');
      return true;
    }
    
    // 관리자는 모든 게시글 수정/삭제 가능
    if (isAdminOrAbove()) {
      console.log('🔑 관리자 권한으로 수정/삭제 가능');
      return true;
    }
    
    // 관리자회원은 모든 게시글 수정/삭제 가능
    if (isModeratorOrAbove()) {
      console.log('🛡️ 관리자회원 권한으로 수정/삭제 가능');
      return true;
    }
    
    // 본인 글이면 수정/삭제 가능
    if (post.userId && post.userId === currentUser.id) {
      console.log('👤 본인 글 수정/삭제 가능');
      return true;
    }
    
    console.log('❌ 수정/삭제 권한 없음');
    return false;
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <DetailContainer>
      <Header>
        <Title>
          {post.title}
          {post.categoryName && (
            <CategoryBadge>{post.categoryName}</CategoryBadge>
          )}
        </Title>
        <Meta>
          <span>작성자: {post.author}</span>
          <span>작성일: {new Date(post.createdDate).toLocaleString()}</span>
        </Meta>
      </Header>
      
      <Content>{post.content}</Content>
      
      <ButtonGroup>
        <BackButton to={post.categoryId ? `/category/${post.categoryId}` : "/"}>
          목록으로
        </BackButton>
        
        {hasPermission() && (
          <div>
            <EditButton to={`/edit/${post.id}`}>수정</EditButton>
            <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
          </div>
        )}
      </ButtonGroup>

      {/* 댓글 섹션 추가 */}
      <CommentSection postId={parseInt(id)} />
    </DetailContainer>
  );
};

export default BoardDetail;