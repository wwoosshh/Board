import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/AuthApi';
import styled from 'styled-components';

const RegisterContainer = styled.div`
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
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

const LoginLink = styled.div`
  margin-top: 15px;
  text-align: center;
`;

const HelpText = styled.small`
  color: #666;
  font-size: 12px;
  margin-top: 2px;
  display: block;
`;

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    nickname: ''
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 간단한 유효성 검사
    if (!userData.username.trim()) {
      setError('사용자 이름을 입력해주세요.');
      return;
    }
    
    if (!userData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    if (!userData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!userData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    
    try {
      await register(userData);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || '회원가입에 실패했습니다.');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    }
  };
  
  return (
    <RegisterContainer>
      <Title>회원가입</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">사용자 이름</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleChange}
            placeholder="사용자 이름을 입력하세요"
            required
          />
          <HelpText>로그인 시 사용할 ID입니다.</HelpText>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">이메일</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="name">이름</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            placeholder="실명을 입력하세요"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            type="text"
            id="nickname"
            name="nickname"
            value={userData.nickname}
            onChange={handleChange}
            placeholder="닉네임을 입력하세요 (선택사항)"
          />
          <HelpText>
            닉네임을 입력하지 않으면 이름이 닉네임으로 사용됩니다. 
            게시글과 댓글에서 표시되는 이름입니다.
          </HelpText>
        </FormGroup>
        
        <Button type="submit">회원가입</Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
      
      <LoginLink>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </LoginLink>
    </RegisterContainer>
  );
};

export default Register;