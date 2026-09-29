import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Selection = { text: string; chapterId: string } | null;
export type Anchor = { x: number; y: number } | null;

type AskAiState = {
  selection: Selection;
  isOpen: boolean;
  anchor: Anchor;
};

export type AskAiContextValue = {
  selection: Selection;
  isOpen: boolean;
  anchor: Anchor;
  select: (text: string, chapterId: string, anchor: Anchor) => void;
  ask: () => void;
  open: () => void;
  close: () => void;
  clear: () => void;
};

const AskAiContext = createContext<AskAiContextValue | null>(null);

const initialState: AskAiState = { selection: null, isOpen: false, anchor: null };

export function AskAiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AskAiState>(initialState);

  const select = useCallback((text: string, chapterId: string, anchor: Anchor) => {
    setState((prev) => ({ ...prev, selection: { text, chapterId }, anchor }));
  }, []);

  const clear = useCallback(() => {
    setState((prev) => ({ ...prev, selection: null, anchor: null }));
  }, []);

  const ask = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
    window.getSelection()?.removeAllRanges();
  }, []);

  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, selection: null, anchor: null }));
  }, []);

  const value: AskAiContextValue = {
    selection: state.selection,
    isOpen: state.isOpen,
    anchor: state.anchor,
    select,
    ask,
    open,
    close,
    clear,
  };

  return <AskAiContext.Provider value={value}>{children}</AskAiContext.Provider>;
}

export function useAskAi(): AskAiContextValue {
  const ctx = useContext(AskAiContext);
  if (!ctx) {
    throw new Error('useAskAi must be used within an AskAiProvider');
  }
  return ctx;
}
