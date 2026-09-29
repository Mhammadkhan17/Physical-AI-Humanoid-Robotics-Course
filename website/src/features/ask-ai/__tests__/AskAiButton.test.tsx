import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AskAiProvider, useAskAi } from '../context';
import { AskAiButton } from '../AskAiButton';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AskAiProvider>
    {children}
    <AskAiButton />
  </AskAiProvider>
);

function getButton(): HTMLButtonElement | null {
  return document.body.querySelector<HTMLButtonElement>('button[data-ask-ai-surface]');
}

afterEach(() => {
  cleanup();
});

describe('AskAiButton (derived visibility)', () => {
  it('15. hidden when there is no selection', () => {
    renderHook(() => useAskAi(), { wrapper });

    expect(getButton()).toBeNull();
    expect(document.body.textContent).not.toContain('Ask AI about this');
  });

  it('16. renders after select() with anchor coords and the surface marker', () => {
    const { result } = renderHook(() => useAskAi(), { wrapper });

    act(() => result.current.select('what is torque?', 'module-2', { x: 120, y: 80 }));

    const button = getButton();
    expect(button).not.toBeNull();
    expect(button!.textContent).toBe('Ask AI about this');
    expect(button!.style.left).toBe('120px');
    expect(button!.style.top).toBe('80px');
  });

  it('17. hidden while the chat is open; ask() keeps the selection for the chip', () => {
    const { result } = renderHook(() => useAskAi(), { wrapper });

    act(() => result.current.select('pick and place', 'module-3', { x: 5, y: 6 }));
    expect(getButton()).not.toBeNull();

    act(() => result.current.ask());

    expect(getButton()).toBeNull();
    expect(result.current.selection).toEqual({
      text: 'pick and place',
      chapterId: 'module-3',
    });
    expect(result.current.isOpen).toBe(true);
  });
});
