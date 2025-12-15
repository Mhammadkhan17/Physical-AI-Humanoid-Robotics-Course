import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedTextContextType {
  selectedText: string | null;
  setSelectedText: (text: string | null) => void;
  chapterId: string | null; // Add chapterId
  setChapterId: (id: string | null) => void; // Add setter for chapterId
}

const SelectedTextContext = createContext<SelectedTextContextType | undefined>(undefined);

export const SelectedTextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null); // Add chapterId state

  return (
    <SelectedTextContext.Provider value={{ selectedText, setSelectedText, chapterId, setChapterId }}>
      {children}
    </SelectedTextContext.Provider>
  );
};

export const useSelectedText = () => {
  const context = useContext(SelectedTextContext);
  if (context === undefined) {
    throw new Error('useSelectedText must be used within a SelectedTextProvider');
  }
  return context;
};
