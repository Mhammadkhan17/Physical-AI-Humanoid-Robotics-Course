import React, { useState, useEffect } from 'react';

interface ChapterProgressProps {
  chapterId: string;
}

const ChapterProgress: React.FC<ChapterProgressProps> = ({ chapterId }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const chapterContent = document.querySelector('.theme-doc-markdown'); // Docusaurus content class
      if (chapterContent) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setProgress(Math.min(100, Math.max(0, scrolled))); // Ensure progress is between 0 and 100
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterId]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${progress}%`,
      height: '5px',
      backgroundColor: 'var(--ifm-color-primary)',
      zIndex: 9999,
    }}>
      {/* For debugging */}
      {/* <span style={{ color: 'white', marginLeft: '10px' }}>{Math.round(progress)}%</span> */}
    </div>
  );
};

export default ChapterProgress;