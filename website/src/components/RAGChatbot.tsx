import React, { useState, useEffect, useRef } from 'react';
import { useAskAi } from '@site/src/features/ask-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styles from './RAGChatbot.module.css';

type Message = {
  text: string;
  sender: 'user' | 'bot';
  groundedInSelection?: boolean;
  isError?: boolean;
};

const STARTER_QUESTIONS = [
  'What is a digital twin?',
  'How do ROS 2 topics differ from services?',
  'What does a vision-language-action model do?',
];

const ERROR_TEXT =
  'The answer service is unreachable. Check the connection and send the question again.';

function chapterLabel(id: string) {
  const match = id.match(/^module-(\d+)/i);
  return match ? `Module ${match[1]}` : id;
}

function BookMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 5.5c2.4-.9 5.1-.9 7.5 0v13c-2.4-.9-5.1-.9-7.5 0z" />
      <path d="M12 5.5c2.4-.9 5.1-.9 7.5 0v13c-2.4-.9-5.1-.9-7.5 0" />
      <path d="M12 5.5v13" />
    </svg>
  );
}

function SendMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function ExpandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {collapsed ? (
        <>
          <path d="M9 4H4v5" />
          <path d="M15 4h5v5" />
          <path d="M9 20H4v-5" />
          <path d="M15 20h5v-5" />
        </>
      ) : (
        <>
          <path d="M4 9h5V4" />
          <path d="M20 9h-5V4" />
          <path d="M4 15h5v5" />
          <path d="M20 15h-5v5" />
        </>
      )}
    </svg>
  );
}

function CloseMark() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function PromptArrow() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

