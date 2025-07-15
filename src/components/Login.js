import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/AuthApi';
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
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
`;

const LoginContainer = styled.div`
  max-width: 420px;
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
    background: ${colors.gradient};
  }
`;

const LoginHeader = styled.div`
  padding: 40px 40px 20px 40px;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px auto;
  background: ${colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
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

const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${colors.dark};
  font-size: 14px;
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
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: ${colors.secondary};
  }
  
  &:disabled {
    background: ${colors.light};
    cursor: not-allowed;
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

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: ${colors.gradient};
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
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
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

const RegisterLink = styled.div`
  text-align: center;
  padding: 20px 40px 40px 40px;
  background: ${colors.light};
  border-top: 1px solid ${colors.border};
  font-size: 14px;
  color: ${colors.secondary};
`;

const StyledLink = styled(Link)`
  color: ${colors.primary};
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DebugInfo = styled.details`
  background: ${colors.light};
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  border: 1px solid ${colors.border};
  font-size: 12px;
  color: ${colors.secondary};
  
  summary {
    cursor: pointer;
    font-weight: 600;
    padding: 4px 0;
    
    &:hover {
      color: ${colors.primary};
    }
  }
  
  pre {
    margin: 8px 0 0 0;
    background: white;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid ${colors.border};
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', monospace;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
`;

const FeatureCard = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const FeatureTitle = styled.div`
  font-weight: 600;
  color: ${colors.dark};
  margin-bottom: 4px;
  font-size: 14px;
`;

const FeatureDescription = styled.div`
  color: ${colors.secondary};
  font-size: 12px;
`;

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebugInfo('로그인 시작...');
    
    try {
      console.log('🔐 로그인 시도:', credentials);
      setDebugInfo('서버로 로그인 요청 전송 중...');
      
      const response = await login(credentials);
      console.log('✅ 로그인 성공 - 전체 응답:', response);
      console.log('✅ AccessToken:', response.accessToken ? 'O' : 'X');
      console.log('✅ RefreshToken:', response.refreshToken ? 'O' : 'X');
      console.log('✅ User:', response.user ? 'O' : 'X');
      
      setDebugInfo(`로그인 성공! 사용자: ${response.user?.username || '알 수 없음'}`);
      
      // localStorage 확인
      console.log('💾 저장된 AccessToken:', localStorage.getItem('accessToken') ? 'O' : 'X');
      console.log('💾 저장된 RefreshToken:', localStorage.getItem('refreshToken') ? 'O' : 'X');
      console.log('💾 저장된 User:', localStorage.getItem('user') ? 'O' : 'X');
      
      console.log('🏠 홈으로 이동');
      navigate('/');
      
      // 페이지 새로고침으로 헤더 상태 업데이트
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (err) {
      console.error('❌ 로그인 오류 - 전체:', err);
      console.error('❌ 오류 응답:', err.response);
      console.error('❌ 오류 데이터:', err.response?.data);
      console.error('❌ 오류 상태:', err.response?.status);
      
      let errorMessage = '로그인에 실패했습니다.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = '사용자 이름 또는 비밀번호가 잘못되었습니다.';
      } else if (err.response?.status === 401) {
        errorMessage = '인증에 실패했습니다. 사용자 이름과 비밀번호를 확인해주세요.';
      } else if (err.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (err.message) {
        errorMessage = `오류: ${err.message}`;
      }
      
      setError(errorMessage);
      setDebugInfo(`로그인 실패: ${err.response?.status || 'Unknown'} - ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <LoginContainer>
        <LoginHeader>
          <LogoIcon>🚀</LogoIcon>
          <Title>환영합니다!</Title>
          <Subtitle>
            Connect에 로그인하여<br />
            다양한 이야기를 나누어보세요
          </Subtitle>
        </LoginHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">사용자 이름</Label>
            <InputContainer>
              <Input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="사용자 이름을 입력하세요"
              />
              <InputIcon>👤</InputIcon>
            </InputContainer>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">비밀번호</Label>
            <InputContainer>
              <Input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="비밀번호를 입력하세요"
              />
              <InputIcon>🔒</InputIcon>
            </InputContainer>
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            <ButtonContent>
              {loading && <LoadingSpinner />}
              {loading ? '로그인 중...' : '로그인'}
            </ButtonContent>
          </Button>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <DebugInfo>
              <summary>개발자 정보</summary>
              <pre>{debugInfo}</pre>
            </DebugInfo>
          )}
        </Form>

        <FeaturesGrid style={{ padding: '0 40px' }}>
          <FeatureCard>
            <FeatureIcon>💬</FeatureIcon>
            <FeatureTitle>실시간 댓글</FeatureTitle>
            <FeatureDescription>빠른 소통</FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>안전한 로그인</FeatureTitle>
            <FeatureDescription>보안 강화</FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
        
        <RegisterLink>
          계정이 없으신가요? <StyledLink to="/register">회원가입</StyledLink>
        </RegisterLink>
      </LoginContainer>
    </PageContainer>
  );
};

export default Login;