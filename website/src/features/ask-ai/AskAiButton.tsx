import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAskAi } from './context';

export function AskAiButton() {
  const { selection, isOpen, anchor, ask } = useAskAi();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !selection || isOpen || !anchor) {
    return null;
  }

  return createPortal(
    <button
      data-ask-ai-surface=""
      className="fixed z-[1001] px-4 py-2 bg-brand text-brand-foreground text-sm font-medium rounded-md shadow-lg hover:bg-brand-hover transition-colors"
      style={{ left: anchor.x, top: anchor.y }}
      onClick={ask}
    >
      Ask AI about this
    </button>,
    document.body
  );
}
