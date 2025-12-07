import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useHistory } from '@docusaurus/router';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/'); // Redirect to home if already authenticated
    }
  }, [isAuthenticated, history]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('https://your-deployed-backend-url.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! Please log in.');
        history.push('/login'); // Redirect to login page after successful registration
      } else {
        setError(data.detail || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error or server unavailable.');
    }
  };

  if (isAuthenticated) {
    return null; // Don't render signup page if already authenticated
  }

  return (
    <Layout title="Sign Up" description="Create a new account.">
      <main style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <h1>Sign Up</h1>
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit"
            style={{
              backgroundColor: '#28a745', // Green for signup
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Sign Up
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}
        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        <p style={{ marginTop: '20px' }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </main>
    </Layout>
  );
};

export default SignupPage;
