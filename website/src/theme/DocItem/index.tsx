import React, { useState, useEffect, useRef } from 'react';
import DocItem from '@theme-original/DocItem';
import ChapterProgress from '@site/src/components/ChapterProgress';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useSelectedText } from '@site/src/contexts/SelectedTextContext';
import { useChatbotVisibility } from '@site/src/contexts/ChatbotVisibilityContext';

export default function DocItemWrapper(props) {
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [isLoadingPersonalize, setIsLoadingPersonalize] = useState(false);
  const [errorPersonalize, setErrorPersonalize] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isLoadingTranslate, setIsLoadingTranslate] = useState(false);
  const [errorTranslate, setErrorTranslate] = useState<string | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const [showAskAiButton, setShowAskAiButton] = useState(false);
  const [askAiButtonPosition, setAskAiButtonPosition] = useState({ x: 0, y: 0 });

  const { selectedText, setSelectedText, setChapterId } = useSelectedText();
  const { setIsOpen: setChatbotOpen } = useChatbotVisibility();
  const history = useHistory();
  const quizUrl = useBaseUrl('/quiz');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (contentRef.current && contentRef.current.contains(event.target as Node)) {
        const selection = window.getSelection();
        const selectedString = selection.toString().trim();

        if (selectedString.length > 0) {
          setSelectedText(selectedString);
          setChapterId(props.content.metadata.id);
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setAskAiButtonPosition({
            x: rect.right + window.scrollX - 50,
            y: rect.bottom + window.scrollY + 5,
          });
          setShowAskAiButton(true);
        } else {
          setSelectedText(null);
          setChapterId(null);
          setShowAskAiButton(false);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSelectedText, setChapterId, props.content.metadata.id]);

  useEffect(() => {
    if (!selectedText) {
      setShowAskAiButton(false);
    }
  }, [selectedText]);

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

  const handleAskAiClick = () => {
    if (selectedText) {
      setChatbotOpen(true);
      setShowAskAiButton(false);
    }
  };

  return (
    <>
      <ChapterProgress chapterId={props.content.metadata.id} />
      
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePersonalize}
          disabled={isLoadingPersonalize}
        >
          {isLoadingPersonalize ? 'Personalizing...' : 'Personalize this chapter'}
        </button>
        <button
          className="px-4 py-2 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleTranslate}
          disabled={isLoadingTranslate}
        >
          <span className="font-urdu mr-2">اردو میں پڑھیں</span> Read in Urdu
        </button>
      </div>

      {/* Error Messages */}
      {errorPersonalize && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {errorPersonalize}
        </div>
      )}
      {errorTranslate && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {errorTranslate}
        </div>
      )}

      {/* Personalization Banner */}
      {personalizedContent && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-5 text-sm dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
          This chapter has been personalized for your experience level.
        </div>
      )}

      {/* Main Content */}
      {displayContent ? (
        <ReactMarkdown
          style={showTranslated ? { fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', lineHeight: '3em' } : undefined}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {displayContent}
        </ReactMarkdown>
      ) : (
        <div ref={contentRef}>
          <DocItem {...props} />
        </div>
      )}

      {/* Floating Ask AI Button */}
      {showAskAiButton && selectedText && (
        <button
          className="fixed z-[1001] px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow-lg hover:bg-primary-dark transition-colors"
          style={{ left: askAiButtonPosition.x, top: askAiButtonPosition.y }}
          onClick={handleAskAiClick}
        >
          Ask AI about this
        </button>
      )}
    </>
  );
}
