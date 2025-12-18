import React, { useState, useEffect, useRef } from 'react';
import DocItem from '@theme-original/DocItem';
import ChapterProgress from '@site/src/components/ChapterProgress';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm
import rehypeRaw from 'rehype-raw'; // Import rehypeRaw
import { useSelectedText } from '@site/src/contexts/SelectedTextContext'; // Import useSelectedText
import { useChatbotVisibility } from '@site/src/contexts/ChatbotVisibilityContext'; // Import useChatbotVisibility

export default function DocItemWrapper(props) {
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [isLoadingPersonalize, setIsLoadingPersonalize] = useState(false);
  const [errorPersonalize, setErrorPersonalize] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isLoadingTranslate, setIsLoadingTranslate] = useState(false);
  const [errorTranslate, setErrorTranslate] = useState<string | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false); // New state for profile
  const [showAskAiButton, setShowAskAiButton] = useState(false); // State for Ask AI button visibility
  const [askAiButtonPosition, setAskAiButtonPosition] = useState({ x: 0, y: 0 }); // State for Ask AI button position

  const authContext = useAuth(); // Get the context object
  console.log('DocItemWrapper useAuth() result:', authContext); // Log it for debugging
  const { isAuthenticated, loading, token, user } = authContext;
  const { selectedText, setSelectedText, setChapterId } = useSelectedText();
  const { setIsOpen: setChatbotOpen } = useChatbotVisibility();
  const history = useHistory();
  const baseUrl = useBaseUrl('/login');
  const quizUrl = useBaseUrl('/quiz');
  const contentRef = useRef<HTMLDivElement>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Append a reason to the URL for the login page to display a message
      window.location.href = `${baseUrl}?reason=unauthorized_content`;
    }
  }, [loading, isAuthenticated, baseUrl]);

  // If still loading or not authenticated, render a loading state to prevent flicker
  if (loading || !isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Fetch user profile to check if quiz has been taken
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && token && user) {
        try {
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            // Assuming the 'user' object from /users/me endpoint contains profile info
            // or we might need a separate /profile endpoint
            // For now, let's assume if user.profile exists or a specific field indicates it
            if (userData && userData.profile) { // This will need adjustment based on actual /users/me response structure
                setHasProfile(true);
            } else {
                setHasProfile(false);
            }
          } else {
            console.error("Failed to fetch user profile:", response.status);
            setHasProfile(false);
          }
        } catch (error) {
          console.error("Network error fetching user profile:", error);
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, token, user]);

  // Capture selected text and show Ask AI button
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      // Only process clicks inside the content area
      if (contentRef.current && contentRef.current.contains(event.target as Node)) {
        const selection = window.getSelection();
        const selectedString = selection.toString().trim();

        if (selectedString.length > 0) {
          setSelectedText(selectedString);
          setChapterId(props.content.metadata.id); // Set the chapter ID
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setAskAiButtonPosition({
            x: rect.right + window.scrollX - 50,
            y: rect.bottom + window.scrollY + 5,
          });
          setShowAskAiButton(true);
        } else {
          // If the click was inside but resulted in an empty selection, clear it
          setSelectedText(null);
          setChapterId(null); // Clear the chapter ID
          setShowAskAiButton(false);
        }
      } else {
        // If the click was outside the content area, do nothing.
        // This prevents clearing the selection when clicking in the chatbot.
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSelectedText]);

  // Hide Ask AI button if selectedText is cleared (e.g., by chatbot)
  useEffect(() => {
    if (!selectedText) {
      setShowAskAiButton(false);
    }
  }, [selectedText]);


  const handlePersonalize = async () => {
    if (!user || !token) {
      alert("Please log in to personalize content.");
      return;
    }
    const chapterText = contentRef.current?.innerText || '';
    if (!chapterText) {
      alert("Could not find chapter content to personalize.");
      return;
    }

    setIsLoadingPersonalize(true);
    setErrorPersonalize(null);
    setPersonalizedContent(null);
    setTranslatedContent(null);

    try {
      const response = await fetch('/api/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapter_original_text: chapterText,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPersonalizedContent(data.personalized_chapter_text);
        setShowTranslated(false);
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
    if (!user || !token) {
      alert("Please log in to translate content.");
      return;
    }
    const textToTranslate = personalizedContent || contentRef.current?.innerText || '';
    if (!textToTranslate) {
      alert("Could not find chapter content to translate.");
      return;
    }

    setIsLoadingTranslate(true);
    setErrorTranslate(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: textToTranslate,
          target_language: 'Urdu',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslatedContent(data.translated_text);
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

  const handleAskAiClick = () => {
    if (selectedText) {
      setChatbotOpen(true); // Open the chatbot
      setShowAskAiButton(false); // Hide the button
    }
  };

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
              fontFamily: 'Poppins, sans-serif' // Apply Poppins font
            }}
            onClick={
              hasProfile
                ? handlePersonalize
                : () => history.push(quizUrl) // Redirect to quiz page
            }
            disabled={isLoadingPersonalize} // Only disable if personalizing
          >
            {isLoadingPersonalize
              ? 'Personalizing...'
              : hasProfile
              ? 'Personalize this chapter'
              : 'Take Quiz to Personalize'}
          </button>
          <button
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '8px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif' // Apply Poppins font
            }}
            onClick={handleTranslate}
            disabled={isLoadingTranslate}
          >
            {isLoadingTranslate ? 'Translating...' : (
              <>
                <span style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>اردو میں پڑھیں</span> / Read in Urdu
              </>
            )}
          </button>
        </div>
      )}

      {errorPersonalize && <p style={{ color: 'red' }}>Error: {errorPersonalize}</p>}
      {errorTranslate && <p style={{ color: 'red' }}>Error: {errorTranslate}</p>}

      {isAuthenticated && personalizedContent && ( // Show message if personalized content is present
        <div style={{
            backgroundColor: 'var(--ifm-color-info-background)',
            color: 'var(--ifm-color-info)',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px'
        }}>
            This chapter has been personalized for your experience level.
        </div>
      )}

      {displayContent ? (
        <ReactMarkdown
          className={showTranslated ? "urdu-translation-content" : undefined}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {displayContent}
        </ReactMarkdown>
      ) : (
        <div ref={contentRef}>
          <DocItem {...props} />
        </div>
      )}

      {isAuthenticated && showAskAiButton && selectedText && (
        <button
          style={{
            position: 'absolute',
            left: askAiButtonPosition.x,
            top: askAiButtonPosition.y,
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9em',
            zIndex: 1001, // Ensure it's above other content
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
          onClick={handleAskAiClick}
        >
          Ask AI about this
        </button>
      )}
    </>
  );
}