// src/components/ServerNotice.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { attemptServerReconnection } from '../api/ServerHealthApi';

// 애니메이션 정의
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// 스타일 컴포넌트들
const NoticeOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.5s ease-out;
`;

const NoticeContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

const IconContainer = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  
  ${props => props.status === 'checking' && css`
    animation: ${spin} 2s linear infinite;
  `}
  
  ${props => props.status === 'reconnecting' && css`
    animation: ${pulse} 1.5s ease-in-out infinite;
  `}
`;

const Title = styled.h1`
  color: #333;
  font-size: 28px;
  margin-bottom: 16px;
  font-weight: 700;
`;

const Message = styled.p`
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  
  ${props => {
    switch (props.status) {
      case 'maintenance':
        return css`
          background-color: #ffeaa7;
          color: #e17055;
        `;
      case 'down':
        return css`
          background-color: #fab1a0;
          color: #e17055;
        `;
      case 'error':
        return css`
          background-color: #fd79a8;
          color: #e84393;
        `;
      case 'timeout':
        return css`
          background-color: #fdcb6e;
          color: #e17055;
        `;
      default:
        return css`
          background-color: #74b9ff;
          color: #0984e3;
        `;
    }
  }}
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const TimeInfo = styled.div`
  color: #999;
  font-size: 14px;
  margin-top: 20px;
`;

const ProgressContainer = styled.div`
  margin: 20px 0;
  background-color: #f1f2f6;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 10px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const ContactInfo = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  border-left: 4px solid #667eea;
`;

// 메인 컴포넌트
const ServerNotice = ({ serverStatus, onRetry, onDismiss }) => {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectProgress, setReconnectProgress] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // 서버 상태에 따른 설정
  const getNoticeConfig = (status) => {
    const currentTime = new Date().toLocaleString('ko-KR');
    
    switch (status) {
      case 'maintenance':
        return {
          icon: '🔧',
          title: '시스템 점검 중',
          message: '보다 나은 서비스 제공을 위해 시스템 점검을 진행하고 있습니다.\n점검 완료까지 잠시만 기다려 주세요.',
          statusText: '예정된 점검',
          showRetry: true,
          showContact: false,
          estimatedTime: '약 30분 후 점검 완료 예정'
        };
      
      case 'down':
        return {
          icon: '🚫',
          title: '서버 연결 불가',
          message: '현재 서버가 실행되지 않고 있습니다.\n관리자가 서버를 점검 중이거나 일시적인 문제일 수 있습니다.',
          statusText: '서버 다운',
          showRetry: true,
          showContact: true,
          estimatedTime: '복구 작업 진행 중'
        };
      
      case 'timeout':
        return {
          icon: '⏰',
          title: '서버 응답 지연',
          message: '서버가 응답하는데 시간이 오래 걸리고 있습니다.\n네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요.',
          statusText: '응답 지연',
          showRetry: true,
          showContact: false,
          estimatedTime: '일시적인 지연 상황'
        };
      
      case 'error':
        return {
          icon: '❌',
          title: '서버 오류 발생',
          message: '서버에서 오류가 발생했습니다.\n관리자에게 문제가 자동으로 보고되었으며, 빠른 시일 내에 해결하겠습니다.',
          statusText: '서버 오류',
          showRetry: true,
          showContact: true,
          estimatedTime: '복구 작업 진행 중'
        };
      
      default:
        return {
          icon: '🔌',
          title: '서버 연결 실패',
          message: '서버에 연결할 수 없습니다.\n인터넷 연결을 확인하거나 잠시 후 다시 시도해 주세요.',
          statusText: '연결 실패',
          showRetry: true,
          showContact: true,
          estimatedTime: '연결 상태 확인 중'
        };
    }
  };

  const config = getNoticeConfig(serverStatus?.status);

  // 재연결 시도
  const handleReconnect = async () => {
    setIsReconnecting(true);
    setReconnectProgress(0);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setReconnectProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const result = await attemptServerReconnection(3, 2000);
      
      clearInterval(progressInterval);
      setReconnectProgress(100);

      setTimeout(() => {
        if (result.isOnline) {
          onRetry?.();
        } else {
          setIsReconnecting(false);
          setReconnectProgress(0);
        }
      }, 500);

    } catch (error) {
      setIsReconnecting(false);
      setReconnectProgress(0);
    }
  };

  return (
    <NoticeOverlay>
      <NoticeContainer>
        <IconContainer status={isReconnecting ? 'reconnecting' : serverStatus?.status}>
          {isReconnecting ? '🔄' : config.icon}
        </IconContainer>

        <StatusBadge status={serverStatus?.status}>
          {config.statusText}
        </StatusBadge>

        <Title>{config.title}</Title>
        
        <Message>
          {config.message.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < config.message.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </Message>

        {isReconnecting && (
          <ProgressContainer>
            <ProgressBar progress={reconnectProgress} />
          </ProgressContainer>
        )}

        <div>
          {config.showRetry && (
            <Button 
              onClick={handleReconnect} 
              disabled={isReconnecting}
            >
              {isReconnecting ? '재연결 중...' : '다시 시도'}
            </Button>
          )}
          
          {config.showContact && (
            <SecondaryButton onClick={() => setShowContactInfo(!showContactInfo)}>
              {showContactInfo ? '접기' : '문의하기'}
            </SecondaryButton>
          )}
        </div>

        {showContactInfo && (
          <ContactInfo>
            <strong>📞 긴급 문의</strong><br />
            서버 문제가 지속되는 경우 관리자에게 연락해 주세요.<br />
            <br />
            <strong>이메일:</strong> nunconnect1@gmail.com<br />
            <strong>상태:</strong> {serverStatus?.message}<br />
            <strong>시간:</strong> {new Date(serverStatus?.timestamp).toLocaleString('ko-KR')}
          </ContactInfo>
        )}

        <TimeInfo>
          <div>{config.estimatedTime}</div>
          <div>마지막 확인: {new Date().toLocaleString('ko-KR')}</div>
        </TimeInfo>
      </NoticeContainer>
    </NoticeOverlay>
  );
};

export default ServerNotice;