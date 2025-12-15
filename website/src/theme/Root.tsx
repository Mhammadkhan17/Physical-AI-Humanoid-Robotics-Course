import React from 'react';
import { AuthProvider } from '@site/src/contexts/AuthContext';
import { SelectedTextProvider } from '@site/src/contexts/SelectedTextContext';
import { ChatbotVisibilityProvider } from '@site/src/contexts/ChatbotVisibilityContext'; // Import ChatbotVisibilityProvider

// Default implementation, that you can customize
export default function Root({children}) {
  return (
    <ChatbotVisibilityProvider>
      <SelectedTextProvider>
        <AuthProvider>{children}</AuthProvider>
      </SelectedTextProvider>
    </ChatbotVisibilityProvider>
  );
}
