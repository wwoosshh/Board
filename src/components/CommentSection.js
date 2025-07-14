import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchComments, createComment, updateComment, deleteComment } from '../api/CommentApi';
import { isAuthenticated, getCurrentUser, isModeratorOrAbove } from '../api/AuthApi';

// 스타일 컴포넌트들
const CommentSectionContainer = styled.div`
  margin-top: 40px;
  border-top: 1px solid #ddd;
  padding-top: 30px;
`;

const CommentTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
`;

const CommentForm = styled.form`
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  margin-bottom: 10px;
`;

const CommentButton = styled.button`
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(CommentButton)`
  background-color: #6c757d;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const CommentList = styled.div`
  space-y: 20px;
`;

const CommentItem = styled.div`
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: white;
  margin-left: ${props => props.isReply ? '30px' : '0'};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorNickname = styled.span`
  font-weight: bold;
  color: #333;
  margin-right: 10px;
`;

const CommentDate = styled.span`
  color: #666;
  font-size: 12px;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  
  &.reply {
    background-color: #2196F3;
    color: white;
  }
  
  &.edit {
    background-color: #ff9800;
    color: white;
  }
  
  &.delete {
    background-color: #f44336;
    color: white;
  }
  
  &:hover {
    opacity: 0.8;
  }
`;

const CommentContent = styled.div`
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  margin-bottom: 10px;
`;

const ReplyForm = styled.div`
  margin-top: 15px;
  padding: 15px;
  background-color: #f0f8ff;
  border-radius: 4px;
  border-left: 3px solid #2196F3;
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #666;
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

  // 댓글과 대댓글을 재귀적으로 렌더링
  const renderComment = (comment, isReply = false) => (
    <CommentItem key={comment.id} isReply={isReply}>
      <CommentHeader>
        <CommentAuthor>
          <AuthorNickname>{comment.userNickname}</AuthorNickname>
          <CommentDate>
            {new Date(comment.createdDate).toLocaleString()}
            {comment.modifiedDate !== comment.createdDate && ' (수정됨)'}
          </CommentDate>
        </CommentAuthor>
        
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
      </CommentHeader>

      {editingCommentId === comment.id ? (
        <CommentForm onSubmit={(e) => { e.preventDefault(); handleUpdateComment(comment.id); }}>
          <CommentTextarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            placeholder="댓글을 수정하세요..."
          />
          <div>
            <CommentButton type="submit" disabled={loading}>
              수정 완료
            </CommentButton>
            <CancelButton type="button" onClick={cancelEdit}>
              취소
            </CancelButton>
          </div>
        </CommentForm>
      ) : (
        <CommentContent>{comment.content}</CommentContent>
      )}

      {/* 대댓글 표시 */}
      {comment.children && comment.children.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          {comment.children.map(child => renderComment(child, true))}
        </div>
      )}

      {/* 답글 작성 폼 */}
      {replyingToId === comment.id && (
        <ReplyForm>
          <form onSubmit={handleCreateReply}>
            <CommentTextarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 작성하세요..."
              rows={3}
            />
            <div>
              <CommentButton type="submit" disabled={loading || !replyContent.trim()}>
                답글 작성
              </CommentButton>
              <CancelButton type="button" onClick={cancelReply}>
                취소
              </CancelButton>
            </div>
          </form>
        </ReplyForm>
      )}
    </CommentItem>
  );

  return (
    <CommentSectionContainer>
      <CommentTitle>댓글 ({comments.length})</CommentTitle>
      
      {authenticated ? (
        <CommentForm onSubmit={handleCreateComment}>
          <CommentTextarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성하세요..."
          />
          <CommentButton type="submit" disabled={loading || !newComment.trim()}>
            댓글 작성
          </CommentButton>
        </CommentForm>
      ) : (
        <LoginPrompt>
          댓글을 작성하려면 로그인이 필요합니다.
        </LoginPrompt>
      )}

      <CommentList>
        {comments.map(comment => renderComment(comment))}
        {comments.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            첫 댓글을 작성해보세요!
          </div>
        )}
      </CommentList>
    </CommentSectionContainer>
  );
};

export default CommentSection;