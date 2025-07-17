// src/components/BoardForm.js (향상된 미디어 첨부 기능 추가)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPost, fetchCategories } from '../api/BoardApi';
import { createPostWithFiles, updatePostWithFiles } from '../api/FileApi';
import { uploadFile } from '../api/FileApi'; // 단일 파일 업로드 함수 추가
import { getCurrentUser } from '../api/AuthApi';
import MarkdownRenderer from './MarkdownRenderer';
import FileUploader from './FileUploader';
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
    content: '${props => props.$isEdit ? '✏️' : '✍️'}';
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
    switch (props.$role) {
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
    content: '${props => props.$icon}';
    font-size: 16px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || '1fr'};
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
const InstructionCard = styled.div`
  background: linear-gradient(135deg, rgba(66, 99, 235, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(66, 99, 235, 0.15);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InstructionTitle = styled.h4`
  color: ${colors.primary};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '💡';
    font-size: 18px;
  }
`;

const InstructionList = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: ${colors.secondary};
  
  li {
    margin: 8px 0;
    line-height: 1.6;
    
    &::marker {
      color: ${colors.primary};
      font-weight: 600;
    }
  }
`;

const StepHighlight = styled.span`
  background: rgba(245, 159, 0, 0.1);
  color: ${colors.accent};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
`;

const TipBox = styled.div`
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  &:before {
    content: '💡';
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const TipText = styled.div`
  color: ${colors.success};
  font-size: 14px;
  line-height: 1.5;
  
  strong {
    font-weight: 600;
  }
`;

const QuickActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  background: ${colors.light};
  color: ${colors.primary};
  border: 1px solid ${colors.border};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: rgba(66, 99, 235, 0.1);
    border-color: ${colors.primary};
  }
  
  &:before {
    content: '${props => props.$icon}';
    font-size: 12px;
  }
`;

const ProgressSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    height: 2px;
    background: ${colors.border};
    z-index: 0;
  }
`;

const ProgressStep = styled.div`
  background: ${props => props.$active ? colors.primary : colors.light};
  color: ${props => props.$active ? 'white' : colors.secondary};
  border: 2px solid ${props => props.$active ? colors.primary : colors.border};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
`;

const StepLabel = styled.div`
  position: absolute;
  top: 35px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: ${colors.secondary};
  white-space: nowrap;
  font-weight: 500;
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

const MediaToolButton = styled(ToolButton)`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${colors.accent};
  color: white;
  border-color: ${colors.accent};
  
  &:hover {
    background: #fd7e14;
    border-color: #fd7e14;
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
    content: '${props => props.$isEdit ? '💾' : '📝'}';
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

const AttachmentSection = styled.div`
  margin: 24px 0;
`;

const ErrorMessage = styled.div`
  color: ${colors.danger};
  font-size: 14px;
  margin: 16px 0;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
`;

const SuccessMessage = styled.div`
  color: ${colors.success};
  font-size: 14px;
  margin: 16px 0;
  padding: 12px;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(81, 207, 102, 0.2);
`;

const FileInputHidden = styled.input`
  display: none;
`;

const MediaPreviewContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${colors.light};
  border-radius: 8px;
  border: 1px solid ${colors.border};
`;

const MediaPreviewTitle = styled.h4`
  font-size: 14px;
  margin: 0 0 16px 0;
  color: ${colors.dark};
`;

const MediaPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const MediaItem = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${colors.shadow};
  }
`;

const MediaItemImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
`;

const MediaItemTitle = styled.div`
  font-size: 11px;
  padding: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  color: ${colors.secondary};
`;

const MediaUploadProgress = styled.div`
  height: 4px;
  background: ${colors.border};
  width: 100%;
  overflow: hidden;
  margin-top: 8px;
`;

const MediaUploadProgressBar = styled.div`
  height: 100%;
  background: ${colors.primary};
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const MediaTypeGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const MediaTypeTab = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.$active ? colors.primary : colors.light};
  color: ${props => props.$active ? 'white' : colors.secondary};
  
  &:hover {
    background: ${props => props.$active ? colors.primary : colors.border};
  }
`;

const MediaInsertModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const MediaInsertModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const MediaInsertModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MediaInsertModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: ${colors.dark};
`;

const MediaInsertModalClose = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${colors.secondary};
  
  &:hover {
    color: ${colors.danger};
  }
`;

