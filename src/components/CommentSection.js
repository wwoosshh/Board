import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchComments, createComment, updateComment, deleteComment } from '../api/CommentApi';
import { isAuthenticated, getCurrentUser, isModeratorOrAbove } from '../api/AuthApi';
import MarkdownRenderer from './MarkdownRenderer';

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

const CommentSectionContainer = styled.section`
  background: ${colors.cardBg};
  border-radius: 16px;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.border};
  overflow: hidden;
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

const CommentHeader = styled.div`
  padding: 24px 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid ${colors.border};
`;

const CommentTitle = styled.h3`
  color: ${colors.dark};
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:before {
    content: '💬';
    font-size: 18px;
  }
`;

const CommentCount = styled.span`
  color: ${colors.primary};
  font-weight: 600;
`;

const CommentForm = styled.form`
  padding: 24px 30px;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.light};
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${colors.gradient};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const FormUserInfo = styled.div`
  color: ${colors.dark};
  font-weight: 600;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid ${colors.border};
  border-radius: 12px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
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

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const CharCount = styled.div`
  color: ${colors.secondary};
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
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
  gap: 6px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SubmitButton = styled(Button)`
  background: ${colors.gradient};
  color: white;
  
  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  &:before {
    content: '📝';
    font-size: 12px;
  }
`;

const CancelButton = styled(Button)`
  background: ${colors.light};
  color: ${colors.secondary};
  border: 1px solid ${colors.border};
  
  &:hover {
    background: ${colors.border};
    color: ${colors.dark};
  }
`;

const CommentList = styled.div`
  padding: 0 0 24px 0;
`;

const CommentItem = styled.div`
  padding: 24px 30px;
  border-bottom: 1px solid ${colors.border};
  margin-left: ${props => props.isReply ? '60px' : '0'};
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(66, 99, 235, 0.02);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.isReply && `
    &:before {
      content: '';
      position: absolute;
      left: -30px;
      top: 24px;
      width: 20px;
      height: 1px;
      background: ${colors.border};
    }
    
    &:after {
      content: '';
      position: absolute;
      left: -30px;
      top: 24px;
      width: 1px;
      height: calc(100% - 24px);
      background: ${colors.border};
    }
  `}
`;

const CommentHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
`;

const CommentAuthorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const CommentAuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const CommentAuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AuthorNickname = styled.span`
  font-weight: 600;
  color: ${colors.dark};
  font-size: 14px;
