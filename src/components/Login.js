import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/AuthApi';
import styled from 'styled-components';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 10px;
`;

const RegisterLink = styled.div`
  margin-top: 15px;
  text-align: center;
`;

const DebugInfo = styled.div`
  background-color: #f5f5f5;
  padding: 10px;
  margin-top: 15px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
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
    <LoginContainer>
      <Title>로그인</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">사용자 이름</Label>
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
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">비밀번호</Label>
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
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {debugInfo && <DebugInfo>디버그: {debugInfo}</DebugInfo>}
      </Form>
      
      <RegisterLink>
        계정이 없으신가요? <Link to="/register">회원가입</Link>
      </RegisterLink>
    </LoginContainer>
  );
};

export default Login;