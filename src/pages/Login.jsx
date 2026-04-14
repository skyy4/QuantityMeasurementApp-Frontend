import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, Lock, Ruler, ShieldCheck, UserRound } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

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
        <div className="auth-shell">
            <section className="auth-hero">
                <div className="brand-badge">
                    <Ruler size={16} />
                    <span>Quantity Analyzer</span>
                </div>
                <div className="auth-copy">
                    <p className="eyebrow">Precision workspace</p>
                    <h1>Measure, convert, and compare with a calmer interface.</h1>
                    <p className="lede">
                        A lightweight measurement desk for length, weight, volume, and temperature work.
                        Built for repeat use, not visual noise.
                    </p>
                </div>
                <div className="feature-list">
                    <div className="feature-card">
                        <ShieldCheck size={18} />
                        <div>
                            <strong>Secure sessions</strong>
                            <p>JWT authentication with persistent account access.</p>
                        </div>
                    </div>
                    <div className="feature-card">
                        <ArrowRight size={18} />
                        <div>
                            <strong>Fast workflows</strong>
                            <p>Switch units, calculate conversions, and keep recent activity in view.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="auth-panel">
                <div className="panel-card auth-card">
                    <div className="auth-header">
                        <p className="eyebrow">{isRegister ? 'Create account' : 'Sign in'}</p>
                        <h2>{isRegister ? 'Set up your workspace' : 'Welcome back'}</h2>
                        <p className="supporting-copy">
                            {isRegister
                                ? 'Use a valid email and a password with at least 6 characters.'
                                : 'Enter the same credentials you used during registration.'}
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <div className="input-shell">
                                    <UserRound size={18} />
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required={isRegister}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <div className="input-shell">
                                <AtSign size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="mail@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-shell">
                                <Lock size={18} />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Your secure password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            {isRegister && (
                                <p className="helper-text">Must be at least 6 characters.</p>
                            )}
                        </div>

                        {error && <div className="status-message status-error">{error}</div>}

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            <span>{isLoading ? 'Processing...' : (isRegister ? 'Create account' : 'Sign in')}</span>
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="auth-footer">
                        <span>{isRegister ? 'Already have an account?' : 'Need an account?'}</span>
                        <button
                            type="button"
                            className="text-action"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                        >
                            {isRegister ? 'Go to sign in' : 'Create one'}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;
