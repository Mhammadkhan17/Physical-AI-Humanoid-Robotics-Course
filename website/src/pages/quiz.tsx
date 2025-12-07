import React, { useState } from 'react';
import Layout from '@theme/Layout';

const QuizPage: React.FC = () => {
  const [pythonExp, setPythonExp] = useState(0);
  const [rosExp, setRosExp] = useState(0);
  const [hasGpu, setHasGpu] = useState(false);
  const [hasJetson, setHasJetson] = useState(false);
  const [hasRobotAccess, setHasRobotAccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Submitting quiz...');

    const quizAnswers = {
      python_experience: pythonExp,
      ros_experience: rosExp,
      has_gpu: hasGpu,
      has_jetson: hasJetson,
      has_robot_access: hasRobotAccess,
    };

    try {
      // This assumes the user is authenticated and better-auth provides a way to get a token or session
      // For a real application, you'd get a session token from Better-Auth after login/registration
      const response = await fetch('https://your-deployed-backend-url.com/profile/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN` // Example for authenticated requests
        },
        body: JSON.stringify(quizAnswers),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Quiz submitted successfully!');
        // Redirect to a profile page or home page after successful submission
        // window.location.href = '/';
      } else {
        setMessage(`Error: ${data.detail || 'Failed to submit quiz'}`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setMessage('Network error or server unavailable.');
    }
  };

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
