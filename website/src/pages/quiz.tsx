import React, { useState } from 'react';
import Layout from '@theme/Layout';

const QuizPage: React.FC = () => {
  const [pythonExp, setPythonExp] = useState(0);
  const [rosExp, setRosExp] = useState(0);
  const [hasGpu, setHasGpu] = useState(false);
  const [hasJetson, setHasJetson] = useState(false);
  const [hasRobotAccess, setHasRobotAccess] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Background Quiz" description="Answer a few questions to personalize your experience.">
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-surface rounded-lg border border-border-subtle p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-2">Background Quiz</h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Please answer a few questions to help us personalize your learning experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="pythonExp" className="block text-text-primary text-sm font-medium mb-2">
                  Python Experience (0-5)
                </label>
                <input
                  type="number"
                  id="pythonExp"
                  min="0"
                  max="5"
                  value={pythonExp}
                  onChange={(e) => setPythonExp(parseInt(e.target.value))}
                  className="w-full bg-surface-input border border-border-subtle rounded-md px-3 py-2.5 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="rosExp" className="block text-text-primary text-sm font-medium mb-2">
                  ROS Experience (0-5)
                </label>
                <input
                  type="number"
                  id="rosExp"
                  min="0"
                  max="5"
                  value={rosExp}
                  onChange={(e) => setRosExp(parseInt(e.target.value))}
                  className="w-full bg-surface-input border border-border-subtle rounded-md px-3 py-2.5 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="pt-2">
                <p className="text-text-primary text-sm font-medium mb-3">Hardware Access</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-text-secondary text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasGpu}
                      onChange={(e) => setHasGpu(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded"
                    />
                    <span className="group-hover:text-text-primary transition-colors">Do you have access to a GPU?</span>
                  </label>

                  <label className="flex items-center gap-3 text-text-secondary text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasJetson}
                      onChange={(e) => setHasJetson(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded"
                    />
                    <span className="group-hover:text-text-primary transition-colors">Do you have a NVIDIA Jetson device?</span>
                  </label>

                  <label className="flex items-center gap-3 text-text-secondary text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasRobotAccess}
                      onChange={(e) => setHasRobotAccess(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded"
                    />
                    <span className="group-hover:text-text-primary transition-colors">Do you have access to a physical robot?</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-5 py-3 bg-brand text-brand-foreground border-none rounded-md cursor-pointer font-semibold hover:bg-brand-hover disabled:bg-surface-secondary disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-3 rounded-md text-sm ${
                message.includes('success')
                  ? 'bg-success-bg border border-success-border text-success-text'
                  : message.includes('Error')
                    ? 'bg-danger-bg border border-danger-border text-danger-text'
                    : 'bg-surface-secondary text-text-secondary'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default QuizPage;
