import React, { useState, useEffect, useRef } from 'react';
import { useAskAi } from '@site/src/features/ask-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const RAGChatbot: React.FC = () => {
  const { selection, isOpen, open, close, clear } = useAskAi();
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef(selection);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory]);

  useEffect(() => {
    selectionRef.current = selection;
  });

  const toggleChat = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const snapshot = selection;
    const newUserMessage: Message = { text: input, sender: 'user' };
    setChatHistory((prev) => [...prev, newUserMessage, { text: '', sender: 'bot' }]);
    setInput('');
    setIsStreaming(true);

    try {
      const body: { message: string; selected_text?: string; chapter_id?: string } = { message: input };
      if (snapshot && snapshot.text.trim().length > 0) {
        body.selected_text = snapshot.text;
        if (snapshot.chapterId) {
          body.chapter_id = snapshot.chapterId;
        }
      }

      console.log("Sending to backend:", body);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend validation error:', errorData.detail);
        throw new Error(errorData.detail ? JSON.stringify(errorData.detail) : `HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setChatHistory((prev) => {
          const lastMessage = prev[prev.length - 1];
          lastMessage.text += chunk;
          return [...prev];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => [
        ...prev,
        { text: 'Error communicating with the chatbot.', sender: 'bot' },
      ]);
    } finally {
      setIsStreaming(false);
      const current = selectionRef.current;
      if (current && snapshot && current.text === snapshot.text && current.chapterId === snapshot.chapterId) {
        clear();
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]" data-ask-ai-surface="">
      {/* Chat Toggle Button — only shown when chat is closed */}
        {!isOpen && (
        <button
          className="w-14 h-14 rounded-full bg-brand text-brand-foreground border-none cursor-pointer shadow-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:bg-brand-hover hover:shadow-xl hover:scale-105 active:scale-95"
          onClick={toggleChat}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`${
            isExpanded
              ? 'fixed inset-0 w-full h-full max-w-none max-h-none rounded-none'
              : 'absolute bottom-0 right-0 w-[calc(100vw-2rem)] max-w-[420px] h-[calc(100vh-6rem)] max-h-[650px]'
          } bg-surface rounded-lg shadow-2xl flex flex-col overflow-hidden border border-border-subtle transition-all duration-300`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-subtle flex justify-between items-center bg-surface-secondary">
            <h3 className="m-0 text-sm font-semibold text-text-primary">RAG Chatbot</h3>
            <div className="flex gap-2">
              <button
                onClick={toggleExpand}
                className="w-7 h-7 rounded-full bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center hover:bg-surface-secondary transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleChat}
                className="w-7 h-7 rounded-full bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center hover:bg-surface-secondary transition-colors"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 p-4 overflow-y-auto flex flex-col gap-3"
            onClick={() => {
              if (selection) {
                clear();
              }
            }}
          >
            {selection && (
              <div className="bg-info-bg border border-info-border rounded-md p-3 text-xs text-info-text relative">
                <p className="m-0 mb-2 font-medium">Context from selection:</p>
                <p className="m-0 max-h-20 overflow-y-auto whitespace-pre-wrap break-words bg-surface p-2 rounded border border-border-subtle">
                  {selection.text}
                </p>
                <button
                  className="absolute top-2 right-2 bg-transparent border-none text-danger-text cursor-pointer text-xs px-2 py-1 rounded hover:bg-danger-bg transition-colors"
                  onClick={() => clear()}
                >
                  Clear
                </button>
              </div>
            )}

            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand text-brand-foreground self-end rounded-md rounded-br-sm'
                    : 'bg-surface-secondary text-text-primary self-start rounded-md rounded-bl-sm border border-border-subtle'
                } ${isStreaming && index === chatHistory.length - 1 ? 'animate-pulse-chat' : ''}`}
              >
                {msg.sender === 'bot' && (
                  <span className="inline-flex items-center gap-1.5 mb-1">
                    <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 8V4H8" />
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                      <path d="M2 14h2" />
                      <path d="M20 14h2" />
                      <path d="M15 13v2" />
                      <path d="M9 13v2" />
                    </svg>
                    <span className="font-semibold text-xs text-brand">Bot</span>
                  </span>
                )}
                {isStreaming && msg.sender === 'bot' && msg.text === '' ? (
                  <div className="w-5 h-5 border-2 border-border-subtle border-t-brand rounded-full animate-spin"></div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            className="px-3 py-3 border-t border-border-subtle bg-surface-secondary flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-surface-input border border-border-subtle rounded-full py-2.5 px-4 text-sm text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              disabled={isStreaming}
            />
            <button
              type="submit"
              className="bg-brand text-brand-foreground border-none rounded-full w-10 h-10 cursor-pointer flex items-center justify-center font-semibold hover:bg-brand-hover disabled:bg-surface-secondary disabled:cursor-not-allowed transition-colors"
              disabled={!input.trim() || isStreaming}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RAGChatbot;