const RAGChatbot: React.FC = () => {
  const { selection, isOpen, open, close, clear } = useAskAi();
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const selectionRef = useRef(selection);

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion || isStreaming ? 'auto' : 'smooth',
    });
  }, [chatHistory, isStreaming]);

  useEffect(() => {
    selectionRef.current = selection;
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isExpanded, close]);

  useEffect(() => {
    if (!isExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      launcherRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isExpanded) return;
    const panel = panelRef.current;
    if (!panel) return;
    const selector =
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(selector)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExpanded]);

  const toggleChat = () => {
    if (isOpen) {
      close();
    } else {
      open();
      const canFocus =
        typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
      if (canFocus) {
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (text === '' || isStreaming) return;

    const snapshot = selection;
    const hasSelection = Boolean(snapshot && snapshot.text.trim().length > 0);
    const newUserMessage: Message = { text, sender: 'user' };
    const newBotMessage: Message = {
      text: '',
      sender: 'bot',
      groundedInSelection: hasSelection,
    };
    setChatHistory((prev) => [...prev, newUserMessage, newBotMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const body: { message: string; selected_text?: string; chapter_id?: string } = {
        message: text,
      };
      if (snapshot && snapshot.text.trim().length > 0) {
        body.selected_text = snapshot.text;
        if (snapshot.chapterId) {
          body.chapter_id = snapshot.chapterId;
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let detail = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            detail = JSON.stringify(errorData.detail);
          }
        } catch {
          detail = `HTTP error! status: ${response.status}`;
        }
        throw new Error(detail);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setChatHistory((prev) => {
          if (prev.length === 0) return prev;
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.sender !== 'bot' || lastMessage.isError) return prev;
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: lastMessage.text + chunk },
          ];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => {
        if (prev.length === 0) return prev;
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.sender === 'bot' && !lastMessage.isError && lastMessage.text === '') {
          return [
            ...prev.slice(0, -1),
            { text: ERROR_TEXT, sender: 'bot', isError: true },
          ];
        }
        return [...prev, { text: ERROR_TEXT, sender: 'bot', isError: true }];
      });
    } finally {
      setIsStreaming(false);
      const current = selectionRef.current;
      if (
        current &&
        snapshot &&
        current.text === snapshot.text &&
        current.chapterId === snapshot.chapterId
      ) {
        clear();
      }
    }
  };

  const hasSelection = Boolean(selection && selection.text.trim().length > 0);

  return (
    <div className="fixed bottom-4 right-4 z-[1000] sm:bottom-6 sm:right-6" data-ask-ai-surface="">
      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full border-none bg-brand text-brand-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_44px_-18px_rgba(30,44,122,0.65)] transition-[transform,background-color,box-shadow] duration-200 ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_22px_50px_-18px_rgba(30,44,122,0.72)] active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={toggleChat}
          aria-label="Open Ask the text"
          aria-controls="rag-chat-panel"
          title="Ask the text"
        >
          <BookMark className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div
          className={
            isExpanded
              ? `fixed inset-0 z-[1000] flex items-center justify-center bg-footer-background/55 p-4 sm:p-8 ${styles.backdropIn}`
              : 'absolute bottom-0 right-0'
          }
          onClick={(event) => {
            if (isExpanded && event.target === event.currentTarget) {
              close();
            }
          }}
        >
          <section
            ref={panelRef}
            id="rag-chat-panel"
            role="dialog"
            aria-modal={isExpanded || undefined}
            aria-labelledby="rag-chat-title"
            className={`${styles.panelIn} flex flex-col overflow-hidden border border-border-subtle bg-surface shadow-[0_32px_80px_-32px_rgba(10,18,50,0.55)] ${
              isExpanded
                ? 'h-[calc(100dvh-2rem)] max-h-[860px] w-full max-w-2xl origin-center rounded-[1rem]'
                : 'h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[420px] origin-bottom-right rounded-[1rem] sm:h-[min(680px,calc(100dvh-2rem))]'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 pb-4 pt-4">
              <div className="flex min-w-0 items-center">
                <div className="min-w-0">
                  <h2
                    id="rag-chat-title"
                    className="m-0 font-display text-[1.0625rem] font-bold leading-none tracking-[-0.03em] text-text-primary"
                  >
                    Ask the text
                  </h2>
                  <p className="m-0 mt-2 flex items-center gap-1.5 font-mono text-[0.6rem] uppercase leading-none tracking-[0.16em] text-text-muted">
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-amber ${isStreaming ? 'animate-pulse' : ''}`}
                      aria-hidden="true"
                    />
                    <span aria-live="polite">{isStreaming ? 'Reading' : 'Ready'}</span>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={toggleExpand}
                  className="hidden h-8 w-8 items-center justify-center rounded-[0.375rem] border border-transparent bg-transparent text-text-muted transition-colors duration-100 hover:border-border-subtle hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 sm:flex"
                  title={isExpanded ? 'Collapse chat' : 'Expand chat'}
                  aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
                  aria-pressed={isExpanded}
                >
                  <ExpandMark collapsed={!isExpanded} />
                </button>
                <button
                  type="button"
                  onClick={toggleChat}
                  className="flex h-8 w-8 items-center justify-center rounded-[0.375rem] border border-transparent bg-transparent text-text-muted transition-colors duration-100 hover:border-border-subtle hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <CloseMark />
                </button>
              </div>
            </header>

            {selection && (
              <div className="border-b border-border-subtle bg-surface-secondary px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-text-muted">
                    Context from selection:
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    {selection.chapterId && (
                      <span
                        className="min-w-0 truncate font-mono text-[0.6rem] tracking-[0.04em] text-text-muted"
                        title={selection.chapterId}
                      >
                        {chapterLabel(selection.chapterId)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => clear()}
                      className="shrink-0 rounded-[0.25rem] px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-text-secondary underline decoration-border-strong underline-offset-[3px] transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                      aria-label="Clear selected passage"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p
                  className="mb-0 mt-2 line-clamp-2 rounded-[0.375rem] bg-amber/15 px-3 py-2 text-[0.8125rem] leading-relaxed text-text-primary"
                  title={selection.text}
                >
                  {selection.text}
                </p>
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto px-5 py-5"
              role="log"
              aria-live="polite"
              aria-label="Conversation"
            >
              {chatHistory.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center">
                  <BookMark className="h-8 w-8 text-brand" />
                  <h3 className="m-0 mt-5 font-display text-[1.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-text-primary">
                    Begin with a question.
                  </h3>
                  <p className="m-0 mt-2 max-w-[34ch] text-[0.875rem] leading-relaxed text-text-secondary">
                    {hasSelection
                      ? 'Your highlighted passage travels with the question.'
                      : 'Highlight a passage to bring it along, or ask about anything in the book.'}
                  </p>
                  <div className="mt-6 border-t border-border-subtle">
                    {STARTER_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void handleSendMessage(question)}
                        disabled={isStreaming}
                        className="group flex w-full items-center justify-between gap-4 border-b border-border-subtle bg-transparent py-3 text-left text-[0.8125rem] leading-snug text-text-secondary transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>{question}</span>
                        <PromptArrow />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {chatHistory.map((msg, index) => {
                    const isLast = index === chatHistory.length - 1;
                    const isPending =
                      isStreaming && isLast && msg.sender === 'bot' && !msg.isError && msg.text === '';
                    const hasAnswer = msg.text.trim().length > 0;

                    if (msg.sender === 'user') {
                      return (
                        <div
                          key={index}
                          className="max-w-[85%] self-end rounded-[0.625rem] rounded-br-[3px] bg-brand px-4 py-2.5 text-[0.875rem] leading-relaxed text-brand-foreground"
                        >
                          <p className="m-0 whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                      );
                    }

                    if (msg.isError) {
                      return (
                        <div
                          key={index}
                          className="max-w-[92%] self-start rounded-[0.625rem] border border-danger-border bg-danger-bg px-4 py-3 text-danger-text"
                        >
                          <p className="m-0 mb-1 font-mono text-[0.6rem] uppercase tracking-[0.14em]">
                            Answer unavailable
                          </p>
                          <p className="m-0 text-[0.8125rem] leading-relaxed">{msg.text}</p>
                        </div>
                      );
                    }

                    return (
                      <article key={index} className="w-full self-start">
                        <div className="mb-2 flex items-center gap-2">
                          <BookMark className="h-3.5 w-3.5 shrink-0 text-brand" />
                          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-text-muted">
                            From the text
                          </span>
                        </div>

                        {isPending ? (
                          <div className="flex items-center gap-1.5 py-1" role="status">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse [animation-delay:140ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse [animation-delay:280ms]" />
                            <span className="ml-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-text-muted">
                              Retrieving
                            </span>
                          </div>
                        ) : !hasAnswer ? (
                          <p className="m-0 text-[0.8125rem] leading-relaxed text-text-secondary">
                            No answer came back. Try rephrasing the question.
                          </p>
                        ) : (
                          <div
                            className={`${styles.answer} text-[0.9rem] leading-[1.7] text-text-primary`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                            >
                              {msg.text}
                            </ReactMarkdown>
                            {isStreaming && isLast && (
                              <span className={styles.caret} aria-hidden="true" />
                            )}
                          </div>
                        )}

                        {hasAnswer && !(isStreaming && isLast) && (
                          <div className="mt-3 flex items-center gap-2 border-t border-border-subtle pt-2">
                            <span className="h-1 w-1 rounded-full bg-amber" aria-hidden="true" />
                            <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-text-muted">
                              {msg.groundedInSelection
                                ? 'Grounded in your selection'
                                : 'Grounded in the book'}
                            </span>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="border-t border-border-subtle bg-surface px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSendMessage();
              }}
            >
              <div className="flex items-center gap-2 rounded-full border border-border-strong bg-surface-input py-1.5 pl-4 pr-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask a question..."
                  aria-label="Ask a question"
                  autoComplete="off"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[1rem] leading-6 text-text-primary outline-none placeholder:text-text-muted placeholder:opacity-100 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[0.875rem]"
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-none bg-brand text-brand-foreground transition-[background-color,transform,opacity] duration-150 hover:bg-brand-hover active:scale-95 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Send question"
                  disabled={!input.trim() || isStreaming}
                >
                  <SendMark className="h-[17px] w-[17px]" />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default RAGChatbot;
