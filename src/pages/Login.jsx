import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthErrorMessage = (err, isRegister) => {
    const fallback = isRegister
        ? 'Registration failed. Try again.'
        : 'Login failed. Check credentials.';
    const responseData = err.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
        return responseData;
    }

    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
        return responseData.message;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
        return responseData.errors.join(', ');
    }

    return fallback;
};

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let response;
            if (isRegister) {
                response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
            } else {
                response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                    email: formData.email,
                    password: formData.password
                });
            }

            const { token, name, email } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ name, email }));
            navigate('/dashboard');
        } catch (err) {
            console.error('Auth error:', err);
            setError(getAuthErrorMessage(err, isRegister));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card auth-card">
                <div className="auth-header">
                    <h1>Quantity</h1>
                    <p>{isRegister ? 'Scale your measurements' : 'Welcome back, Measurer'}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required={isRegister}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="mail@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Password</label>
                        </div>
                        <input
                            type="password"
                            placeholder="Your secret password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        {isRegister && (
                            <p className="helper-text">
                                <span style={{ color: '#818cf8', fontWeight: 'bold' }}>Important:</span> Must be at least 6 characters.
                            </p>
                        )}
                    </div>

                    {error && <div style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                    {isRegister ? 'Have an account?' : "New here?"}{' '}
                    <span
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        style={{ color: '#818cf8', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                    >
                        {isRegister ? 'Login' : 'Create an account'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
