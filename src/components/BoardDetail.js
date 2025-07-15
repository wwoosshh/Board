import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPost, deletePost } from '../api/BoardApi';
import { isAuthenticated, getCurrentUser, isManager, isAdminOrAbove, isModeratorOrAbove } from '../api/AuthApi';
import CommentSection from './CommentSection';
import MarkdownRenderer from './MarkdownRenderer';
import styled from 'styled-components';

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

const DetailContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  background: ${colors.light};
  min-height: calc(100vh - 70px);
`;

const PostCard = styled.article`
  background: ${colors.cardBg};
  border-radius: 16px;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.border};
  overflow: hidden;
  margin-bottom: 30px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${colors.gradient};
  }
`;

const PostHeader = styled.header`
  padding: 30px 30px 20px 30px;
  border-bottom: 1px solid ${colors.border};
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
`;

const CategoryBadge = styled.span`
  display: inline-block;
  background: ${colors.gradient};
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const PostTitle = styled.h1`
  font-size: 28px;
  color: ${colors.dark};
  margin: 0 0 20px 0;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.gradient};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AuthorName = styled.span`
  color: ${colors.dark};
  font-weight: 600;
  font-size: 16px;
`;

const PostDate = styled.span`
  color: ${colors.secondary};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:before {
    content: '🕒';
    font-size: 12px;
  }
`;

const PostStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${colors.secondary};
  font-size: 14px;
  
  &:before {
    content: '${props => props.$icon}';
    font-size: 12px;
  }
`;

const PostContent = styled.div`
  padding: 40px;
  background: white;
  
  /* MarkdownRenderer 스타일이 여기에 적용됩니다 */
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: ${colors.light};
  border-top: 1px solid ${colors.border};
  flex-wrap: wrap;
  gap: 16px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const BackButton = styled(Link)`
  background: ${colors.secondary};
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.dark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:before {
    content: '←';
    font-size: 16px;
  }
`;

const EditButton = styled(Link)`
  background: ${colors.success};
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #40c057;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(81, 207, 102, 0.3);
  }
  
  &:before {
    content: '✏️';
    font-size: 14px;
  }
`;

const DeleteButton = styled(Button)`
  background: ${colors.danger};
  color: white;
  
  &:hover {
    background: #fa5252;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
  
  &:before {
    content: '🗑️';
    font-size: 14px;
  }
`;

const ShareButton = styled(Button)`
  background: ${colors.primary};
  color: white;
  
  &:hover {
    background: ${colors.primaryDark};
    box-shadow: 0 4px 12px rgba(66, 99, 235, 0.3);
  }
  
  &:before {
    content: '🔗';
    font-size: 14px;
  }
`;

const LoadingCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.border};
  
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${colors.border};
  border-top: 3px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.danger};
  color: ${colors.danger};
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: ${colors.secondary};
  font-size: 14px;
`;

const BreadcrumbLink = styled(Link)`
  color: ${colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${colors.border};
  
  &:before {
    content: '›';
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
  
  // 공유 기능
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.title,
          url: url,
        });
      } catch (err) {
        console.log('공유가 취소되었습니다.');
      }
    } else {
      // 클립보드에 복사
      try {
        await navigator.clipboard.writeText(url);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch (err) {
        console.error('링크 복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
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

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = (author) => {
    return author?.charAt(0).toUpperCase() || 'U';
  };

  // 시간을 상대적으로 표시
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  if (loading) {
    return (
      <DetailContainer>
        <LoadingCard>
          <LoadingSpinner />
          <div>게시글을 불러오는 중...</div>
        </LoadingCard>
      </DetailContainer>
    );
  }

  if (error) {
    return (
      <DetailContainer>
        <ErrorCard>
          <ErrorIcon>❌</ErrorIcon>
          <div>{error}</div>
        </ErrorCard>
      </DetailContainer>
    );
  }

  if (!post) {
    return (
      <DetailContainer>
        <ErrorCard>
          <ErrorIcon>📝</ErrorIcon>
          <div>게시글을 찾을 수 없습니다.</div>
        </ErrorCard>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      {/* 브레드크럼 네비게이션 */}
      <Breadcrumb>
        <BreadcrumbLink to="/">홈</BreadcrumbLink>
        <BreadcrumbSeparator />
        {post.categoryName && (
          <>
            <BreadcrumbLink to={`/category/${post.categoryId}`}>
              {post.categoryName}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </>
        )}
        <span>게시글 #{post.id}</span>
      </Breadcrumb>

      <PostCard>
        <PostHeader>
          {post.categoryName && (
            <CategoryBadge>{post.categoryName}</CategoryBadge>
          )}
          
          <PostTitle>{post.title}</PostTitle>
          
          <PostMeta>
            <AuthorSection>
              <AuthorAvatar>{getUserInitial(post.author)}</AuthorAvatar>
              <AuthorInfo>
                <AuthorName>{post.author}</AuthorName>
                <PostDate>{getRelativeTime(post.createdDate)}</PostDate>
              </AuthorInfo>
            </AuthorSection>
            
            <PostStats>
              <StatItem $icon="👁️">조회 {post.viewCount || 0}</StatItem>
              <StatItem $icon="💬">댓글 {post.commentCount || 0}</StatItem>
            </PostStats>
          </PostMeta>
        </PostHeader>
        
        <PostContent>
          <MarkdownRenderer content={post.content} />
        </PostContent>
        
        <ActionBar>
          <ActionGroup>
            <BackButton to={post.categoryId ? `/category/${post.categoryId}` : "/"}>
              목록으로
            </BackButton>
          </ActionGroup>
          
          <ActionGroup>
            <ShareButton onClick={handleShare}>
              공유하기
            </ShareButton>
            
            {hasPermission() && (
              <>
                <EditButton to={`/edit/${post.id}`}>
                  수정하기
                </EditButton>
                <DeleteButton onClick={handleDelete}>
                  삭제하기
                </DeleteButton>
              </>
            )}
          </ActionGroup>
        </ActionBar>
      </PostCard>

      {/* 댓글 섹션 추가 */}
      <CommentSection postId={parseInt(id)} />
    </DetailContainer>
  );
};

export default BoardDetail;