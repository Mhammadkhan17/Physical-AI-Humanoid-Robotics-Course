import React, { useState, useEffect } from 'react';

import styles from './ChapterProgress.module.css';

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
      className={styles.progress}
      role="progressbar"
      aria-label="Chapter reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      style={{ width: `${progress}%` }}
    />
  );
};

export default ChapterProgress;