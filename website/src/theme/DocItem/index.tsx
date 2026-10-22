import React, { useState, useRef } from 'react';
import DocItem from '@theme-original/DocItem';
import ChapterProgress from '@site/src/components/ChapterProgress';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAskAiCapture } from '@site/src/features/ask-ai';

import styles from './styles.module.css';

export default function DocItemWrapper(props) {
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [isLoadingPersonalize, setIsLoadingPersonalize] = useState(false);
  const [errorPersonalize, setErrorPersonalize] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isLoadingTranslate, setIsLoadingTranslate] = useState(false);
  const [errorTranslate, setErrorTranslate] = useState<string | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useAskAiCapture(props.content.metadata.id);

  const handlePersonalize = async () => {
    const chapterText = contentRef.current?.innerText || '';
    if (!chapterText) {
      alert("Could not find chapter content to personalize.");
      return;
    }

    setIsLoadingPersonalize(true);
    setErrorPersonalize(null);
    setPersonalizedContent(null);
    setTranslatedContent(null);

    try {
      const response = await fetch('/api/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapter_original_text: chapterText,
          user_id: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPersonalizedContent(data.personalized_chapter_text);
        setShowTranslated(false);
      } else {
        setErrorPersonalize(data.detail || 'Failed to personalize chapter.');
      }
    } catch (err) {
      console.error('Error personalizing chapter:', err);
      setErrorPersonalize('Network error or server unavailable.');
    } finally {
      setIsLoadingPersonalize(false);
    }
  };

  const handleTranslate = async () => {
    const textToTranslate = personalizedContent || contentRef.current?.innerText || '';
    if (!textToTranslate) {
      alert("Could not find chapter content to translate.");
      return;
    }

    setIsLoadingTranslate(true);
    setErrorTranslate(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToTranslate,
          target_language: 'Urdu',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslatedContent(data.translated_text);
        setShowTranslated(true);
      } else {
        setErrorTranslate(data.detail || 'Failed to translate chapter.');
      }
    } catch (err) {
      console.error('Error translating chapter:', err);
      setErrorTranslate('Network error or server unavailable.');
    } finally {
      setIsLoadingTranslate(false);
    }
  };

  const displayContent = showTranslated
    ? translatedContent
    : personalizedContent;

  return (
    <>
      <ChapterProgress chapterId={props.content.metadata.id} />

      <div className={styles.apparatusRow}>
        <div className={styles.apparatusInner}>
          <div className={styles.apparatusHead}>
            <span className={styles.apparatusLabel}>Study apparatus</span>
            <span className={styles.apparatusDot} aria-hidden="true" />
            <p className={styles.apparatusCopy}>
              Personalize this chapter or read it in Urdu.
            </p>
          </div>
          <div className={styles.apparatusActions}>
            <button
              type="button"
              className={styles.primary}
              onClick={handlePersonalize}
              disabled={isLoadingPersonalize}>
              {isLoadingPersonalize ? 'Personalizing...' : 'Personalize'}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleTranslate}
              disabled={isLoadingTranslate}>
              <span className={styles.urdu}>اردو میں پڑھیں</span>
              <span>Read in Urdu</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.messages}>
        {errorPersonalize && (
          <div className={`${styles.banner} ${styles.error}`} role="alert">
            {errorPersonalize}
          </div>
        )}
        {errorTranslate && (
          <div className={`${styles.banner} ${styles.error}`} role="alert">
            {errorTranslate}
          </div>
        )}
        {personalizedContent && (
          <div className={`${styles.banner} ${styles.info}`}>
            This chapter has been personalized for your experience level.
          </div>
        )}
      </div>

      {displayContent ? (
        <div className={styles.personalizedRow}>
          <div className={styles.personalizedSheet}>
            <div className={styles.personalizedHead}>
              <span className={styles.apparatusLabel}>
                {showTranslated ? 'Urdu translation' : 'Personalized chapter'}
              </span>
              <span className={styles.personalizedRule} aria-hidden="true" />
            </div>
            <div
              className={`${styles.personalizedBody} theme-doc-markdown markdown`}
              lang={showTranslated ? 'ur' : undefined}
              dir={showTranslated ? 'rtl' : undefined}
              style={
                showTranslated
                  ? {
                      fontFamily: "'Noto Nastaliq Urdu', serif",
                      lineHeight: '2.8',
                    }
                  : undefined
              }>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}>
                {displayContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <div ref={contentRef}>
          <DocItem {...props} />
        </div>
      )}
    </>
  );
}
