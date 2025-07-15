// src/components/FileUploader.js
import React, { useState, useRef } from 'react';
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

const UploaderContainer = styled.div`
  border: 2px dashed ${colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background: ${colors.light};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${colors.primary};
  }
  
  &.drag-active {
    border-color: ${colors.primary};
    background: rgba(66, 99, 235, 0.05);
  }
`;

const DropZone = styled.div`
  text-align: center;
  padding: 20px;
  cursor: pointer;
`;

const UploadIcon = styled.div`
  font-size: 40px;
  margin-bottom: 10px;
  color: ${colors.primary};
`;

const UploadText = styled.div`
  color: ${colors.secondary};
  margin-bottom: 15px;
`;

const BrowseButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 99, 235, 0.3);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  margin-top: 20px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px ${colors.shadow};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${colors.shadow};
  }
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 15px;
  background: ${colors.light};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${props => {
    if (props.$type.startsWith('image/')) return '#4CAF50';
    if (props.$type.startsWith('video/')) return '#E91E63';
    if (props.$type.startsWith('audio/')) return '#9C27B0';
    if (props.$type.includes('pdf')) return '#F44336';
    if (props.$type.includes('word')) return '#2196F3';
    if (props.$type.includes('excel') || props.$type.includes('sheet')) return '#4CAF50';
    return colors.secondary;
  }};
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  color: ${colors.dark};
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const FileSize = styled.div`
  color: ${colors.secondary};
  font-size: 12px;
`;

const FilePreview = styled.div`
  margin-right: 15px;
`;

const ImagePreview = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  background: transparent;
  color: ${colors.danger};
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  margin-left: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 107, 107, 0.1);
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background: ${colors.light};
  border-radius: 2px;
  margin-top: 5px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: ${colors.primary};
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const ErrorMessage = styled.div`
  color: ${colors.danger};
  font-size: 12px;
  margin-top: 5px;
`;

const SupportedFilesInfo = styled.div`
  font-size: 12px;
  color: ${colors.secondary};
  margin-top: 10px;
  background: rgba(66, 99, 235, 0.05);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(66, 99, 235, 0.1);
`;

const FileTypeLabel = styled.span`
  display: inline-block;
  background: ${colors.light};
  color: ${colors.secondary};
  padding: 2px 6px;
  border-radius: 4px;
  margin: 2px;
  font-size: 11px;
  border: 1px solid ${colors.border};
`;

// 파일 크기 포맷팅 함수
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 파일 아이콘 선택 함수
const getFileIcon = (type) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word')) return '📝';
  if (type.includes('excel') || type.includes('sheet')) return '📊';
  if (type.includes('zip') || type.includes('compressed')) return '🗜️';
  return '📁';
};

// 파일 확장자 추출 함수
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// 지원 파일 타입 표시 함수
const getSupportedFileTypes = (acceptedTypes) => {
  if (!acceptedTypes || acceptedTypes === "*") return ["모든 파일"];
  
  const types = acceptedTypes.split(',');
  const displayNames = {
    'image/*': '이미지',
    'video/*': '동영상',
    'audio/*': '오디오',
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/zip': 'ZIP',
    'application/x-zip-compressed': 'ZIP'
  };
  
  // 중복된 키를 방지하기 위해 Set 사용
  const uniqueTypes = new Set();
  
  types.forEach(type => {
    if (displayNames[type]) {
      uniqueTypes.add(displayNames[type]);
    } else if (type.startsWith('image/')) {
      uniqueTypes.add(type.replace('image/', '').toUpperCase());
    } else if (type.startsWith('video/')) {
      uniqueTypes.add(type.replace('video/', '').toUpperCase() + ' 비디오');
    } else {
      uniqueTypes.add(type);
    }
  });
  
  return Array.from(uniqueTypes);
};

const FileUploader = ({ files, setFiles, maxFiles = 5, maxFileSize = 10 * 1024 * 1024, acceptedTypes = "*" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  // 업로드 진행 상태 (실제 업로드는 부모 컴포넌트에서 처리)
  const [progress, setProgress] = useState({});
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    addFiles(selectedFiles);
    // 파일 선택 후 input 초기화 (같은 파일 다시 선택 가능하도록)
    event.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    setError('');
    
    // 파일 수 제한 확인
    if (files.length + newFiles.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }
    
    // 파일 크기 및 타입 확인
    const validFiles = newFiles.filter(file => {
      if (file.size > maxFileSize) {
        setError(`파일 크기는 ${formatFileSize(maxFileSize)}를 초과할 수 없습니다.`);
        return false;
      }
      
      // 이미지와 동영상 형식 확장
      const fileExtension = getFileExtension(file.name);
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
      
      // 파일 형식 확인 (확장자 또는 MIME 타입으로)
      if (acceptedTypes !== "*") {
        // 이미지 형식 처리
        if (acceptedTypes.includes('image/*') && 
           (file.type.startsWith('image/') || imageExtensions.includes(fileExtension))) {
          return true;
        }
        
        // 동영상 형식 처리
        if (acceptedTypes.includes('video/*') && 
           (file.type.startsWith('video/') || videoExtensions.includes(fileExtension))) {
          return true;
        }
        
        // 구체적인 MIME 타입 처리
        if (!acceptedTypes.split(',').some(type => {
          if (type.includes('*')) {
            const typePrefix = type.replace('*', '');
            return file.type.startsWith(typePrefix);
          }
          return file.type === type;
        })) {
          setError('지원되지 않는 파일 형식입니다.');
          return false;
        }
      }
      
      return true;
    });
    
    // 유효한 파일만 추가
    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
      
      // 진행 상태 초기화
      const newProgress = { ...progress };
      validFiles.forEach(file => {
        newProgress[file.name] = 0;
      });
      setProgress(newProgress);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // 지원 파일 타입 표시
  const supportedTypes = getSupportedFileTypes(acceptedTypes);

  return (
    <UploaderContainer className={isDragging ? 'drag-active' : ''}>
      <DropZone
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon>📤</UploadIcon>
        <UploadText>
          파일을 여기에 끌어다 놓거나 클릭하여 업로드하세요
        </UploadText>
        <BrowseButton type="button" onClick={triggerFileInput}>
          파일 선택
        </BrowseButton>
        <FileInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple={maxFiles > 1}
          accept={acceptedTypes}
        />
        
        {acceptedTypes !== "*" && (
          <SupportedFilesInfo>
            지원 파일 형식: {supportedTypes.map((type, index) => (
              <FileTypeLabel key={`filetype-${index}`}>{type}</FileTypeLabel>
            ))}
          </SupportedFilesInfo>
        )}
      </DropZone>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {files.length > 0 && (
        <FileList>
          {files.map((file, index) => (
            <FileItem key={`file-${index}`}>
              <FileIcon $type={file.type}>
                {getFileIcon(file.type)}
              </FileIcon>
              
              <FileDetails>
                <FileName>{file.name}</FileName>
                <FileSize>{formatFileSize(file.size)}</FileSize>
                {progress[file.name] > 0 && (
                  <ProgressBarContainer>
                    <ProgressBar $progress={progress[file.name]} />
                  </ProgressBarContainer>
                )}
              </FileDetails>
              
              {file.type.startsWith('image/') && (
                <FilePreview>
                  <ImagePreview src={URL.createObjectURL(file)} alt="Preview" />
                </FilePreview>
              )}
              
              <RemoveButton onClick={() => removeFile(index)}>×</RemoveButton>
            </FileItem>
          ))}
        </FileList>
      )}
    </UploaderContainer>
  );
};

export default FileUploader;