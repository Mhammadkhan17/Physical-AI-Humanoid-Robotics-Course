import React, { useState, useRef } from 'react';
import DocItem from '@theme-original/DocItem';
import ChapterProgress from '@site/src/components/ChapterProgress';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAskAiCapture } from '@site/src/features/ask-ai';

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
      
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          className="px-4 py-2 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePersonalize}
          disabled={isLoadingPersonalize}
        >
          {isLoadingPersonalize ? 'Personalizing...' : 'Personalize this chapter'}
        </button>
        <button
          className="px-4 py-2 border-2 border-brand text-brand font-medium rounded-md hover:bg-brand-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleTranslate}
          disabled={isLoadingTranslate}
        >
          <span className="font-urdu mr-2">اردو میں پڑھیں</span> Read in Urdu
        </button>
      </div>

      {/* Error Messages */}
      {errorPersonalize && (
        <div className="bg-danger-bg border border-danger-border text-danger-text px-4 py-3 rounded-md mb-4 text-sm dark:bg-danger-dark-bg dark:border-danger-dark-border dark:text-danger-dark-text">
          {errorPersonalize}
        </div>
      )}
      {errorTranslate && (
        <div className="bg-danger-bg border border-danger-border text-danger-text px-4 py-3 rounded-md mb-4 text-sm dark:bg-danger-dark-bg dark:border-danger-dark-border dark:text-danger-dark-text">
          {errorTranslate}
        </div>
      )}

      {/* Personalization Banner */}
      {personalizedContent && (
        <div className="bg-info-bg border border-info-border text-info-text px-4 py-3 rounded-md mb-5 text-sm dark:bg-info-dark-bg dark:border-info-dark-border dark:text-info-dark-text">
          This chapter has been personalized for your experience level.
        </div>
      )}

      {/* Main Content */}
      {displayContent ? (
        <div style={showTranslated ? { fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', lineHeight: '3em' } : undefined}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
      ) : (
        <div ref={contentRef}>
          <DocItem {...props} />
        </div>
      )}
    </>
  );
}
