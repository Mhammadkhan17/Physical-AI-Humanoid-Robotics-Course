import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotVisibilityContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatbotVisibilityContext = createContext<ChatbotVisibilityContextType | undefined>(undefined);

export const ChatbotVisibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatbotVisibilityContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ChatbotVisibilityContext.Provider>
  );
};

export const useChatbotVisibility = () => {
  const context = useContext(ChatbotVisibilityContext);
  if (context === undefined) {
    throw new Error('useChatbotVisibility must be used within a ChatbotVisibilityProvider');
  }
  return context;
};