const MediaInsertModalBody = styled.div`
  padding: 24px;
`;

const MediaInsertFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const FileDropZone = styled.div`
  border: 2px dashed ${colors.border};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$isDragging ? `rgba(66, 99, 235, 0.05)` : 'transparent'};
  
  &:hover {
    border-color: ${colors.primary};
    background: rgba(66, 99, 235, 0.02);
  }
`;

const FileDropIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.secondary};
`;

const FileDropText = styled.div`
  color: ${colors.secondary};
  margin-bottom: 16px;
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
  const [success, setSuccess] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // 파일 업로드 관련 상태
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
  
  // 이미지 삽입 관련 상태
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [selectedMediaType, setSelectedMediaType] = useState('image');
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const mediaFileInputRef = useRef(null);
  const textareaRef = useRef(null);

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
          
          // 기존 첨부파일 설정
          if (postData.attachments && postData.attachments.length > 0) {
            setExistingAttachments(postData.attachments);
            
            // 이미 마크다운에 삽입된 이미지 URL들을 uploadedMedia에 추가
            const imageUrls = extractImageUrlsFromMarkdown(postData.content);
            const mediaItems = postData.attachments
              .filter(a => a.fileCategory === 'IMAGE' || a.fileCategory === 'VIDEO')
              .map(a => ({
                id: a.id,
                url: a.fileUrl,
                name: a.originalFileName,
                type: a.fileCategory.toLowerCase()
              }));
            
            setUploadedMedia(mediaItems);
          }
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

  // 마크다운에서 이미지 URL 추출하는 함수
  const extractImageUrlsFromMarkdown = (markdown) => {
    const regex = /!\[.*?\]\((.*?)\)/g;
    const urls = [];
    let match;
    
    while ((match = regex.exec(markdown)) !== null) {
      urls.push(match[1]);
    }
    
    return urls;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 간단한 유효성 검사
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.categoryId) {
      setError('게시판을 선택해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    // 작성자는 서버에서 자동으로 설정됨 (현재 로그인한 사용자의 닉네임)
    setSubmitting(true);

    try {
      if (isEdit) {
        // 수정 모드: 게시글 업데이트 (첨부파일 포함)
        await updatePostWithFiles(id, formData, files, attachmentsToDelete);
        alert('게시글이 수정되었습니다.');
      } else {
        // 작성 모드: 새 게시글 생성 (첨부파일 포함)
        await createPostWithFiles(formData, files);
        alert('게시글이 등록되었습니다.');
      }
      navigate(formData.categoryId ? `/category/${formData.categoryId}` : '/');
    } catch (err) {
      setError(isEdit ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 등록 중 오류가 발생했습니다.');
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
    const textarea = textareaRef.current;
    if (!textarea) return;
    
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
  
  // 기존 첨부파일 삭제 처리
  const handleRemoveExistingAttachment = (attachmentId) => {
    if (!attachmentId) return;
    
    // 삭제할 첨부파일 ID 목록에 추가
    setAttachmentsToDelete(prev => [...prev, attachmentId]);
    
    // 화면에서 제거
    setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
    
    // uploadedMedia에서도 제거
    setUploadedMedia(prev => prev.filter(media => media.id !== attachmentId));
  };
  
  // 미디어 모달 열기
  const openMediaModal = () => {
    setShowMediaModal(true);
  };
  
  // 미디어 모달 닫기
  const closeMediaModal = () => {
    setShowMediaModal(false);
  };
  
  // 파일 입력 창 열기
  const triggerFileInput = () => {
    mediaFileInputRef.current.click();
  };

  // 파일 업로드 지연 함수 (서버 부하 방지)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// 미디어 파일 업로드 처리 함수
const handleMediaFileChange = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  console.log(`📤 총 ${files.length}개 파일 업로드 시작`);
  
  // 파일 유효성 검사
  const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  const validFiles = files.filter(file => {
    if (selectedMediaType === 'image' && !supportedImageTypes.includes(file.type)) {
      alert(`지원되지 않는 이미지 형식입니다: ${file.type}`);
      return false;
    }
    
    if (selectedMediaType === 'video' && !supportedVideoTypes.includes(file.type)) {
      alert(`지원되지 않는 동영상 형식입니다: ${file.type}`);
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      alert(`파일 크기가 너무 큽니다: ${file.name}`);
      return false;
    }
    
    return true;
  });
  
  if (validFiles.length === 0) return;
  
  // 파일 업로드 진행
  setUploadingMedia(true);
  setUploadProgress(0);
  
  try {
    const progressStep = 100 / validFiles.length;
    const newMedia = [];
    const failedFiles = [];
    
    // 순차적으로 파일 업로드 (동시 업로드 방지)
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        console.log(`📤 파일 ${i + 1}/${validFiles.length} 업로드 시작: ${file.name}`);
        
        // 파일 업로드 전 잠시 대기 (서버 부하 방지)
        if (i > 0) {
          await delay(500); // 0.5초 대기
        }
        
        // 파일 업로드 API 호출
        const response = await uploadFile(file);
        console.log(`✅ 파일 ${i + 1} 업로드 완료:`, response);
        
        // 백엔드 응답 구조 확인 및 처리
        if (response && response.fileName) {
          const isImage = supportedImageTypes.includes(file.type);
          const isVideo = supportedVideoTypes.includes(file.type);
          
          // 파일명 안전성 검사 (특수 문자 제거)
          const safeFileName = response.fileName.replace(/[<>:"/\\|?*]/g, '_');
          
          // 올바른 URL 경로 생성
          const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5159';
          const fileUrl = `${baseUrl}/api/files/temp/${safeFileName}`;
          
          console.log(`🖼️ 생성된 파일 URL: ${fileUrl}`);
          
          // 업로드 성공 시 미디어 목록에 추가
          newMedia.push({
            id: Date.now() + i + Math.random(), // 고유 ID 생성
            url: fileUrl,
            fileName: safeFileName,
            name: file.name,
            type: isImage ? 'image' : 'video',
            size: file.size,
            uploadedAt: new Date().toISOString(),
            originalResponse: response
          });
          
          console.log(`✅ 파일 ${i + 1} 처리 완료`);
        } else {
          throw new Error(`서버 응답이 올바르지 않습니다: ${JSON.stringify(response)}`);
        }
        
      } catch (fileError) {
        console.error(`❌ 파일 ${i + 1} 업로드 실패: ${file.name}`, fileError);
        
        failedFiles.push({
          name: file.name,
          error: fileError.message,
          status: fileError.response?.status
        });
        
        // 403 오류인 경우 특별 처리
        if (fileError.response?.status === 403) {
          console.warn(`🚫 파일 ${i + 1} - 403 Forbidden 오류 발생`);
          
          // 잠시 더 대기 후 재시도
          await delay(1000);
          
          try {
            console.log(`🔄 파일 ${i + 1} 재시도 중...`);
            const retryResponse = await uploadFile(file);
            
            if (retryResponse && retryResponse.fileName) {
              const isImage = supportedImageTypes.includes(file.type);
              const safeFileName = retryResponse.fileName.replace(/[<>:"/\\|?*]/g, '_');
              const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5159';
              const fileUrl = `${baseUrl}/api/files/temp/${safeFileName}`;
              
              newMedia.push({
                id: Date.now() + i + Math.random(),
                url: fileUrl,
                fileName: safeFileName,
                name: file.name,
                type: isImage ? 'image' : 'video',
                size: file.size,
                uploadedAt: new Date().toISOString(),
                originalResponse: retryResponse
              });
              
              console.log(`✅ 파일 ${i + 1} 재시도 성공`);
              
              // 실패 목록에서 제거
              const failedIndex = failedFiles.findIndex(f => f.name === file.name);
              if (failedIndex > -1) {
                failedFiles.splice(failedIndex, 1);
              }
            }
          } catch (retryError) {
            console.error(`❌ 파일 ${i + 1} 재시도도 실패:`, retryError);
          }
        }
      }
      
      // 진행률 업데이트
      setUploadProgress((i + 1) * progressStep);
    }
    
    // 업로드된 미디어 목록에 추가
    if (newMedia.length > 0) {
      setUploadedMedia(prev => [...prev, ...newMedia]);
      
      // 성공 메시지 표시
      const successCount = newMedia.length;
      const totalCount = validFiles.length;
      
      if (successCount === totalCount) {
        setSuccess(`${successCount}개의 ${selectedMediaType === 'image' ? '이미지' : '동영상'}가 모두 업로드되었습니다.`);
      } else {
        setSuccess(`${successCount}개의 파일이 업로드되었습니다. (${totalCount - successCount}개 실패)`);
      }
      
      console.log(`✅ 최종 업로드 완료: ${successCount}/${totalCount}`);
    }
    
    // 실패한 파일들에 대한 오류 메시지
    if (failedFiles.length > 0) {
      console.error('❌ 업로드 실패한 파일들:', failedFiles);
      
      const failedFileNames = failedFiles.map(f => f.name).join(', ');
      setError(`다음 파일들의 업로드가 실패했습니다: ${failedFileNames}`);
      
      // 403 오류가 많은 경우 특별한 안내
      const forbidden403Count = failedFiles.filter(f => f.status === 403).length;
      if (forbidden403Count > 0) {
        setError(prev => prev + '\n\n💡 팁: 파일을 하나씩 업로드하거나 잠시 후 다시 시도해보세요.');
      }
    }
    
  } catch (err) {
    console.error('❌ 전체 미디어 업로드 프로세스 오류:', err);
    setError('미디어 업로드 중 오류가 발생했습니다. 파일을 하나씩 업로드해보세요.');
  } finally {
    setUploadingMedia(false);
    setUploadProgress(0);
    e.target.value = ''; // 파일 입력 초기화
  }
};
  
  // 미디어 삽입
  const insertMedia = (media) => {
    let markdown = '';
    
    if (media.type === 'image') {
      markdown = `![${media.name}](${media.url})`;
    } else if (media.type === 'video') {
      markdown = `<video controls width="100%"><source src="${media.url}" type="video/mp4"></video>`;
    }
    
    if (markdown) {
      insertText(markdown);
      closeMediaModal();
    }
  };
  
  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  
  const files = Array.from(e.dataTransfer.files);
  if (files.length === 0) return;
  
  console.log(`📂 드롭된 파일들 (${files.length}개):`, files.map(f => f.name));
  
  // 파일 유효성 검사
  const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  const validFiles = files.filter(file => {
    const isImage = supportedImageTypes.includes(file.type);
    const isVideo = supportedVideoTypes.includes(file.type);
    
    if (!isImage && !isVideo) {
      alert(`지원되지 않는 파일 형식입니다: ${file.type}`);
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      alert(`파일 크기가 너무 큽니다: ${file.name}`);
      return false;
    }
    
    return true;
  });
  
  if (validFiles.length === 0) return;
  
  console.log(`✅ 드롭 유효한 파일들 (${validFiles.length}개):`, validFiles.map(f => f.name));
  
  // 파일 업로드 진행
  setUploadingMedia(true);
  setUploadProgress(0);
  
  try {
    const progressStep = 100 / validFiles.length;
    const newMedia = [];
    const failedFiles = [];
    
    // 순차적으로 파일 업로드 (드롭도 동일하게 처리)
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        console.log(`📤 드롭 파일 ${i + 1}/${validFiles.length} 업로드 시작: ${file.name}`);
        
        // 파일 업로드 전 잠시 대기
        if (i > 0) {
          await delay(500);
        }
        
        // 파일 업로드 API 호출
        const response = await uploadFile(file);
        console.log(`✅ 드롭 파일 ${i + 1} 업로드 완료:`, response);
        
        // 업로드된 미디어 정보 저장
        if (response && response.fileName) {
          const isImage = supportedImageTypes.includes(file.type);
          const safeFileName = response.fileName.replace(/[<>:"/\\|?*]/g, '_');
          const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5159';
          const fileUrl = `${baseUrl}/api/files/temp/${safeFileName}`;
          
          console.log(`🖼️ 드롭 파일 URL 생성: ${fileUrl}`);
          
          newMedia.push({
            id: Date.now() + i + Math.random(),
            url: fileUrl,
            fileName: safeFileName,
            name: file.name,
            type: isImage ? 'image' : 'video',
            size: file.size,
            uploadedAt: new Date().toISOString()
          });
        }
        
        // 진행률 업데이트
        setUploadProgress((i + 1) * progressStep);
        
      } catch (fileError) {
        console.error(`❌ 드롭 파일 ${i + 1} 업로드 실패: ${file.name}`, fileError);
        
        failedFiles.push({
          name: file.name,
          error: fileError.message,
          status: fileError.response?.status
        });
        
        // 403 오류인 경우 재시도
        if (fileError.response?.status === 403) {
          await delay(1000);
          
          try {
            const retryResponse = await uploadFile(file);
            if (retryResponse && retryResponse.fileName) {
              const isImage = supportedImageTypes.includes(file.type);
              const safeFileName = retryResponse.fileName.replace(/[<>:"/\\|?*]/g, '_');
              const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5159';
              const fileUrl = `${baseUrl}/api/files/temp/${safeFileName}`;
              
              newMedia.push({
                id: Date.now() + i + Math.random(),
                url: fileUrl,
                fileName: safeFileName,
                name: file.name,
                type: isImage ? 'image' : 'video',
                size: file.size,
                uploadedAt: new Date().toISOString()
              });
              
              const failedIndex = failedFiles.findIndex(f => f.name === file.name);
              if (failedIndex > -1) {
                failedFiles.splice(failedIndex, 1);
              }
            }
          } catch (retryError) {
            console.error(`❌ 드롭 파일 ${i + 1} 재시도 실패:`, retryError);
          }
        }
      }
    }
    
    // 업로드된 미디어 목록에 추가
    if (newMedia.length > 0) {
      setUploadedMedia(prev => [...prev, ...newMedia]);
      
      const successCount = newMedia.length;
      const totalCount = validFiles.length;
      
      if (successCount === totalCount) {
        setSuccess(`${successCount}개의 파일이 모두 업로드되었습니다.`);
      } else {
        setSuccess(`${successCount}개의 파일이 업로드되었습니다. (${totalCount - successCount}개 실패)`);
      }
      
      console.log(`✅ 드롭 파일 최종 업로드 완료: ${successCount}/${totalCount}`);
    }
    
    // 실패한 파일들에 대한 처리
    if (failedFiles.length > 0) {
      const failedFileNames = failedFiles.map(f => f.name).join(', ');
      setError(`다음 파일들의 업로드가 실패했습니다: ${failedFileNames}`);
    }
    
  } catch (err) {
    console.error('❌ 드롭 미디어 업로드 오류:', err);
    setError('미디어 업로드 중 오류가 발생했습니다.');
  } finally {
    setUploadingMedia(false);
    setUploadProgress(0);
  }
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

  return (
    <FormContainer>
      <FormCard>
        <FormHeader>
          <HeaderContent>
            <TitleSection>
              <PageTitle $isEdit={isEdit}>
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
                <AuthorRole $role={currentUser?.role}>
                  {getRoleDisplayName(currentUser?.role)}
                </AuthorRole>
              </AuthorInfo>
            </AuthorCard>
          </HeaderContent>
        </FormHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle $icon="📋">기본 정보</SectionTitle>
            <FormRow $columns="2fr 1fr">
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
            <SectionTitle $icon="✍️">내용 작성</SectionTitle>
            
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
              
              {/* 미디어 삽입 버튼 추가 */}
              <MediaToolButton type="button" onClick={openMediaModal}>
                📷 이미지/동영상 삽입
              </MediaToolButton>
              
              <CharCount>
                {formData.content.length} / 10,000자
              </CharCount>
            </WritingTools>
            
            <Textarea
              ref={textareaRef}
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

이미지는 상단의 '이미지/동영상 삽입' 버튼을 클릭하거나
에디터에 직접 드래그 앤 드롭으로 추가할 수 있습니다."
              maxLength={10000}
            />
            
            <HelpText>
              마크다운 문법을 지원합니다:<br/>
              • **굵게**, *기울임*, `코드`, 인용문<br/>
              • # 제목, - 목록, [링크](URL), --- 구분선<br/>
              • 이미지와 동영상은 상단의 '이미지/동영상 삽입' 버튼을 통해 첨부할 수 있습니다.
            </HelpText>
            
            {/* 성공/오류 메시지 */}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
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
          
          <AttachmentSection>
            <SectionTitle $icon="📎">첨부파일</SectionTitle>
            <HelpText>
              이미지나 동영상은 본문 중간에 삽입하는 것을 권장합니다. 여기에는 다운로드용 첨부파일만 추가해주세요.
            </HelpText>
            
            {/* 파일 업로더 컴포넌트 */}
            <FileUploader 
              files={files} 
              setFiles={setFiles} 
              maxFiles={5} 
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedTypes="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-zip-compressed"
            />
          </AttachmentSection>
          
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
              
              <SubmitButton type="submit" disabled={submitting} $isEdit={isEdit}>
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
      
      {/* 미디어 삽입 모달 */}
      {showMediaModal && (
        <MediaInsertModal>
          <MediaInsertModalContent>
            <MediaInsertModalHeader>
              <MediaInsertModalTitle>미디어 삽입</MediaInsertModalTitle>
              <MediaInsertModalClose onClick={closeMediaModal}>×</MediaInsertModalClose>
            </MediaInsertModalHeader>
            
            <MediaInsertModalBody>
              {/* 사용법 안내 카드 */}
              <InstructionCard>
                <InstructionTitle>미디어 삽입 사용법</InstructionTitle>
                
                <ProgressSteps>
                  <div style={{ position: 'relative' }}>
                    <ProgressStep $active={true}>1</ProgressStep>
                    <StepLabel>업로드</StepLabel>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <ProgressStep $active={uploadedMedia.length > 0}>2</ProgressStep>
                    <StepLabel>선택</StepLabel>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <ProgressStep $active={false}>3</ProgressStep>
                    <StepLabel>완료</StepLabel>
                  </div>
                </ProgressSteps>
                
                <InstructionList>
                  <li>
                    <StepHighlight>1단계</StepHighlight> 아래 업로드 영역에 이미지나 동영상 파일을 
                    <strong> 끌어다 놓거나</strong> 클릭하여 선택하세요
                  </li>
                  <li>
                    <StepHighlight>2단계</StepHighlight> 업로드가 완료되면 하단에 미디어 목록이 표시됩니다
                  </li>
                  <li>
                    <StepHighlight>3단계</StepHighlight> 원하는 미디어를 <strong>클릭</strong>하면 
                    자동으로 글 내용에 삽입됩니다
                  </li>
                </InstructionList>
                
                <TipBox>
                  <TipText>
                    <strong>💡 팁:</strong> 여러 개의 파일을 한 번에 업로드할 수 있습니다. 
                    각 미디어를 클릭할 때마다 현재 커서 위치에 삽입됩니다.
                  </TipText>
                </TipBox>
                
                <QuickActionButtons>
                  <QuickActionButton 
                    $icon="📷" 
                    onClick={() => setSelectedMediaType('image')}
                    style={{ 
                      background: selectedMediaType === 'image' ? 'rgba(66, 99, 235, 0.1)' : colors.light,
                      borderColor: selectedMediaType === 'image' ? colors.primary : colors.border
                    }}
                  >
                    이미지 모드
                  </QuickActionButton>
                  <QuickActionButton 
                    $icon="🎬" 
                    onClick={() => setSelectedMediaType('video')}
                    style={{ 
                      background: selectedMediaType === 'video' ? 'rgba(66, 99, 235, 0.1)' : colors.light,
                      borderColor: selectedMediaType === 'video' ? colors.primary : colors.border
                    }}
                  >
                    동영상 모드
                  </QuickActionButton>
                </QuickActionButtons>
              </InstructionCard>

              {/* 미디어 유형 선택 */}
              <MediaTypeGroup>
                <MediaTypeTab 
                  $active={selectedMediaType === 'image'} 
                  onClick={() => setSelectedMediaType('image')}
                >
                  📷 이미지
                </MediaTypeTab>
                <MediaTypeTab 
                  $active={selectedMediaType === 'video'} 
                  onClick={() => setSelectedMediaType('video')}
                >
                  🎬 동영상
                </MediaTypeTab>
              </MediaTypeGroup>
              
              {/* 파일 드롭존 */}
              <FileDropZone 
                onClick={triggerFileInput}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                $isDragging={isDragging}
              >
                <FileDropIcon>
                  {uploadingMedia ? '⏳' : isDragging ? '📥' : '📤'}
                </FileDropIcon>
                <FileDropText>
                  {uploadingMedia ? (
                    '업로드 중...'
                  ) : isDragging ? (
                    `${selectedMediaType === 'image' ? '이미지' : '동영상'} 파일을 여기에 놓으세요`
                  ) : (
                    <>
                      <strong>클릭하여 {selectedMediaType === 'image' ? '이미지' : '동영상'}를 선택</strong>하거나<br/>
                      여기에 파일을 끌어다 놓으세요
                    </>
                  )}
                </FileDropText>
                {!uploadingMedia && !isDragging && (
                  <Button>
                    {selectedMediaType === 'image' ? '이미지 선택' : '동영상 선택'}
                  </Button>
                )}
                <FileInputHidden
                  ref={mediaFileInputRef}
                  type="file"
                  accept={selectedMediaType === 'image' 
                    ? "image/jpeg,image/png,image/gif,image/webp" 
                    : "video/mp4,video/webm,video/ogg"}
                  onChange={handleMediaFileChange}
                  multiple
                />
              </FileDropZone>
              
              {/* 업로드 진행 상태 */}
              {uploadingMedia && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    marginBottom: '8px', 
                    color: colors.primary, 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📤</span>
                    업로드 중... {Math.round(uploadProgress)}%
                  </div>
                  <MediaUploadProgress>
                    <MediaUploadProgressBar $progress={uploadProgress} />
                  </MediaUploadProgress>
                </div>
              )}
              
              {/* 업로드된 미디어 목록 */}
              {uploadedMedia.length > 0 && (
                <MediaPreviewContainer>
                  <MediaPreviewTitle>
                    📋 {selectedMediaType === 'image' ? '업로드된 이미지' : '업로드된 동영상'} 
                    <span style={{ 
                      color: colors.primary, 
                      fontWeight: '600',
                      marginLeft: '8px'
                    }}>
                      ({uploadedMedia.filter(m => m.type === selectedMediaType).length}개)
                    </span>
                  </MediaPreviewTitle>
                  
                  <div style={{ 
                    background: 'rgba(81, 207, 102, 0.1)', 
                    border: '1px solid rgba(81, 207, 102, 0.2)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: colors.success,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>👆</span>
                    <strong>아래 미디어를 클릭하면 글에 자동으로 삽입됩니다</strong>
                  </div>
                  
                  <MediaPreviewGrid>
                    {uploadedMedia
                      .filter(m => m.type === selectedMediaType)
                      .map(media => (
                        <MediaItem key={media.id} onClick={() => insertMedia(media)}>
                          <div style={{ position: 'relative' }}>
                            {media.type === 'image' ? (
                              <MediaItemImage 
                                src={media.url}
                                alt={media.name}
                                onError={(e) => {
                                  console.error('이미지 로드 실패:', media.url);
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div style={{ 
                                height: '100px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px'
                              }}>
                                <span style={{ fontSize: '36px' }}>🎬</span>
                              </div>
                            )}
                            
                            {/* 클릭 가능 표시 */}
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              클릭
                            </div>
                          </div>
                          <MediaItemTitle>{media.name}</MediaItemTitle>
                        </MediaItem>
                      ))}
                  </MediaPreviewGrid>
                  
                  {uploadedMedia.filter(m => m.type === selectedMediaType).length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: colors.secondary,
                      fontSize: '14px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>
                        {selectedMediaType === 'image' ? '🖼️' : '🎬'}
                      </div>
                      아직 업로드된 {selectedMediaType === 'image' ? '이미지' : '동영상'}가 없습니다.<br/>
                      위의 업로드 영역을 사용해 파일을 추가해보세요.
                    </div>
                  )}
                </MediaPreviewContainer>
              )}
            </MediaInsertModalBody>
            
            <MediaInsertFooter>
              <div style={{ 
                fontSize: '12px', 
                color: colors.secondary,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>ℹ️</span>
                지원 형식: {selectedMediaType === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP4, WebM, OGG'} | 최대 10MB
              </div>
              <CancelButton type="button" onClick={closeMediaModal}>
                닫기
              </CancelButton>
            </MediaInsertFooter>
          </MediaInsertModalContent>
        </MediaInsertModal>
      )}
    </FormContainer>
  );
};

export default BoardForm;