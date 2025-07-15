// src/components/MyProfile.js
import React, { useState, useEffect, useRef } from 'react';
import { fetchMyProfile, updateProfile, uploadProfileImage } from '../api/ProfileApi';
import { getCurrentUser, getRoleDisplayName } from '../api/AuthApi';
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

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
  background: ${colors.light};
  min-height: calc(100vh - 70px);
`;

const ProfileCard = styled.div`
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

const ProfileHeader = styled.div`
  padding: 30px;
  text-align: center;
  position: relative;
`;

const CoverPhoto = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: ${colors.gradient};
  z-index: 0;
`;

const ProfileContent = styled.div`
  position: relative;
  z-index: 1;
  padding-top: 20px;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 20px auto;
`;

const ProfileImage = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 30px ${colors.shadow};
  background-color: ${colors.primary};
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 64px;
  font-weight: 600;
  overflow: hidden;
`;

const EditImageButton = styled.button`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 99, 235, 0.3);
  font-size: 18px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background: ${colors.primaryDark};
  }
`;

const ProfileName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.dark};
  margin: 0 0 5px 0;
`;

const ProfileUsername = styled.div`
  font-size: 16px;
  color: ${colors.secondary};
  margin-bottom: 10px;
`;

const RoleBadge = styled.div`
  display: inline-block;
  background: ${props => {
    switch (props.role) {
      case 'ROLE_MANAGER': return colors.danger;
      case 'ROLE_ADMIN': return colors.warning;
      case 'ROLE_MODERATOR': return colors.success;
      default: return colors.primary;
    }
  }};
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const ProfileTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${colors.border};
  margin-top: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 15px 20px;
  background: transparent;
  border: none;
  color: ${props => props.active ? colors.primary : colors.secondary};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${colors.primary};
    transform: scaleX(${props => props.active ? '1' : '0'});
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: ${colors.primary};
    
    &:after {
      transform: scaleX(1);
      opacity: 0.5;
    }
  }
`;

const TabContent = styled.div`
  padding: 30px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${colors.dark};
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
    transform: translateY(-2px);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  height: 120px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
    transform: translateY(-2px);
  }
`;

const SaveButton = styled.button`
  grid-column: span 2;
  background: ${colors.gradient};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const SocialLink = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
    transform: translateY(-2px);
  }
`;

const AddLinkButton = styled.button`
  background: ${colors.light};
  color: ${colors.primary};
  border: 1px dashed ${colors.primary};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(66, 99, 235, 0.1);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
`;

const InfoIcon = styled.div`
  width: 24px;
  margin-right: 12px;
  color: ${colors.primary};
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: ${colors.secondary};
  margin-bottom: 3px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: ${colors.dark};
  word-break: break-word;
`;

const ActionButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 99, 235, 0.3);
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.danger};
  font-size: 14px;
  margin-top: 5px;
`;

