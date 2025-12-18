import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl'; // Import useBaseUrl

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false); // State for password visibility
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const auth = useAuth();
  const history = useHistory();
  const loginUrl = useBaseUrl('/login');

  useEffect(() => {
    if (auth && auth.isAuthenticated) {
      history.push('/'); // Redirect to home if already authenticated
    }
  }, [auth, history]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Registration successful! Please log in.');
        history.push(loginUrl);
      } else {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          setError(errorJson.detail || 'Registration failed.');
        } catch {
          setError(response.statusText || 'Registration failed.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error or server unavailable.');
    }
  };

  if (!auth) {
    return (
      <Layout title="Sign Up" description="Create a new account.">
        <div>Loading...</div>
      </Layout>
    );
  }

  if (auth.isAuthenticated) {
    return null;
  }

  return (
    <Layout title="Sign Up" description="Create a new account.">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--ifm-card-background-color)',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <h1 style={{ marginBottom: '20px' }}>Sign Up</h1>
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--ifm-color-gray-300)',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'left', position: 'relative' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--ifm-color-gray-300)',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '38px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  color: 'var(--ifm-color-gray-600)'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p style={{ color: 'var(--ifm-color-danger)', marginBottom: '15px' }}>Error: {error}</p>}
            {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}
            <button type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745', // Green for signup
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </form>
          <p style={{ marginTop: '20px' }}>
            Already have an account? <a href={loginUrl}>Login</a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
