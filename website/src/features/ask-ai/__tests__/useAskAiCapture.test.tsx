import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, fireEvent, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AskAiProvider, useAskAi } from '../context';
import { useAskAiCapture } from '../useAskAiCapture';

const spies = vi.hoisted(() => ({
  select: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('../context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../context')>();
  return {
    ...actual,
    useAskAi: () => {
      const ai = actual.useAskAi();
      return {
        ...ai,
        select: (text: string, chapterId: string, anchor: { x: number; y: number } | null) => {
          spies.select(text, chapterId, anchor);
          ai.select(text, chapterId, anchor);
        },
        clear: () => {
          spies.clear();
          ai.clear();
        },
      };
    },
  };
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <AskAiProvider>{children}</AskAiProvider>
);

const CHAPTER = 'chapter-1';
const RECT = { right: 100, bottom: 200 };

function stubSelection(text: string, container: HTMLElement): Selection {
  return {
    toString: () => text,
    anchorNode: container.firstChild,
    rangeCount: text ? 1 : 0,
    getRangeAt: () => ({
      getBoundingClientRect: () => RECT,
    }),
  } as unknown as Selection;
}

function makeDiv(className: string, text = 'sample text'): HTMLDivElement {
  const div = document.createElement('div');
  div.className = className;
  div.innerHTML = text;
  document.body.appendChild(div);
  return div;
}

function renderCapture() {
  return renderHook(() => {
    const ai = useAskAi();
    useAskAiCapture(CHAPTER);
    return ai;
  }, { wrapper });
}

beforeEach(() => {
  vi.useFakeTimers();
  spies.select.mockClear();
  spies.clear.mockClear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useAskAiCapture (chat-aware selection rules)', () => {
  it('5. Rule 1: non-empty selection inside .markdown → select with rect-derived anchor', () => {
    const { result } = renderCapture();
    const div = makeDiv('markdown', 'pick and place');
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('pick and place', div));

    fireEvent.mouseUp(div);
    act(() => vi.advanceTimersByTime(10));

    expect(spies.select).toHaveBeenCalledWith('pick and place', CHAPTER, { x: 50, y: 205 });
    expect(result.current.selection).toEqual({ text: 'pick and place', chapterId: CHAPTER });
    expect(result.current.anchor).toEqual({ x: 50, y: 205 });
    expect(spies.clear).not.toHaveBeenCalled();
  });

  it('6. Rule 2: empty selection + non-surface target → clear()', () => {
    renderCapture();
    const plain = makeDiv('plain-area', '');
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('', plain));

    fireEvent.mouseUp(plain);
    act(() => vi.advanceTimersByTime(10));

    expect(spies.clear).toHaveBeenCalledTimes(1);
    expect(spies.select).not.toHaveBeenCalled();
  });

  it('6b. mouseup on a chat surface does not clear and schedules no timer', () => {
    renderCapture();
    const surface = document.createElement('div');
    surface.setAttribute('data-ask-ai-surface', '');
    document.body.appendChild(surface);
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('', surface));

    fireEvent.mouseUp(surface);

    expect(spies.clear).not.toHaveBeenCalled();
    expect(spies.select).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('7. Rule 3: target inside [data-ask-ai-surface] with a live selection → ignored entirely', () => {
    renderCapture();
    const surface = makeDiv('chat-window', 'typing in chat');
    surface.setAttribute('data-ask-ai-surface', '');
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('typing in chat', surface));

    fireEvent.mouseUp(surface);
    act(() => vi.advanceTimersByTime(10));

    expect(spies.select).not.toHaveBeenCalled();
    expect(spies.clear).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('8. Ladder: non-empty selection outside the markdown container → nothing happens', () => {
    renderCapture();
    const sidebar = makeDiv('sidebar', 'sidebar text');
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('sidebar text', sidebar));

    fireEvent.mouseUp(sidebar);
    act(() => vi.advanceTimersByTime(10));

    expect(spies.select).not.toHaveBeenCalled();
    expect(spies.clear).not.toHaveBeenCalled();
  });

  it('9. Regression: unmount cancels the pending timer (the DocItem:37 leak)', () => {
    const { unmount } = renderCapture();
    const div = makeDiv('markdown', 'leaky text');
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('leaky text', div));

    fireEvent.mouseUp(div);
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    act(() => vi.advanceTimersByTime(10));

    expect(spies.select).not.toHaveBeenCalled();
  });

  it('10. Rule 4: unmount (client-side navigation) clears the selection', () => {
    const { unmount, result } = renderCapture();
    const div = makeDiv('markdown', 'nav text');
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('nav text', div));

    fireEvent.mouseUp(div);
    act(() => vi.advanceTimersByTime(10));
    expect(result.current.selection).not.toBeNull();

    unmount();

    expect(spies.clear).toHaveBeenCalled();
  });

  it('10b. rapid double mouseup collapses into a single select (debounce)', () => {
    renderCapture();
    const div = makeDiv('markdown', 'debounced text');
    vi.spyOn(window, 'getSelection').mockReturnValue(stubSelection('debounced text', div));

    fireEvent.mouseUp(div);
    fireEvent.mouseUp(div);
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(10));

    expect(spies.select).toHaveBeenCalledTimes(1);
    expect(spies.select).toHaveBeenCalledWith('debounced text', CHAPTER, { x: 50, y: 205 });
  });
});
