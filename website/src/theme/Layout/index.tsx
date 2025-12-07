import React from 'react';
import Layout from '@theme-original/Layout';
import RAGChatbot from '@site/src/components/RAGChatbot';
import { useAuth } from '@site/src/contexts/AuthContext'; // Import useAuth

export default function LayoutWrapper(props) {
  const { isAuthenticated } = useAuth(); // Use the hook
  return (
    <>
      <Layout {...props} />
      {isAuthenticated && <RAGChatbot />} {/* Conditionally render */}
    </>
  );
}
