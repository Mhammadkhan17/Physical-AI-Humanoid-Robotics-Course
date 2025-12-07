import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useHistory } from '@docusaurus/router';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/'); // Redirect to home if already authenticated
    }
  }, [isAuthenticated, history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('https://your-deployed-backend-url.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming your backend returns a token and user data on successful login
        login(data.access_token, data.user);
        setMessage('Login successful!');
        router.history.push('/'); // Redirect to home page
      } else {
        setError(data.detail || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error or server unavailable.');
    }
  };

  if (isAuthenticated) {
    return null; // Don't render login page if already authenticated
  }

  return (
    <Layout title="Login" description="Login to your account.">
      <main style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
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
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Login
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}
        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        <p style={{ marginTop: '20px' }}>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </main>
    </Layout>
  );
};

export default LoginPage;
