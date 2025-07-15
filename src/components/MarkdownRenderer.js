import React from 'react';
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

// 마크다운 스타일 컴포넌트들
const MarkdownContainer = styled.div`
  line-height: 1.6;
  color: ${colors.dark};
  word-break: break-word;
  
  /* 문단 간격 */
  p {
    margin: 0 0 16px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  /* 굵은 텍스트 */
  strong {
    font-weight: 700;
    color: ${colors.dark};
  }
  
  /* 기울임 텍스트 */
  em {
    font-style: italic;
    color: ${colors.secondary};
  }
  
  /* 인라인 코드 */
  code {
    background: ${colors.light};
    color: ${colors.primary};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    border: 1px solid ${colors.border};
  }
  
  /* 코드 블록 */
  pre {
    background: ${colors.light};
    border: 1px solid ${colors.border};
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 16px 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.4;
    
    code {
      background: none;
      border: none;
      padding: 0;
      color: ${colors.dark};
    }
  }
  
  /* 인용문 */
  blockquote {
    border-left: 4px solid ${colors.primary};
    padding-left: 16px;
    margin: 16px 0;
    color: ${colors.secondary};
    font-style: italic;
    background: linear-gradient(90deg, rgba(66, 99, 235, 0.05) 0%, transparent 100%);
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    
    p {
      margin: 0;
    }
  }
  
  /* 목록 */
  ul, ol {
    margin: 16px 0;
    padding-left: 24px;
    
    li {
      margin: 4px 0;
      line-height: 1.5;
    }
  }
  
  ul li {
    list-style-type: disc;
  }
  
  ol li {
    list-style-type: decimal;
  }
  
  /* 링크 */
  a {
    color: ${colors.primary};
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
    
    &:hover {
      border-bottom-color: ${colors.primary};
      background: rgba(66, 99, 235, 0.05);
      padding: 2px 4px;
      margin: -2px -4px;
      border-radius: 4px;
    }
  }
  
  /* 구분선 */
  hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${colors.border}, transparent);
    margin: 24px 0;
    border-radius: 1px;
  }
  
  /* 제목들 */
  h1, h2, h3, h4, h5, h6 {
    margin: 24px 0 16px 0;
    line-height: 1.3;
    font-weight: 600;
    color: ${colors.dark};
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1.1em; }
  h5 { font-size: 1em; }
  h6 { font-size: 0.9em; }
`;

// 마크다운 파서 함수
const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // 1. 코드 블록 처리 (```로 감싸진 부분)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // 2. 인라인 코드 처리 (`로 감싸진 부분)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 3. 굵은 텍스트 처리 (**텍스트** 또는 __텍스트__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // 4. 기울임 텍스트 처리 (*텍스트* 또는 _텍스트_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // 5. 줄바꿈을 기준으로 분할하여 각 줄 처리
  const lines = html.split('\n');
  const processedLines = [];
  let inList = false;
  let inBlockquote = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 빈 줄 처리
    if (line.trim() === '') {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inBlockquote) {
        processedLines.push('</blockquote>');
        inBlockquote = false;
      }
      processedLines.push('<br>');
      continue;
    }
    
    // 제목 처리 (# ## ### 등)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inBlockquote) {
        processedLines.push('</blockquote>');
        inBlockquote = false;
      }
      processedLines.push(`<h${level}>${text}</h${level}>`);
      continue;
    }
    
    // 인용문 처리 (> 로 시작)
    if (line.startsWith('> ')) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (!inBlockquote) {
        processedLines.push('<blockquote>');
        inBlockquote = true;
      }
      processedLines.push(`<p>${line.substring(2)}</p>`);
      continue;
    } else if (inBlockquote) {
      processedLines.push('</blockquote>');
      inBlockquote = false;
    }
    
    // 목록 처리 (- 또는 * 로 시작)
    if (line.match(/^[\-\*]\s+/)) {
      if (inBlockquote) {
        processedLines.push('</blockquote>');
        inBlockquote = false;
      }
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${line.substring(2)}</li>`);
      continue;
    } else if (inList) {
      processedLines.push('</ul>');
      inList = false;
    }
    
    // 구분선 처리 (--- 또는 ***)
    if (line.match(/^(---|\*\*\*)$/)) {
      processedLines.push('<hr>');
      continue;
    }
    
    // 일반 텍스트 (문단)
    if (line.trim()) {
      processedLines.push(`<p>${line}</p>`);
    }
  }
  
  // 열린 태그들 닫기
  if (inList) {
    processedLines.push('</ul>');
  }
  if (inBlockquote) {
    processedLines.push('</blockquote>');
  }
  
  html = processedLines.join('\n');
  
  // 6. 링크 처리 [텍스트](URL)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 7. 자동 링크 처리 (http:// 또는 https://로 시작하는 URL)
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return html;
};

// MarkdownRenderer 컴포넌트
const MarkdownRenderer = ({ content, className, style }) => {
  const htmlContent = parseMarkdown(content);
  
  return (
    <MarkdownContainer 
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;