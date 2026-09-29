import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { useEffect } from 'react';
import { AskAiProvider, useAskAi } from '@site/src/features/ask-ai';
import RAGChatbot from '../RAGChatbot';

type ReadResult = { done: boolean; value?: Uint8Array };

function SelectStub({
  text = 'stubbed selection',
  chapterId = 'stub-chapter',
}: {
  text?: string;
  chapterId?: string;
}) {
  const { select } = useAskAi();
  useEffect(() => {
    select(text, chapterId, { x: 1, y: 2 });
  }, [select, text, chapterId]);
  return null;
}

function Harness(props: { text?: string; chapterId?: string }) {
  return (
    <AskAiProvider>
      <SelectStub {...props} />
      <RAGChatbot />
    </AskAiProvider>
  );
}

function openChat(container: HTMLElement) {
  const toggle = container.querySelector('button.w-14');
  if (!toggle) throw new Error('chat toggle not found');
  fireEvent.click(toggle);
}

function stubFetchWith(reader: { read: () => Promise<ReadResult> }) {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
    ok: true,
    status: 200,
    body: { getReader: () => reader },
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('RAGChatbot through the AskAi module interface', () => {
  it('11. writes selection only through select() — chip renders it once the chat opens', () => {
    const { container } = render(<Harness />);
    openChat(container);

    expect(screen.getByText('Context from selection:')).toBeTruthy();
    expect(screen.getByText('stubbed selection')).toBeTruthy();
  });

  it('12. request body carries selected_text and chapter_id from the module state', async () => {
    const encoder = new TextEncoder();
    let reads = 0;
    const fetchMock = stubFetchWith({
      read: async () =>
        reads++ === 0
          ? { done: false, value: encoder.encode('answer chunk') }
          : { done: true },
    });

    const { container } = render(<Harness />);
    openChat(container);

    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), {
      target: { value: 'How does a gripper work?' },
    });
    const form = container.querySelector('form');
    if (!form) throw new Error('chat form not found');
    fireEvent.submit(form);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.message).toBe('How does a gripper work?');
    expect(body.selected_text).toBe('stubbed selection');
    expect(body.chapter_id).toBe('stub-chapter');
  });

  it('13. E2: a fresh selection made mid-stream survives the stream completing', async () => {
    let resolveFirst: (r: ReadResult) => void;
    let resolveSecond: (r: ReadResult) => void;
    const first = new Promise<ReadResult>((resolve) => (resolveFirst = resolve));
    const second = new Promise<ReadResult>((resolve) => (resolveSecond = resolve));
    const reads = [first, second];
    stubFetchWith({ read: () => reads.shift() ?? Promise.resolve({ done: true }) });

    const encoder = new TextEncoder();
    const { container, rerender } = render(
      <Harness text="initial selection" chapterId="chapter-a" />
    );
    openChat(container);
    expect(screen.getByText('initial selection')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), {
      target: { value: 'stream question' },
    });
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(reads.length).toBe(1));

    await act(async () => {
      resolveFirst!({ done: false, value: encoder.encode('partial answer ') });
      await Promise.resolve();
    });
    expect(reads.length).toBe(0);

    rerender(<Harness text="fresh selection" chapterId="chapter-b" />);
    expect(screen.getByText('fresh selection')).toBeTruthy();

    await act(async () => {
      resolveSecond!({ done: true });
      await Promise.resolve();
    });

    expect(screen.getByText('fresh selection')).toBeTruthy();
    expect(screen.queryByText('initial selection')).toBeNull();
  });

  it('14. completed stream with no intervening selection clears the selection', async () => {
    const encoder = new TextEncoder();
    let reads = 0;
    stubFetchWith({
      read: async () =>
        reads++ === 0
          ? { done: false, value: encoder.encode('the answer') }
          : { done: true },
    });

    const { container } = render(<Harness text="sent selection" chapterId="chapter-c" />);
    openChat(container);
    expect(screen.getByText('sent selection')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), {
      target: { value: 'clear me after streaming' },
    });
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() =>
      expect(screen.queryByText('Context from selection:')).toBeNull()
    );
    expect(screen.queryByText('sent selection')).toBeNull();
  });
});
