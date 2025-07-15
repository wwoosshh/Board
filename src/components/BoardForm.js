import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPost, createPost, updatePost, fetchCategories } from '../api/BoardApi';
import { getCurrentUser } from '../api/AuthApi';
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

const FormContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  background: ${colors.light};
  min-height: calc(100vh - 70px);
`;

const FormCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 20px;
  box-shadow: 0 10px 40px ${colors.shadow};
  border: 1px solid ${colors.border};
  overflow: hidden;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${colors.gradient};
  }
`;

const FormHeader = styled.div`
  padding: 30px 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid ${colors.border};
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

const PageTitle = styled.h1`
  font-size: 32px;
  color: ${colors.dark};
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:before {
    content: '${props => props.isEdit ? '✏️' : '✍️'}';
    font-size: 28px;
  }
`;

const PageSubtitle = styled.p`
  color: ${colors.secondary};
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const AuthorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(66, 99, 235, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(66, 99, 235, 0.1);
  min-width: 250px;
`;

const AuthorAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.gradient};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: ${colors.dark};
  font-size: 16px;
`;

const AuthorRole = styled.div`
  font-size: 12px;
  color: white;
  background: ${props => {
    switch (props.role) {
      case 'ROLE_MANAGER': return colors.danger;
      case 'ROLE_ADMIN': return colors.warning;
      case 'ROLE_MODERATOR': return colors.success;
      default: return colors.primary;
    }
  }};
  padding: 2px 8px;
  border-radius: 8px;
  display: inline-block;
  font-weight: 600;
`;

const Form = styled.form`
  padding: 40px;
`;

const FormSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  color: ${colors.dark};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '${props => props.icon}';
    font-size: 16px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 20px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${colors.dark};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Required = styled.span`
  color: ${colors.danger};
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${colors.border};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: ${colors.secondary};
    font-weight: 400;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${colors.border};
  border-radius: 12px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
    transform: translateY(-2px);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 20px;
  border: 2px solid ${colors.border};
  border-radius: 12px;
  min-height: 400px;
  font-size: 16px;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.3s ease;
  background: white;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
  }
  
  &::placeholder {
    color: ${colors.secondary};
  }
`;

const WritingTools = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${colors.light};
  border-radius: 8px;
  border: 1px solid ${colors.border};
  flex-wrap: wrap;
`;

const ToolButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: white;
  color: ${colors.secondary};
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid ${colors.border};
  
  &:hover {
    background: ${colors.primary};
    color: white;
    border-color: ${colors.primary};
  }
`;

const CharCount = styled.div`
  margin-left: auto;
  color: ${colors.secondary};
  font-size: 12px;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid ${colors.border};
`;

const PreviewMode = styled.div`
  margin-top: 16px;
  padding: 20px;
  background: white;
  border: 2px dashed ${colors.border};
  border-radius: 12px;
  min-height: 200px;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.border};
`;

const PreviewTitle = styled.h4`
  margin: 0;
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 600;
`;

const HelpText = styled.div`
  color: ${colors.secondary};
  font-size: 12px;
  margin-top: 8px;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  gap: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
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
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:before {
    content: '${props => props.isEdit ? '💾' : '📝'}';
    font-size: 14px;
  }
`;

const CancelButton = styled(Button)`
  background: ${colors.light};
  color: ${colors.secondary};
  border: 2px solid ${colors.border};
  
  &:hover {
    background: ${colors.border};
    color: ${colors.dark};
  }
  
  &:before {
    content: '❌';
    font-size: 14px;
  }
`;

const PreviewButton = styled(Button)`
  background: ${colors.accent};
  color: white;
  
  &:hover:not(:disabled) {
    background: #fd7e14;
    box-shadow: 0 6px 20px rgba(245, 159, 0, 0.4);
  }
  
  &:before {
    content: '👁️';
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 40px ${colors.shadow};
  border: 1px solid ${colors.border};
  
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    // 작성자는 서버에서 자동으로 설정됨 (현재 로그인한 사용자의 닉네임)
    const submitData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      categoryId: formData.categoryId
    };

    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
      navigate(isEdit ? `/post/${id}` : '/');
    }
  };

  const insertText = (before, after = '') => {
    const textarea = document.querySelector('textarea[name="content"]');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    const newText = formData.content.substring(0, start) + 
                   before + selectedText + after + 
                   formData.content.substring(end);
    
    setFormData(prev => ({ ...prev, content: newText }));
    
    // 커서 위치 복원
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
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

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = (user) => {
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <FormContainer>
        <LoadingCard>
          <LoadingSpinner style={{ margin: '0 auto 16px auto' }} />
          <div>데이터를 불러오는 중...</div>
        </LoadingCard>
      </FormContainer>
    );
  }

  if (error) {
    return (
      <FormContainer>
        <LoadingCard style={{ borderColor: colors.danger, color: colors.danger }}>
          <div>❌ {error}</div>
        </LoadingCard>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormCard>
        <FormHeader>
          <HeaderContent>
            <TitleSection>
              <PageTitle isEdit={isEdit}>
                {isEdit ? '게시글 수정' : '새 게시글 작성'}
              </PageTitle>
              <PageSubtitle>
                {isEdit 
                  ? '게시글 내용을 수정하고 저장해주세요.' 
                  : '커뮤니티 규칙을 준수하여 게시글을 작성해주세요.'
                }
              </PageSubtitle>
            </TitleSection>
            
            <AuthorCard>
              <AuthorAvatar>{getUserInitial(currentUser)}</AuthorAvatar>
              <AuthorInfo>
                <AuthorName>
                  {currentUser?.nickname || currentUser?.name || currentUser?.username}
                </AuthorName>
                <AuthorRole role={currentUser?.role}>
                  {getRoleDisplayName(currentUser?.role)}
                </AuthorRole>
              </AuthorInfo>
            </AuthorCard>
          </HeaderContent>
        </FormHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle icon="📋">기본 정보</SectionTitle>
            <FormRow columns="2fr 1fr">
              <FormGroup>
                <Label htmlFor="title">
                  제목 <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
                <HelpText>
                  명확하고 간결한 제목을 작성해주세요. (최대 100자)
                </HelpText>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="categoryId">
                  게시판 <Required>*</Required>
                </Label>
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
                <HelpText>
                  적절한 게시판을 선택해주세요.
                </HelpText>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <SectionTitle icon="✍️">내용 작성</SectionTitle>
            
            <WritingTools>
              <ToolButton type="button" onClick={() => insertText('**', '**')}>
                굵게
              </ToolButton>
              <ToolButton type="button" onClick={() => insertText('*', '*')}>
                기울임
              </ToolButton>
              <ToolButton type="button" onClick={() => insertText('`', '`')}>
                코드
              </ToolButton>
              <ToolButton type="button" onClick={() => insertText('> ')}>
                인용
              </ToolButton>
              <ToolButton type="button" onClick={() => insertText('- ')}>
                목록
              </ToolButton>
              <ToolButton type="button" onClick={() => insertText('\n---\n')}>
                구분선
              </ToolButton>
              <CharCount>
                {formData.content.length} / 10,000자
              </CharCount>
            </WritingTools>
            
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="게시글 내용을 입력하세요...

💡 마크다운 문법 예시:
**굵은 텍스트**, *기울임 텍스트*
> 인용문입니다
- 목록 항목
`인라인 코드`

```
코드 블록
여러 줄의 코드를 입력할 수 있습니다
```

# 제목
## 부제목

[링크 텍스트](https://example.com)
---
구분선"
              maxLength={10000}
            />
            
            <HelpText>
              마크다운 문법을 지원합니다:<br/>
              • **굵게**, *기울임*, `코드`, 인용문<br/>
              • # 제목, - 목록, [링크](URL), --- 구분선<br/>
              • ```로 코드 블록 감싸기 가능
            </HelpText>
            
            {showPreview && (
              <PreviewMode>
                <PreviewHeader>
                  <PreviewTitle>미리보기</PreviewTitle>
                </PreviewHeader>
                {formData.content ? (
                  <MarkdownRenderer content={formData.content} />
                ) : (
                  <div style={{ color: colors.secondary, fontStyle: 'italic' }}>
                    내용을 입력하면 여기에 미리보기가 표시됩니다.
                  </div>
                )}
              </PreviewMode>
            )}
          </FormSection>
          
          <ButtonGroup>
            <CancelButton type="button" onClick={handleCancel}>
              취소하기
            </CancelButton>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <PreviewButton 
                type="button" 
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? '편집 모드' : '미리보기'}
              </PreviewButton>
              
              <SubmitButton type="submit" disabled={submitting} isEdit={isEdit}>
                {submitting ? (
                  <>
                    <LoadingSpinner />
                    {isEdit ? '수정 중...' : '등록 중...'}
                  </>
                ) : (
                  isEdit ? '수정하기' : '등록하기'
                )}
              </SubmitButton>
            </div>
          </ButtonGroup>
        </Form>
      </FormCard>
    </FormContainer>
  );
};

export default BoardForm;