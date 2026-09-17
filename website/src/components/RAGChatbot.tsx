import React, { useState, useEffect, useRef } from 'react';
import { useSelectedText } from '@site/src/contexts/SelectedTextContext';
import { useChatbotVisibility } from '@site/src/contexts/ChatbotVisibilityContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const RAGChatbot: React.FC = () => {
  const { selectedText, setSelectedText, chapterId, setChapterId } = useSelectedText();
  const { isOpen, setIsOpen } = useChatbotVisibility();
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Clear context when closing the chat
    if (isOpen) {
      setSelectedText(null);
      setChapterId(null);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newUserMessage: Message = { text: input, sender: 'user' };
    setChatHistory((prev) => [...prev, newUserMessage, { text: '', sender: 'bot' }]);
    setInput('');
    setIsStreaming(true);

    try {
      const body: { message: string; selected_text?: string; chapter_id?: string } = { message: input };
      if (selectedText && selectedText.trim().length > 0) {
        body.selected_text = selectedText;
        if (chapterId) {
          body.chapter_id = chapterId;
        }
      }

      console.log("Sending to backend:", body); // Log the request body

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
      setSelectedText(null);
      setChapterId(null); // Clear chapter context after sending
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {/* Chat Toggle Button */}
      <button
        className="w-14 h-14 rounded-full bg-brand text-brand-foreground border-none cursor-pointer shadow-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:bg-brand-hover hover:shadow-xl hover:scale-105 active:scale-95"
        onClick={toggleChat}
      >
        {isOpen ? '✕' : 'Chat'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[520px] max-h-[80vh] bg-surface rounded-lg shadow-2xl flex flex-col overflow-hidden border border-border-subtle">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-subtle flex justify-between items-center bg-surface-secondary">
            <h3 className="m-0 text-sm font-semibold text-text-primary">RAG Chatbot</h3>
            <button 
              onClick={toggleChat} 
              className="w-7 h-7 rounded-full bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center text-lg hover:bg-surface-secondary transition-colors"
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {/* Selected Text Context */}
            {selectedText && (
              <div className="bg-info-bg border border-info-border rounded-md p-3 text-xs text-info-text relative">
                <p className="m-0 mb-2 font-medium">Context from selection:</p>
                <p className="m-0 max-h-20 overflow-y-auto whitespace-pre-wrap break-words bg-surface p-2 rounded border border-border-subtle">
                  {selectedText}
                </p>
                <button 
                  className="absolute top-2 right-2 bg-transparent border-none text-danger-text cursor-pointer text-xs px-2 py-1 rounded hover:bg-danger-bg transition-colors" 
                  onClick={() => setSelectedText(null)}
                >
                  Clear
                </button>
              </div>
            )}

            {/* Chat Messages */}
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand text-brand-foreground self-end rounded-md rounded-br-sm'
                    : 'bg-surface-secondary text-text-primary self-start rounded-md rounded-bl-sm border border-border-subtle'
                } ${isStreaming && index === chatHistory.length - 1 ? 'animate-pulse-chat' : ''}`}
              >
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
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RAGChatbot;
