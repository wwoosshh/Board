import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/AuthApi';
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
  min-height: calc(100vh - 70px);
  background: ${colors.light};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(245, 159, 0, 0.1) 0%, transparent 70%);
    animation: float 8s ease-in-out infinite reverse;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
`;

const RegisterContainer = styled.div`
  max-width: 500px;
  width: 100%;
  background: ${colors.cardBg};
  border-radius: 24px;
  box-shadow: 0 20px 60px ${colors.shadow};
  border: 1px solid ${colors.border};
  overflow: hidden;
  position: relative;
  z-index: 1;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(135deg, #f59f00 0%, #ff922b 100%);
  }
`;

const RegisterHeader = styled.div`
  padding: 40px 40px 20px 40px;
  text-align: center;
  background: linear-gradient(135deg, #fff4e6 0%, #ffffff 100%);
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px auto;
  background: linear-gradient(135deg, #f59f00 0%, #ff922b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  box-shadow: 0 10px 30px rgba(245, 159, 0, 0.3);
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: ${colors.dark};
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: ${colors.secondary};
  margin: 0 0 20px 0;
  font-size: 16px;
  line-height: 1.5;
`;

const Form = styled.form`
  padding: 20px 40px 40px 40px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 16px;
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

const Optional = styled.span`
  color: ${colors.secondary};
  font-size: 11px;
  font-weight: 400;
  background: ${colors.light};
  padding: 2px 6px;
  border-radius: 4px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${colors.border};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${colors.accent};
    box-shadow: 0 0 0 3px rgba(245, 159, 0, 0.1);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: ${colors.secondary};
  }
  
  &:disabled {
    background: ${colors.light};
    cursor: not-allowed;
  }
  
  &.error {
    border-color: ${colors.danger};
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }
  }
  
  &.success {
    border-color: ${colors.success};
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(81, 207, 102, 0.1);
    }
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.secondary};
  font-size: 18px;
  pointer-events: none;
`;

const HelpText = styled.div`
  color: ${colors.secondary};
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.4;
  
  &.error {
    color: ${colors.danger};
  }
  
  &.success {
    color: ${colors.success};
  }
`;

const PasswordStrength = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${colors.light};
  border: 1px solid ${colors.border};
`;

const StrengthLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${colors.secondary};
`;

const StrengthBar = styled.div`
  height: 4px;
  background: ${colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const StrengthFill = styled.div`
  height: 100%;
  transition: all 0.3s ease;
  background: ${props => {
    switch (props.strength) {
      case 1: return colors.danger;
      case 2: return colors.warning;
      case 3: return colors.accent;
      case 4: return colors.success;
      default: return colors.border;
    }
  }};
  width: ${props => (props.strength * 25)}%;
`;

const StrengthText = styled.div`
  font-size: 11px;
  margin-top: 4px;
  color: ${props => {
    switch (props.strength) {
      case 1: return colors.danger;
      case 2: return colors.warning;
      case 3: return colors.accent;
      case 4: return colors.success;
      default: return colors.secondary;
    }
  }};
  font-weight: 500;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #f59f00 0%, #ff922b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(245, 159, 0, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled):before {
    left: 100%;
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

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 107, 107, 0.1);
  color: ${colors.danger};
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px 0;
  border: 1px solid rgba(255, 107, 107, 0.2);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '⚠️';
    font-size: 16px;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(81, 207, 102, 0.1);
  color: ${colors.success};
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px 0;
  border: 1px solid rgba(81, 207, 102, 0.2);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '✅';
    font-size: 16px;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  padding: 20px 40px 40px 40px;
  background: ${colors.light};
  border-top: 1px solid ${colors.border};
  font-size: 14px;
  color: ${colors.secondary};
`;

const StyledLink = styled(Link)`
  color: ${colors.accent};
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
`;

const ProgressDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? colors.accent : colors.border};
  transition: all 0.3s ease;
`;

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    nickname: ''
  });
  
  const [validation, setValidation] = useState({
    username: null,
    password: null,
    email: null,
    name: null
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
    
    // 실시간 유효성 검증
    validateField(name, value);
    
    // 비밀번호 강도 체크
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  const validateField = (name, value) => {
    let isValid = null;
    
    switch (name) {
      case 'username':
        isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
        break;
      case 'password':
        isValid = value.length >= 6;
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'name':
        isValid = value.trim().length >= 2;
        break;
    }
    
    setValidation(prev => ({
      ...prev,
      [name]: isValid
    }));
  };
  
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    setPasswordStrength(Math.min(strength, 4));
  };
  
  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 1: return '매우 약함';
      case 2: return '약함';
      case 3: return '보통';
      case 4: return '강함';
      default: return '비밀번호를 입력하세요';
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 유효성 검사
    const requiredFields = ['username', 'password', 'email', 'name'];
    for (let field of requiredFields) {
      if (!userData[field].trim()) {
        setError(`${getFieldLabel(field)}를 입력해주세요.`);
        return;
      }
      if (validation[field] === false) {
        setError(`${getFieldLabel(field)}가 올바르지 않습니다.`);
        return;
      }
    }
    
    if (passwordStrength < 2) {
      setError('비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(userData);
      setCurrentStep(3); // 성공 단계로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || '회원가입에 실패했습니다.');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const getFieldLabel = (field) => {
    const labels = {
      username: '사용자 이름',
      password: '비밀번호',
      email: '이메일',
      name: '이름'
    };
    return labels[field];
  };
  
  const getValidationIcon = (fieldName) => {
    if (validation[fieldName] === true) return '✅';
    if (validation[fieldName] === false) return '❌';
    return '';
  };
  
  const getInputClassName = (fieldName) => {
    if (validation[fieldName] === true) return 'success';
    if (validation[fieldName] === false) return 'error';
    return '';
  };
  
  // 성공 페이지
  if (currentStep === 3) {
    return (
      <PageContainer>
        <RegisterContainer>
          <RegisterHeader>
            <LogoIcon>🎉</LogoIcon>
            <Title>가입 완료!</Title>
            <Subtitle>
              회원가입이 성공적으로 완료되었습니다.<br />
              곧 로그인 페이지로 이동합니다.
            </Subtitle>
          </RegisterHeader>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <SuccessMessage>
              환영합니다, {userData.name}님! Connect의 새로운 멤버가 되신 것을 축하합니다.
            </SuccessMessage>
          </div>
        </RegisterContainer>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <RegisterContainer>
        <RegisterHeader>
          <LogoIcon>✨</LogoIcon>
          <Title>회원가입</Title>
          <Subtitle>
            Connect 커뮤니티에 참여하여<br />
            새로운 이야기를 시작해보세요
          </Subtitle>
          <ProgressIndicator>
            <ProgressDot active={currentStep >= 1} />
            <ProgressDot active={currentStep >= 2} />
            <ProgressDot active={currentStep >= 3} />
          </ProgressIndicator>
        </RegisterHeader>

        <Form onSubmit={handleSubmit}>
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label htmlFor="username">
                사용자 이름 <Required>*</Required>
              </Label>
              <InputContainer>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  placeholder="영문, 숫자, _ 사용 가능"
                  required
                  className={getInputClassName('username')}
                />
                <InputIcon>{getValidationIcon('username') || '👤'}</InputIcon>
              </InputContainer>
              <HelpText className={validation.username === false ? 'error' : validation.username === true ? 'success' : ''}>
                {validation.username === false 
                  ? '3자 이상, 영문/숫자/언더스코어만 사용 가능'
                  : validation.username === true 
                    ? '사용 가능한 사용자 이름입니다'
                    : '로그인 시 사용할 ID입니다'
                }
              </HelpText>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="name">
                이름 <Required>*</Required>
              </Label>
              <InputContainer>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  placeholder="실명을 입력하세요"
                  required
                  className={getInputClassName('name')}
                />
                <InputIcon>{getValidationIcon('name') || '📝'}</InputIcon>
              </InputContainer>
              <HelpText className={validation.name === false ? 'error' : validation.name === true ? 'success' : ''}>
                {validation.name === false 
                  ? '2자 이상 입력해주세요'
                  : validation.name === true 
                    ? '올바른 이름입니다'
                    : '실명을 입력해주세요'
                }
              </HelpText>
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <Label htmlFor="email">
              이메일 <Required>*</Required>
            </Label>
            <InputContainer>
              <Input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                required
                className={getInputClassName('email')}
              />
              <InputIcon>{getValidationIcon('email') || '📧'}</InputIcon>
            </InputContainer>
            <HelpText className={validation.email === false ? 'error' : validation.email === true ? 'success' : ''}>
              {validation.email === false 
                ? '올바른 이메일 형식이 아닙니다'
                : validation.email === true 
                  ? '올바른 이메일 주소입니다'
                  : '알림 및 계정 복구에 사용됩니다'
              }
            </HelpText>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">
              비밀번호 <Required>*</Required>
            </Label>
            <InputContainer>
              <Input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="안전한 비밀번호를 입력하세요"
                required
                className={getInputClassName('password')}
              />
              <InputIcon>{getValidationIcon('password') || '🔒'}</InputIcon>
            </InputContainer>
            {userData.password && (
              <PasswordStrength>
                <StrengthLabel>비밀번호 강도</StrengthLabel>
                <StrengthBar>
                  <StrengthFill strength={passwordStrength} />
                </StrengthBar>
                <StrengthText strength={passwordStrength}>
                  {getPasswordStrengthText(passwordStrength)}
                </StrengthText>
              </PasswordStrength>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="nickname">
              닉네임 <Optional>선택사항</Optional>
            </Label>
            <InputContainer>
              <Input
                type="text"
                id="nickname"
                name="nickname"
                value={userData.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
              />
              <InputIcon>✨</InputIcon>
            </InputContainer>
            <HelpText>
              닉네임을 입력하지 않으면 이름이 닉네임으로 사용됩니다. 
              게시글과 댓글에서 표시되는 이름입니다.
            </HelpText>
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            <ButtonContent>
              {loading && <LoadingSpinner />}
              {loading ? '가입 처리 중...' : '회원가입 완료'}
            </ButtonContent>
          </Button>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
        
        <LoginLink>
          이미 계정이 있으신가요? <StyledLink to="/login">로그인</StyledLink>
        </LoginLink>
      </RegisterContainer>
    </PageContainer>
  );
};

export default Register;