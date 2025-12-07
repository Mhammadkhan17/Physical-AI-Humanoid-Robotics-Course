import React, { useState, useEffect } from 'react';
import styles from './RAGChatbot.module.css';

const RAGChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    const userMessage = `You: ${message}`;
    setChatHistory((prev) => [...prev, userMessage]);

    // Placeholder for API call to backend /chat endpoint
    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
      });
      const data = await response.json();
      setChatHistory((prev) => [...prev, `Bot: ${data.response}`]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => [...prev, 'Bot: Error communicating with the chatbot.']);
    }

    setMessage('');
  };

  // Selected text functionality (to be implemented more fully)
  useEffect(() => {
    const handleTextSelection = () => {
      const selectedText = window.getSelection()?.toString();
      if (selectedText) {
        console.log('Selected Text:', selectedText);
        // Here you would typically update the chat input or send it to the bot directly
      }
    };
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  return (
    <div className={styles.chatbotContainer}>
      <button className={styles.chatButton} onClick={toggleChat}>
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            RAG Chatbot
            <button className={styles.closeButton} onClick={toggleChat}>X</button>
          </div>
          <div className={styles.chatBody}>
            {chatHistory.map((entry, index) => (
              <p key={index}>{entry}</p>
            ))}
          </div>
          <div className={styles.chatInputContainer}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything..."
              className={styles.chatInput}
            />
            <button onClick={handleSendMessage} className={styles.sendButton}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RAGChatbot;
