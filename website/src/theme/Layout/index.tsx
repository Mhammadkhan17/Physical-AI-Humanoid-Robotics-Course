import React from 'react';
import Layout from '@theme-original/Layout';
import RAGChatbot from '@site/src/components/RAGChatbot';
import { AskAiButton } from '@site/src/features/ask-ai';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <RAGChatbot />
      <AskAiButton />
    </>
  );
}
