import React from 'react';
import { SelectedTextProvider } from '@site/src/contexts/SelectedTextContext';
import { ChatbotVisibilityProvider } from '@site/src/contexts/ChatbotVisibilityContext';

export default function Root({children}) {
  return (
    <ChatbotVisibilityProvider>
      <SelectedTextProvider>
        {children}
      </SelectedTextProvider>
    </ChatbotVisibilityProvider>
  );
}
