import React from 'react';
import { AskAiProvider } from '@site/src/features/ask-ai';

export default function Root({children}) {
  return (
    <AskAiProvider>
      {children}
    </AskAiProvider>
  );
}
