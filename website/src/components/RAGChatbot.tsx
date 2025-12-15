import React, { useState, useEffect, useRef } from 'react';
import styles from './RAGChatbot.module.css';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useSelectedText } from '@site/src/contexts/SelectedTextContext';
import { useChatbotVisibility } from '@site/src/contexts/ChatbotVisibilityContext';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm
import rehypeRaw from 'rehype-raw'; // Import rehypeRaw

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const RAGChatbot: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const { selectedText, setSelectedText, chapterId, setChapterId } = useSelectedText();
  const { isOpen, setIsOpen } = useChatbotVisibility(); // Use useChatbotVisibility
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
          'Authorization': `Bearer ${token}`,
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.chatbotContainer}>
      <button className={styles.chatToggleButton} onClick={toggleChat}>
        {isOpen ? 'Close' : 'Chat'}
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>RAG Chatbot</h3>
            <button onClick={toggleChat} className={styles.closeButton}>×</button>
          </div>
          <div className={styles.messagesDisplay}>
            {selectedText && (
              <div className={styles.selectedContext}>
                <p><strong>Context from selection:</strong></p>
                <p className={styles.selectedContextText}>{selectedText}</p>
                <button className={styles.clearContextButton} onClick={() => setSelectedText(null)}>Clear Context</button>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`${styles.chatMessage} ${
                  msg.sender === 'user' ? styles.userMessage : styles.botMessage
                } ${isStreaming && index === chatHistory.length - 1 ? styles.streaming : ''}`}
              >
                {isStreaming && msg.sender === 'bot' && msg.text === '' ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            className={styles.inputForm}
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
              className={styles.inputField}
              disabled={isStreaming}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className={styles.sendButton}
              disabled={!input.trim() || !token || isStreaming}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RAGChatbot;