const SuccessMessage = styled.div`
  color: ${colors.success};
  font-size: 14px;
  margin-top: 5px;
  padding: 8px 12px;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(81, 207, 102, 0.2);
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  display: inline-block;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    name: '',
    bio: '',
    website: '',
    socialLinks: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchMyProfile();
        setProfile(data.user ? data.user : data);
        
        // 초기 폼 데이터 설정
        setFormData({
          nickname: data.user ? data.user.nickname : data.nickname || '',
          name: data.user ? data.user.name : data.name || '',
          bio: data.user ? data.user.bio : data.bio || '',
          website: data.user ? data.user.website : data.website || '',
          socialLinks: data.user ? data.user.socialLinks : data.socialLinks || ''
        });
        
        setLoading(false);
      } catch (err) {
        setError('프로필을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setSaving(false);
    } catch (err) {
      setError('프로필 업데이트 중 오류가 발생했습니다.');
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    setError('');
    setImageUploading(true);
    
    try {
      const response = await uploadProfileImage(file);
      
      // 프로필 갱신
      const updatedProfile = await fetchMyProfile();
      setProfile(updatedProfile.user ? updatedProfile.user : updatedProfile);
      
      setImageUploading(false);
      setSuccess('프로필 이미지가 성공적으로 업데이트되었습니다.');
    } catch (err) {
      setError('이미지 업로드 중 오류가 발생했습니다.');
      setImageUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = (username) => {
    return username?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <LoadingSpinner style={{ width: '40px', height: '40px', borderWidth: '4px', margin: '0 auto 20px auto' }} />
          <div>프로필을 불러오는 중...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileCard>
        <ProfileHeader>
          <CoverPhoto />
          <ProfileContent>
            <ProfileImageContainer>
              <ProfileImage 
                src={profile.profileImageUrl || profile.profileImage ? 
                  `/api/files/profiles/${profile.profileImage}` : 
                  null}
              >
                {!profile.profileImage && getUserInitial(profile.username)}
              </ProfileImage>
              <EditImageButton onClick={triggerFileInput}>
                {imageUploading ? <LoadingSpinner /> : '📷'}
              </EditImageButton>
              <FileInput 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload}
                accept="image/*"
              />
            </ProfileImageContainer>
            
            <ProfileName>{profile.nickname || profile.name}</ProfileName>
            <ProfileUsername>@{profile.username}</ProfileUsername>
            <RoleBadge role={profile.role}>
              {getRoleDisplayName(profile.role)}
            </RoleBadge>
            
            {profile.bio && (
              <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                {profile.bio}
              </div>
            )}
          </ProfileContent>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </ProfileHeader>
        
        <ProfileTabs>
          <Tab 
            active={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
          >
            기본 정보
          </Tab>
          <Tab 
            active={activeTab === 'edit'} 
            onClick={() => setActiveTab('edit')}
          >
            프로필 수정
          </Tab>
        </ProfileTabs>
        
        <TabContent>
          {activeTab === 'info' ? (
            <div>
              <InfoItem>
                <InfoIcon>👤</InfoIcon>
                <InfoContent>
                  <InfoLabel>이름</InfoLabel>
                  <InfoValue>{profile.name || '설정되지 않음'}</InfoValue>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon>📧</InfoIcon>
                <InfoContent>
                  <InfoLabel>이메일</InfoLabel>
                  <InfoValue>{profile.email}</InfoValue>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon>🎭</InfoIcon>
                <InfoContent>
                  <InfoLabel>닉네임</InfoLabel>
                  <InfoValue>{profile.nickname || '설정되지 않음'}</InfoValue>
                </InfoContent>
              </InfoItem>
              
              {profile.bio && (
                <InfoItem>
                  <InfoIcon>📝</InfoIcon>
                  <InfoContent>
                    <InfoLabel>자기소개</InfoLabel>
                    <InfoValue>{profile.bio}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
              
              {profile.website && (
                <InfoItem>
                  <InfoIcon>🌐</InfoIcon>
                  <InfoContent>
                    <InfoLabel>웹사이트</InfoLabel>
                    <InfoValue>
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: colors.primary }}
                      >
                        {profile.website}
                      </a>
                    </InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
              
              {profile.socialLinks && (
                <InfoItem>
                  <InfoIcon>🔗</InfoIcon>
                  <InfoContent>
                    <InfoLabel>소셜 링크</InfoLabel>
                    <InfoValue>{profile.socialLinks}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
              
              <InfoItem>
                <InfoIcon>🗓️</InfoIcon>
                <InfoContent>
                  <InfoLabel>가입일</InfoLabel>
                  <InfoValue>
                    {new Date(profile.createdDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </InfoValue>
                </InfoContent>
              </InfoItem>
              
              <ActionButton onClick={() => setActiveTab('edit')}>
                프로필 수정하기
              </ActionButton>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="name">이름</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력하세요"
                />
              </FormGroup>
              
              <FormGroup style={{ gridColumn: 'span 2' }}>
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="자기소개를 입력하세요"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="socialLinks">소셜 미디어 링크</Label>
                <Input
                  type="text"
                  id="socialLinks"
                  name="socialLinks"
                  value={formData.socialLinks}
                  onChange={handleChange}
                  placeholder="Instagram: @username, Twitter: @username"
                />
              </FormGroup>
              
              <SaveButton type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <LoadingSpinner /> 저장 중...
                  </>
                ) : '변경사항 저장'}
              </SaveButton>
            </Form>
          )}
        </TabContent>
      </ProfileCard>
    </PageContainer>
  );
};

export default MyProfile;