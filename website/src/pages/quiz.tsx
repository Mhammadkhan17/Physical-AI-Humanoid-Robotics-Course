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
      const response = await fetch('/api/profile/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizAnswers),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Quiz submitted successfully!');
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
      <main className="p-5 max-w-2xl mx-auto">
        <h1 className="text-text-primary">Background Quiz</h1>
        <p className="text-text-secondary">Please answer a few questions to help us personalize your learning experience.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="pythonExp" className="block text-text-primary text-sm font-medium mb-1">Python Experience (0-5):</label>
            <input
              type="number"
              id="pythonExp"
              min="0"
              max="5"
              value={pythonExp}
              onChange={(e) => setPythonExp(parseInt(e.target.value))}
              className="w-full bg-surface-input border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="rosExp" className="block text-text-primary text-sm font-medium mb-1">ROS Experience (0-5):</label>
            <input
              type="number"
              id="rosExp"
              min="0"
              max="5"
              value={rosExp}
              onChange={(e) => setRosExp(parseInt(e.target.value))}
              className="w-full bg-surface-input border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={hasGpu}
                onChange={(e) => setHasGpu(e.target.checked)}
                className="accent-brand"
              />
              Do you have access to a GPU?
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={hasJetson}
                onChange={(e) => setHasJetson(e.target.checked)}
                className="accent-brand"
              />
              Do you have a NVIDIA Jetson device?
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={hasRobotAccess}
                onChange={(e) => setHasRobotAccess(e.target.checked)}
                className="accent-brand"
              />
              Do you have access to a physical robot?
            </label>
          </div>

          <button type="submit" className="px-5 py-2.5 bg-brand text-brand-foreground border-none rounded-sm cursor-pointer font-medium hover:bg-brand-hover transition-colors">
            Submit Quiz
          </button>
        </form>
        {message && <p className="mt-4 text-text-secondary text-sm">{message}</p>}
      </main>
    </Layout>
  );
};

export default QuizPage;
