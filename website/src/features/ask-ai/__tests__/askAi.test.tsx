import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AskAiProvider, useAskAi } from '../context';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AskAiProvider>{children}</AskAiProvider>
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AskAi transitions', () => {
  it('1. select sets text + chapterId + anchor atomically; clear nulls all three', () => {
    const { result } = renderHook(() => useAskAi(), { wrapper });

    act(() => result.current.select('what is torque?', 'module-2-batteries', { x: 120, y: 80 }));

    expect(result.current.selection).toEqual({
      text: 'what is torque?',
      chapterId: 'module-2-batteries',
    });
    expect(result.current.anchor).toEqual({ x: 120, y: 80 });

    act(() => result.current.clear());

    expect(result.current.selection).toBeNull();
    expect(result.current.anchor).toBeNull();
    expect(result.current.selection?.chapterId).toBeUndefined();
  });

  it('2. ask() opens the chat, keeps the selection, and collapses the DOM selection', () => {
    const removeAllRanges = vi.fn();
    vi.spyOn(window, 'getSelection').mockReturnValue({
      removeAllRanges,
    } as unknown as Selection);

    const { result } = renderHook(() => useAskAi(), { wrapper });

    act(() => result.current.select('pick and place', 'module-3-manipulators', { x: 10, y: 20 }));
    act(() => result.current.ask());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selection).toEqual({
      text: 'pick and place',
      chapterId: 'module-3-manipulators',
    });
    expect(removeAllRanges).toHaveBeenCalledTimes(1);
  });

  it('3. open() keeps the selection; close() clears it', () => {
    const { result } = renderHook(() => useAskAi(), { wrapper });

    act(() => result.current.select('inverse kinematics', 'module-3-manipulators', { x: 5, y: 6 }));
    act(() => result.current.open());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selection).not.toBeNull();

    act(() => result.current.close());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selection).toBeNull();
    expect(result.current.anchor).toBeNull();
  });

  it('4. transitions are referentially stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useAskAi(), { wrapper });

    const first = {
      select: result.current.select,
      ask: result.current.ask,
      open: result.current.open,
      close: result.current.close,
      clear: result.current.clear,
    };

    act(() => result.current.select('stability check', 'module-1', { x: 1, y: 2 }));
    rerender();

    expect(result.current.select).toBe(first.select);
    expect(result.current.ask).toBe(first.ask);
    expect(result.current.open).toBe(first.open);
    expect(result.current.close).toBe(first.close);
    expect(result.current.clear).toBe(first.clear);
  });

  it('4b. useAskAi() throws outside an AskAiProvider', () => {
    expect(() => renderHook(() => useAskAi())).toThrow(
      'useAskAi must be used within an AskAiProvider'
    );
  });
});
