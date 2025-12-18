import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext'; // Import useAuth
import { useHistory } from '@docusaurus/router'; // Import useHistory
import useBaseUrl from '@docusaurus/useBaseUrl'; // Import useBaseUrl

const QuizPage: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const loginUrl = useBaseUrl('/login');
  const quizUrl = useBaseUrl('/quiz'); // Declare quizUrl for potential redirects later

  const [pythonExp, setPythonExp] = useState(0);
  const [rosExp, setRosExp] = useState(0);
  const [hasGpu, setHasGpu] = useState(false);
  const [hasJetson, setHasJetson] = useState(false);
  const [hasRobotAccess, setHasRobotAccess] = useState(false);
  const [message, setMessage] = useState('');

  // Protect the route
  useEffect(() => {
    if (!auth || auth.loading) {
      // Still loading auth state
      return;
    }
    if (!auth.isAuthenticated) {
      // Not authenticated, redirect to login
      window.location.href = loginUrl;
    }
  }, [auth, loginUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Submitting quiz...');

    if (!auth || !auth.token || !auth.user) {
      setMessage('Error: User not authenticated. Please log in.');
      return;
    }

    const quizAnswers = {
      python_experience: pythonExp,
      ros_experience: rosExp,
      has_gpu: hasGpu,
      has_jetson: hasJetson,
      has_robot_access: hasRobotAccess,
      // user_id is passed implicitly via the JWT token in the backend,
      // but explicitly passing it here doesn't hurt and matches the Profile model.
      user_id: auth.user.id,
    };

    try {
      const response = await fetch('/profile/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`, // Add Authorization header
        },
        body: JSON.stringify(quizAnswers),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Quiz submitted successfully!');
        // Optionally redirect the user after submission
        // history.push(quizUrl); // Redirect to quiz page or profile
      } else {
        setMessage(`Error: ${data.detail || 'Failed to submit quiz'}`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setMessage('Network error or server unavailable.');
    }
  };
  
  // Show loading state while authentication is being checked
  if (!auth || auth.loading) {
    return (
      <Layout title="Background Quiz" description="Answer a few questions to personalize your experience.">
        <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1>Loading Quiz...</h1>
          <p>Checking authentication status.</p>
        </main>
      </Layout>
    );
  }

  // If not authenticated, the useEffect above will redirect.
  // This render path is for authenticated users.
  return (
    <Layout title="Background Quiz" description="Answer a few questions to personalize your experience.">
      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Background Quiz</h1>
        <p>Please answer a few questions to help us personalize your learning experience.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="pythonExp">Python Experience (0-5): </label>
            <input
              type="number"
              id="pythonExp"
              min="0"
              max="5"
              value={pythonExp}
              onChange={(e) => setPythonExp(parseInt(e.target.value))}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="rosExp">ROS Experience (0-5): </label>
            <input
              type="number"
              id="rosExp"
              min="0"
              max="5"
              value={rosExp}
              onChange={(e) => setRosExp(parseInt(e.target.value))}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={hasGpu}
                onChange={(e) => setHasGpu(e.target.checked)}
              />
              Do you have access to a GPU?
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={hasJetson}
                onChange={(e) => setHasJetson(e.target.checked)}
              />
              Do you have a NVIDIA Jetson device?
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={hasRobotAccess}
                onChange={(e) => setHasRobotAccess(e.target.checked)}
              />
              Do you have access to a physical robot?
            </label>
          </div>

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Submit Quiz
          </button>
        </form>
        {message && <p>{message}</p>}
      </main>
    </Layout>
  );
};

export default QuizPage;