`;

const CommentDate = styled.span`
  color: ${colors.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:before {
    content: '🕒';
    font-size: 10px;
  }
`;

const CommentActions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &.reply {
    background: rgba(66, 99, 235, 0.1);
    color: ${colors.primary};
    
    &:hover {
      background: rgba(66, 99, 235, 0.2);
    }
  }
  
  &.edit {
    background: rgba(245, 159, 0, 0.1);
    color: ${colors.accent};
    
    &:hover {
      background: rgba(245, 159, 0, 0.2);
    }
  }
  
  &.delete {
    background: rgba(255, 107, 107, 0.1);
    color: ${colors.danger};
    
    &:hover {
      background: rgba(255, 107, 107, 0.2);
    }
  }
`;

const CommentContent = styled.div`
  margin-bottom: 12px;
  
  /* MarkdownRenderer가 적용될 영역입니다 */
`;

const ReplyForm = styled.div`
  margin-top: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid ${colors.border};
  border-left: 4px solid ${colors.primary};
`;

const ReplyFormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: ${colors.primary};
  font-weight: 600;
  font-size: 14px;
  
  &:before {
    content: '↳';
    font-size: 16px;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 40px 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  color: ${colors.secondary};
  border-bottom: 1px solid ${colors.border};
`;

const LoginPromptIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const LoginPromptText = styled.div`
  font-size: 16px;
  margin-bottom: 12px;
`;

const LoginButton = styled.button`
  background: ${colors.gradient};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 30px;
  color: ${colors.secondary};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

// CommentSection 컴포넌트
const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await fetchComments(postId);
      setComments(data);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await createComment(postId, { content: newComment.trim() });
      setNewComment('');
      loadComments();
    } catch (error) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setLoading(true);
    try {
      await createComment(postId, { 
        content: replyContent.trim(),
        parentId: replyingToId 
      });
      setReplyContent('');
      setReplyingToId(null);
      loadComments();
    } catch (error) {
      alert('대댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;
    
    setLoading(true);
    try {
      await updateComment(commentId, { content: editingContent.trim() });
      setEditingCommentId(null);
      setEditingContent('');
      loadComments();
    } catch (error) {
      alert('댓글 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('정말로 댓글을 삭제하시겠습니까?')) return;
    
    try {
      await deleteComment(commentId);
      loadComments();
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const canModifyComment = (comment) => {
    if (!authenticated || !currentUser) return false;
    
    // 본인 댓글이거나 관리자 이상 권한
    return comment.userId === currentUser.id || isModeratorOrAbove();
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const startReply = (commentId) => {
    setReplyingToId(commentId);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyingToId(null);
    setReplyContent('');
  };

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = (nickname) => {
    return nickname?.charAt(0).toUpperCase() || 'U';
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

  // 댓글과 대댓글을 재귀적으로 렌더링
  const renderComment = (comment, isReply = false) => (
    <CommentItem key={comment.id} isReply={isReply}>
      <CommentHeader2>
        <CommentAuthorSection>
          <CommentAuthorAvatar>
            {getUserInitial(comment.userNickname)}
          </CommentAuthorAvatar>
          <CommentAuthorInfo>
            <AuthorNickname>{comment.userNickname}</AuthorNickname>
            <CommentDate>
              {getRelativeTime(comment.createdDate)}
              {comment.modifiedDate !== comment.createdDate && ' (수정됨)'}
            </CommentDate>
          </CommentAuthorInfo>
        </CommentAuthorSection>
        
        {authenticated && (
          <CommentActions>
            {!isReply && (
              <ActionButton 
                className="reply" 
                onClick={() => startReply(comment.id)}
              >
                답글
              </ActionButton>
            )}
            
            {canModifyComment(comment) && !comment.deleted && (
              <>
                <ActionButton 
                  className="edit" 
                  onClick={() => startEdit(comment)}
                >
                  수정
                </ActionButton>
                <ActionButton 
                  className="delete" 
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  삭제
                </ActionButton>
              </>
            )}
          </CommentActions>
        )}
      </CommentHeader2>

      {editingCommentId === comment.id ? (
        <CommentForm onSubmit={(e) => { e.preventDefault(); handleUpdateComment(comment.id); }}>
          <CommentTextarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            placeholder="댓글을 수정하세요... (마크다운 사용 가능)"
          />
          <FormActions>
            <CharCount>{editingContent.length} / 1000</CharCount>
            <ButtonGroup>
              <SubmitButton type="submit" disabled={loading || !editingContent.trim()}>
                수정 완료
              </SubmitButton>
              <CancelButton type="button" onClick={cancelEdit}>
                취소
              </CancelButton>
            </ButtonGroup>
          </FormActions>
        </CommentForm>
      ) : (
        <CommentContent>
          <MarkdownRenderer 
            content={comment.content}
            style={{ fontSize: '14px' }}
          />
        </CommentContent>
      )}

      {/* 대댓글 표시 */}
      {comment.children && comment.children.length > 0 && (
        <div>
          {comment.children.map(child => renderComment(child, true))}
        </div>
      )}

      {/* 답글 작성 폼 */}
      {replyingToId === comment.id && (
        <ReplyForm>
          <ReplyFormHeader>
            {comment.userNickname}님에게 답글 작성
          </ReplyFormHeader>
          <form onSubmit={handleCreateReply}>
            <CommentTextarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 작성하세요... (마크다운 사용 가능: **굵게**, *기울임*, `코드`)"
              rows={3}
            />
            <FormActions>
              <CharCount>{replyContent.length} / 1000</CharCount>
              <ButtonGroup>
                <SubmitButton type="submit" disabled={loading || !replyContent.trim()}>
                  답글 작성
                </SubmitButton>
                <CancelButton type="button" onClick={cancelReply}>
                  취소
                </CancelButton>
              </ButtonGroup>
            </FormActions>
          </form>
        </ReplyForm>
      )}
    </CommentItem>
  );

  return (
    <CommentSectionContainer>
      <CommentHeader>
        <CommentTitle>
          댓글 <CommentCount>({comments.length})</CommentCount>
        </CommentTitle>
      </CommentHeader>
      
      {authenticated ? (
        <CommentForm onSubmit={handleCreateComment}>
          <FormHeader>
            <UserAvatar>{getUserInitial(currentUser?.username)}</UserAvatar>
            <FormUserInfo>{currentUser?.username}</FormUserInfo>
          </FormHeader>
          <CommentTextarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성하세요... 

마크다운 사용 가능: **굵게**, *기울임*, `코드`, > 인용문
서로를 존중하는 댓글 문화를 만들어주세요."
            maxLength={1000}
          />
          <FormActions>
            <CharCount>{newComment.length} / 1000</CharCount>
            <SubmitButton type="submit" disabled={loading || !newComment.trim()}>
              댓글 등록
            </SubmitButton>
          </FormActions>
        </CommentForm>
      ) : (
        <LoginPrompt>
          <LoginPromptIcon>🔒</LoginPromptIcon>
          <LoginPromptText>댓글을 작성하려면 로그인이 필요합니다</LoginPromptText>
          <LoginButton onClick={() => window.location.href = '/login'}>
            로그인하기
          </LoginButton>
        </LoginPrompt>
      )}

      <CommentList>
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText>첫 댓글을 작성해보세요!</EmptyText>
          </EmptyState>
        )}
      </CommentList>
    </CommentSectionContainer>
  );
};

export default CommentSection;