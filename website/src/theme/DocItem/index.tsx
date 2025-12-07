import React, { useState, useEffect } from 'react';
import DocItem from '@theme-original/DocItem';
import ChapterProgress from '@site/src/components/ChapterProgress';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useHistory } from '@docusaurus/router';

export default function DocItemWrapper(props) {
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [isLoadingPersonalize, setIsLoadingPersonalize] = useState(false);
  const [errorPersonalize, setErrorPersonalize] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isLoadingTranslate, setIsLoadingTranslate] = useState(false);
  const [errorTranslate, setErrorTranslate] = useState<string | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);

  const { isAuthenticated, loading } = useAuth();
  const history = useHistory();

  // Redirect unauthenticated users from protected chapters
  /*
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // For demonstration, let's protect all chapters for now.
      // In a real application, you'd have a list of protected chapter IDs.
      if (props.content.metadata.id) { // Assuming all chapters require authentication
        history.push('/login');
      }
    }
  }, [isAuthenticated, loading, props.content.metadata.id, history]);
  */

  const currentUserId = 1; // This should come from AuthContext in a real app

  const handlePersonalize = async () => {
    if (!currentUserId) {
      alert("Please log in to personalize content.");
      return;
    }

    setIsLoadingPersonalize(true);
    setErrorPersonalize(null);
    setPersonalizedContent(null);
    setTranslatedContent(null); // Clear translation when personalizing

    try {
      const chapterText = props.content.frontMatter.description || props.content.excerpt || ''; // Fallback to description or excerpt
      const response = await fetch('https://your-deployed-backend-url.com/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN` // Example for authenticated requests
        },
        body: JSON.stringify({
          chapter_path: props.content.metadata.id,
          chapter_original_text: chapterText,
          user_id: currentUserId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPersonalizedContent(data.personalized_chapter_text);
        setShowTranslated(false); // Ensure original/personalized is shown
      } else {
        setErrorPersonalize(data.detail || 'Failed to personalize chapter.');
      }
    } catch (err) {
      console.error('Error personalizing chapter:', err);
      setErrorPersonalize('Network error or server unavailable.');
    } finally {
      setIsLoadingPersonalize(false);
    }
  };

  const handleTranslate = async () => {
    if (!currentUserId) {
      alert("Please log in to translate content.");
      return;
    }

    setIsLoadingTranslate(true);
    setErrorTranslate(null);
    const textToTranslate = personalizedContent || props.content.frontMatter.description || props.content.excerpt || '';

    try {
      const response = await fetch('https://your-deployed-backend-url.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapter_path: props.content.metadata.id,
          chapter_original_text: textToTranslate,
          user_id: currentUserId,
          target_language: 'ur',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslatedContent(data.translated_chapter_text);
        setShowTranslated(true);
      } else {
        setErrorTranslate(data.detail || 'Failed to translate chapter.');
      }
    } catch (err) {
      console.error('Error translating chapter:', err);
      setErrorTranslate('Network error or server unavailable.');
    } finally {
      setIsLoadingTranslate(false);
    }
  };

  const displayContent = showTranslated
    ? translatedContent
    : personalizedContent;

  // If still loading auth state, render nothing or a loading spinner
  if (loading) {
    return <DocItem {...props} />; // Or a loading spinner
  }

  return (
    <>
      {isAuthenticated && <ChapterProgress chapterId={props.content.metadata.id} />}
      {isAuthenticated && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '8px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
            onClick={handlePersonalize}
            disabled={isLoadingPersonalize}
          >
            {isLoadingPersonalize ? 'Personalizing...' : 'Personalize this chapter'}
          </button>
          <button
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '8px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={handleTranslate}
            disabled={isLoadingTranslate}
          >
            {isLoadingTranslate ? 'Translating...' : 'اردو میں پڑھیں / Read in Urdu'}
          </button>
        </div>
      )}

      {errorPersonalize && <p style={{ color: 'red' }}>Error: {errorPersonalize}</p>}
      {errorTranslate && <p style={{ color: 'red' }}>Error: {errorTranslate}</p>}

      {displayContent ? (
        <div dangerouslySetInnerHTML={{ __html: displayContent }} />
      ) : (
        <DocItem {...props} />
      )}
    </>
  );
}