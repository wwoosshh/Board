import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchPosts, fetchPostsByCategory, fetchCategory } from '../api/BoardApi';
import { fetchCommentCount } from '../api/CommentApi';
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

const BoardContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  background: ${colors.light};
  min-height: calc(100vh - 70px);
`;

const BoardHeader = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.border};
  position: relative;
  overflow: hidden;
  
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

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Title = styled.h1`
  font-size: 32px;
  color: ${colors.dark};
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:before {
    content: '📋';
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  color: ${colors.secondary};
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const PostStats = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 16px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.secondary};
  font-size: 14px;
  
  span {
    font-weight: 600;
    color: ${colors.primary};
  }
`;

const WriteButton = styled(Link)`
  background: ${colors.gradient};
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
  
  &:before {
    content: '✍️';
    font-size: 16px;
  }
`;

const PostGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const PostCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${colors.border};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px ${colors.shadow};
    border-color: ${colors.primary};
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${colors.gradient};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover:before {
    transform: scaleX(1);
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
`;

const PostInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PostId = styled.span`
  display: inline-block;
  background: ${colors.light};
  color: ${colors.secondary};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const PostTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.dark};
  margin: 0 0 8px 0;
  line-height: 1.4;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${colors.secondary};
  font-size: 14px;
  
  &:before {
    content: '${props => props.icon}';
    font-size: 12px;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.secondary};
  font-size: 14px;
  font-weight: 500;
`;

const AuthorAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const PostBadges = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const CategoryBadge = styled.span`
  background: linear-gradient(45deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(66, 99, 235, 0.3);
`;

const CommentBadge = styled.span`
  background: ${colors.accent};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:before {
    content: '💬';
    font-size: 10px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: ${colors.cardBg};
  border-radius: 16px;
  border: 2px dashed ${colors.border};
  margin-top: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: ${colors.secondary};
  font-size: 18px;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: ${colors.secondary};
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
`;

const LoadingCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${colors.border};
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const LoadingBar = styled.div`
  background: ${colors.light};
  border-radius: 4px;
  height: ${props => props.height || '12px'};
  width: ${props => props.width || '100%'};
  margin: 8px 0;
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
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
  
  &::placeholder {
    color: ${colors.secondary};
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
  }
`;

const BoardList = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        
        let data;
        if (categoryId) {
          data = await fetchPostsByCategory(categoryId);
          const categoryData = await fetchCategory(categoryId);
          setCategory(categoryData);
        } else {
          data = await fetchPosts();
          setCategory(null);
        }
        
        setPosts(data);
        
        // 각 게시글의 댓글 수 가져오기
        const counts = {};
        await Promise.all(
          data.map(async (post) => {
            try {
              const count = await fetchCommentCount(post.id);
              counts[post.id] = count;
            } catch (error) {
              console.error(`댓글 수 조회 실패 (게시글 ${post.id}):`, error);
              counts[post.id] = 0;
            }
          })
        );
        setCommentCounts(counts);
        
        setLoading(false);
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadPosts();
  }, [categoryId]);

  // 게시글 행 클릭 시 상세 페이지로 이동하는 핸들러
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // 검색 및 정렬 필터링
  const filteredPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'oldest':
          return new Date(a.createdDate) - new Date(b.createdDate);
        case 'comments':
          return (commentCounts[b.id] || 0) - (commentCounts[a.id] || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

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

  if (error) return <div>{error}</div>;

  return (
    <BoardContainer>
      <BoardHeader>
        <HeaderContent>
          <TitleSection>
            <Title>
              {category ? category.name : '전체 게시글'}
            </Title>
            {category && <Subtitle>{category.description}</Subtitle>}
            <PostStats>
              <StatItem>
                📝 전체 글 <span>{posts.length}</span>
              </StatItem>
              <StatItem>
                💬 총 댓글 <span>{Object.values(commentCounts).reduce((a, b) => a + b, 0)}</span>
              </StatItem>
            </PostStats>
          </TitleSection>
          <WriteButton to={categoryId ? `/write/${categoryId}` : "/write"}>
            새 글 작성
          </WriteButton>
        </HeaderContent>
      </BoardHeader>

      <SearchAndFilter>
        <SearchInput
          type="text"
          placeholder="제목이나 작성자로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="comments">댓글순</option>
          <option value="title">제목순</option>
        </FilterSelect>
      </SearchAndFilter>
      
      {loading ? (
        <PostGrid>
          {[1, 2, 3, 4, 5].map(i => (
            <LoadingCard key={i}>
              <LoadingBar width="60%" height="16px" />
              <LoadingBar width="100%" height="12px" />
              <LoadingBar width="40%" height="10px" />
            </LoadingCard>
          ))}
        </PostGrid>
      ) : filteredPosts.length > 0 ? (
        <PostGrid>
          {filteredPosts.map((post) => (
            <PostCard key={post.id} onClick={() => handlePostClick(post.id)}>
              <PostHeader>
                <PostInfo>
                  <PostId>#{post.id}</PostId>
                  <PostTitle>{post.title}</PostTitle>
                  <PostMeta>
                    <AuthorInfo>
                      <AuthorAvatar>{getUserInitial(post.author)}</AuthorAvatar>
                      {post.author}
                    </AuthorInfo>
                    <MetaItem icon="🕒">
                      {getRelativeTime(post.createdDate)}
                    </MetaItem>
                  </PostMeta>
                </PostInfo>
                <PostBadges>
                  {!categoryId && post.categoryName && (
                    <CategoryBadge>{post.categoryName}</CategoryBadge>
                  )}
                  {commentCounts[post.id] > 0 && (
                    <CommentBadge>{commentCounts[post.id]}</CommentBadge>
                  )}
                </PostBadges>
              </PostHeader>
            </PostCard>
          ))}
        </PostGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>
            {searchTerm ? '검색 결과가 없습니다' : '아직 게시글이 없습니다'}
          </EmptyTitle>
          <EmptyDescription>
            {searchTerm ? '다른 검색어로 시도해보세요.' : '첫 번째 게시글을 작성해보세요!'}
          </EmptyDescription>
        </EmptyState>
      )}
    </BoardContainer>
  );
};

export default BoardList;