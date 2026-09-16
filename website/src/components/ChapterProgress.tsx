import React, { useState, useEffect } from 'react';

interface ChapterProgressProps {
  chapterId: string;
}

const ChapterProgress: React.FC<ChapterProgressProps> = ({ chapterId }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const chapterContent = document.querySelector('.theme-doc-markdown');
      if (chapterContent) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setProgress(Math.min(100, Math.max(0, scrolled)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterId]);

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-light z-[9999] transition-all duration-150 ease-out"
      style={{ width: `${progress}%` }}
    />
  );
};

export default ChapterProgress;