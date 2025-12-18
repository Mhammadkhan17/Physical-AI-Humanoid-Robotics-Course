import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useHistory, useLocation } from '@docusaurus/router';
import { JSX } from 'react/jsx-runtime';
import useBaseUrl from '@docusaurus/useBaseUrl';

function LoginPage(): JSX.Element {
  const auth = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const signupUrl = useBaseUrl('/signup');
  const baseUrl = useBaseUrl('/');

  const searchParams = new URLSearchParams(location.search);
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (auth && auth.isAuthenticated) {
      window.location.href = baseUrl;
    }
  }, [auth, baseUrl]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create a promise that rejects in 20 seconds
      const timeout = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Login timed out. The server might be starting up. Please try again.'));
        }, 20000); // 20-second timeout
      });

      // Race the fetch request against the timeout
      const response = await Promise.race([
        fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }),
        timeout
      ]) as Response;

      if (response.ok) {
        const data = await response.json();
        if (auth) {
          auth.login(data.access_token, data.user);
        }
        window.location.href = baseUrl;
      } else {
        // Handle non-JSON error responses gracefully
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          setError(errorJson.detail || 'Login failed.');
        } catch {
          setError(response.statusText || 'Login failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error or server unavailable. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!auth) {
    return (
      <Layout title="Login" description="Login to your account.">
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Login" description="Login to your account.">
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
          <h1 style={{ marginBottom: '20px' }}>Login</h1>
          {reason === 'unauthorized_content' && (
            <div style={{ 
              padding: '10px', 
              marginBottom: '20px', 
              backgroundColor: 'var(--ifm-color-info-background)', 
              color: 'var(--ifm-color-info-dark)', 
              borderRadius: '5px',
              border: '1px solid var(--ifm-color-info)'
            }}>
              Please log in to view the requested content.
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email:
              </label>
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
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Password:
              </label>
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
            {error && (
              <p style={{ color: 'var(--ifm-color-danger)', marginBottom: '15px' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--ifm-color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p style={{ marginTop: '20px' }}>
            Don't have an account? <a href={signupUrl}>Sign Up</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;