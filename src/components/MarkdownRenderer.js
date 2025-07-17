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
  
  /* 이미지 스타일 */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px 0;
    display: block;
    box-shadow: 0 4px 16px ${colors.shadow};
    border: 1px solid ${colors.border};
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px ${colors.shadow};
    }
    
    /* 이미지 로딩 중일 때 */
    &[src=""], &:not([src]) {
      background: ${colors.light};
      border: 2px dashed ${colors.border};
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:before {
        content: '🖼️ 이미지 로딩 중...';
        color: ${colors.secondary};
        font-size: 14px;
      }
    }
    
    /* 이미지 로드 실패 시 */
    &.error {
      background: rgba(255, 107, 107, 0.1);
      border: 2px dashed ${colors.danger};
      
      &:before {
        content: '❌ 이미지를 불러올 수 없습니다';
        color: ${colors.danger};
      }
    }
  }
  
  /* 동영상 스타일 */
  video {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
    display: block;
    box-shadow: 0 4px 16px ${colors.shadow};
    border: 1px solid ${colors.border};
  }
`;

// 이미지 URL을 절대 경로로 변환하는 함수
const normalizeImageUrl = (url) => {
  if (!url) return '';
  
  // 이미 절대 URL인 경우 (http:// 또는 https://로 시작)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 상대 경로인 경우 절대 경로로 변환
  if (url.startsWith('/api/')) {
    // 개발 환경과 프로덕션 환경 구분
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5159';
    return `${baseUrl}${url}`;
  }
  
  // /api/로 시작하지 않는 상대 경로인 경우
  if (url.startsWith('/')) {
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5159';
    return `${baseUrl}${url}`;
  }
  
  // 상대 경로를 /api/files/temp/ 기본 경로로 처리
  if (!url.startsWith('/') && !url.includes('/')) {
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5159';
    return `${baseUrl}/api/files/temp/${url}`;
  }
  
  return url;
};

// 마크다운 파서 함수 (이미지 처리 개선)
const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // 0. HTML 태그를 보존 (특히 동영상 태그를 위해)
  const htmlTags = [];
  html = html.replace(/<([^>]+)>/g, (match) => {
    htmlTags.push(match);
    return `__HTML_TAG_${htmlTags.length - 1}__`;
  });
  
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
  
  // 5. 이미지 처리 개선 (![대체텍스트](이미지URL))
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    const normalizedUrl = normalizeImageUrl(url.trim());
    return `<img src="${normalizedUrl}" alt="${alt}" loading="lazy" onerror="this.classList.add('error'); console.error('이미지 로드 실패:', '${normalizedUrl}');" />`;
  });
  
  // 6. 줄바꿈을 기준으로 분할하여 각 줄 처리
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
  
  // 7. 링크 처리 [텍스트](URL)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 8. 자동 링크 처리 (http:// 또는 https://로 시작하는 URL, 단 이미 img 태그 안에 있는 것은 제외)
  html = html.replace(/(^|[^"'])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  
  // 9. HTML 태그 복원
  html = html.replace(/__HTML_TAG_(\d+)__/g, (match, index) => {
    return htmlTags[parseInt(index)];
  });
  
  return html;
};

// MarkdownRenderer 컴포넌트
const MarkdownRenderer = ({ content, className, style }) => {
  const htmlContent = parseMarkdown(content);
  
  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 MarkdownRenderer - Original content:', content);
    console.log('🎨 MarkdownRenderer - Parsed HTML:', htmlContent);
    
    // 이미지 URL 추출 및 확인
    const imageMatches = content ? content.match(/!\[.*?\]\((.*?)\)/g) : [];
    if (imageMatches) {
      console.log('🖼️ 감지된 이미지들:', imageMatches);
      imageMatches.forEach((match, index) => {
        const urlMatch = match.match(/!\[.*?\]\((.*?)\)/);
        if (urlMatch) {
          const originalUrl = urlMatch[1];
          const normalizedUrl = normalizeImageUrl(originalUrl);
          console.log(`🖼️ 이미지 ${index + 1}:`, {
            original: originalUrl,
            normalized: normalizedUrl
          });
        }
      });
    }
  }
  
  return (
    <MarkdownContainer 
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;