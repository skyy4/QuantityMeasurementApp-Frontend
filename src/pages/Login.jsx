import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../constants/units';

const initialForm = {
  name: '',
  email: '',
  password: ''
};

const Login = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim() || (mode === 'register' && !form.name.trim())) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email.trim(), password: form.password }
        : { name: form.name.trim(), email: form.email.trim(), password: form.password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 409) {
        toast.error('An account with this email already exists.');
        return;
      }

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      onAuthSuccess(data.token, mode === 'login' ? 'Logged in successfully!' : 'Account created successfully!');
      setForm(initialForm);
    } catch (error) {
      toast.error(mode === 'login'
        ? 'Login failed. Check your email and password.'
        : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="header">
        <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <p>
          {mode === 'login'
            ? 'Log in with your email and password'
            : 'Create an account to use Quantity Measurement App'}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="field-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        )}

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting
            ? (mode === 'login' ? 'Logging in...' : 'Creating account...')
            : (mode === 'login' ? 'Login' : 'Register')}
        </button>
      </form>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <span
          style={{ color: 'var(--primary)', cursor: 'pointer' }}
          onClick={() => {
            setMode((current) => current === 'login' ? 'register' : 'login');
            setForm(initialForm);
          }}
        >
          {mode === 'login' ? 'Sign Up' : 'Login'}
        </span>
        <span style={{ color: 'var(--text-muted)' }}> — it's free!</span>
      </div>
    </div>
  );
};

export default Login;
