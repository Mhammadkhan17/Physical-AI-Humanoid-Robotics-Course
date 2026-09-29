import { useEffect, useRef } from 'react';
import { useAskAi } from './context';
import type { AskAiContextValue } from './context';

const SURFACE_SELECTOR = '[data-ask-ai-surface]';
const LADDER =
  '.markdown, .theme-doc-markdown, .theme-doc-markdown-container, article';
const DEBOUNCE_MS = 10;

export function useAskAiCapture(chapterId: string): void {
  const ai = useAskAi();
  const aiRef = useRef<AskAiContextValue>(ai);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    aiRef.current = ai;
  });

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(SURFACE_SELECTOR)) {
        return;
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const selection = window.getSelection();
        if (!selection) return;
        const selectedString = selection.toString().trim();
        if (selectedString.length === 0) {
          aiRef.current.clear();
          return;
        }
        const anchorNode = selection.anchorNode;
        if (!anchorNode) return;
        const targetNode =
          anchorNode.nodeType === Node.TEXT_NODE
            ? anchorNode.parentElement
            : (anchorNode as Element);
        const markdownContainer = targetNode?.closest(LADDER);
        if (markdownContainer) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          aiRef.current.select(selectedString, chapterId, {
            x: rect.right - 50,
            y: rect.bottom + 5,
          });
        }
      }, DEBOUNCE_MS);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      aiRef.current.clear();
    };
  }, [chapterId]);
}
