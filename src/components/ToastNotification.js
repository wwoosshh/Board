import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

// 애니메이션 정의
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// 토스트 컨테이너
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// 토스트 아이템
const ToastItem = styled.div`
  min-width: 300px;
  max-width: 500px;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${props => props.isExiting ? css`${slideOut} 0.3s ease-in-out` : css`${slideIn} 0.3s ease-in-out`};
  
  ${props => {
    switch (props.type) {
      case 'success':
        return css`
          background-color: #4CAF50;
          color: white;
        `;
      case 'error':
        return css`
          background-color: #f44336;
          color: white;
        `;
      case 'warning':
        return css`
          background-color: #ff9800;
          color: white;
        `;
      case 'info':
        return css`
          background-color: #2196F3;
          color: white;
        `;
      default:
        return css`
          background-color: #333;
          color: white;
        `;
    }
  }}
`;

const ToastContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const ToastIcon = styled.div`
  margin-right: 12px;
  font-size: 20px;
`;

const ToastMessage = styled.div`
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
`;

const ToastTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
  border-radius: 4px;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 0 0 8px 8px;
  animation: shrink ${props => props.duration}ms linear;
  
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// 토스트 타입별 아이콘
const getIcon = (type) => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📢';
  }
};

// 개별 토스트 컴포넌트
const Toast = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.autoClose !== false) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // 애니메이션 시간과 맞춤
  };

  return (
    <ToastItem type={toast.type} isExiting={isExiting}>
      <ToastContent>
        <ToastIcon>{getIcon(toast.type)}</ToastIcon>
        <ToastMessage>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.message}
        </ToastMessage>
      </ToastContent>
      <CloseButton onClick={handleRemove}>
        ✕
      </CloseButton>
      {toast.autoClose !== false && (
        <ProgressBar duration={toast.duration || 5000} />
      )}
    </ToastItem>
  );
};

// 토스트 컨테이너 컴포넌트
const ToastNotification = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </ToastContainer>
  );
};

// 토스트 훅
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false,
      ...options
    };

    setToasts(prev => [...prev, toast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  // 편의 함수들
  const success = (message, options = {}) => addToast(message, { ...options, type: 'success' });
  const error = (message, options = {}) => addToast(message, { ...options, type: 'error' });
  const warning = (message, options = {}) => addToast(message, { ...options, type: 'warning' });
  const info = (message, options = {}) => addToast(message, { ...options, type: 'info' });

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };
};

export default ToastNotification;