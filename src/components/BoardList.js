import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchPosts, fetchPostsByCategory, fetchCategory } from '../api/BoardApi';
import styled from 'styled-components';

// 기존 스타일 유지
const BoardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
`;

const WriteButton = styled(Link)`
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  
  &:hover {
    background-color: #45a049;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f2f2f2;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`;

const StyledLink = styled(Link)`
  color: #333;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CategoryLabel = styled.span`
  display: inline-block;
  padding: 3px 6px;
  background-color: #e7f3fe;
  color: #1a73e8;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
`;

// 클릭 가능한 행 스타일
const ClickableRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const BoardList = () => {
  const { categoryId } = useParams();
  // useNavigate를 올바르게 호출해야 합니다
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        
        let data;
        if (categoryId) {
          // 특정 카테고리의 게시글만 가져오기
          data = await fetchPostsByCategory(categoryId);
          
          // 카테고리 정보 가져오기
          const categoryData = await fetchCategory(categoryId);
          setCategory(categoryData);
        } else {
          // 모든 게시글 가져오기
          data = await fetchPosts();
          setCategory(null);
        }
        
        setPosts(data);
        setLoading(false);
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadPosts();
  }, [categoryId]);

  // 게시글 행 클릭 시 상세 페이지로 이동하는 핸들러
  const handleRowClick = (postId) => {
    // useNavigate 훅으로 할당된 navigate 함수 사용
    navigate(`/post/${postId}`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <BoardContainer>
      <BoardHeader>
        <Title>
          {category ? `${category.name}` : '전체 게시글'} 
          {category && <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>{category.description}</div>}
        </Title>
        <WriteButton to={categoryId ? `/write/${categoryId}` : "/write"}>글쓰기</WriteButton>
      </BoardHeader>
      
      <Table>
        <thead>
          <tr>
            <Th>번호</Th>
            <Th>제목</Th>
            <Th>작성자</Th>
            <Th>작성일</Th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts.map((post) => (
              <ClickableRow key={post.id} onClick={() => handleRowClick(post.id)}>
                <Td>{post.id}</Td>
                <Td>
                  {post.title}
                  {!categoryId && post.categoryName && (
                    <CategoryLabel>{post.categoryName}</CategoryLabel>
                  )}
                </Td>
                <Td>{post.author}</Td>
                <Td>{new Date(post.createdDate).toLocaleDateString()}</Td>
              </ClickableRow>
            ))
          ) : (
            <tr>
              <Td colSpan="4" style={{ textAlign: 'center' }}>
                게시글이 없습니다.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
    </BoardContainer>
  );
};

export default BoardList;