import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UNIT_TYPES, UNITS_BY_TYPE } from '../constants/units';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Dashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [measurementType, setMeasurementType] = useState('LENGTH');
    const [thisUnit, setThisUnit] = useState('FEET');
    const [thatUnit, setThatUnit] = useState('INCH');
    const [thisValue, setThisValue] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleConvert = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setIsLoading(true);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/converter/convert`, {
                params: {
                    measurementType,
                    thisUnit,
                    thatUnit,
                    thisValue
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setResult(response.data);
            
            // Log local history (since we don't have a persistent DB history fetch for now)
            const newHistoryItem = {
                id: Date.now(),
                from: `${thisValue} ${thisUnit}`,
                to: `${response.data.resultValue.toFixed(2)} ${thatUnit}`,
                time: new Date().toLocaleTimeString()
            };
            setHistory([newHistoryItem, ...history].slice(0, 5));

        } catch (err) {
            console.error('Conversion error:', err);
            if (err.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="nav-bar glass-card" style={{ padding: '12px 24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Quantity Analyzer</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="user-info">Hi, <span>{user.name}</span></div>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="converter-grid">
                {/* Main Converter Card */}
                <div className="glass-card converter-card">
                    <form onSubmit={handleConvert}>
                        <div className="form-group">
                            <label>Measurement Type</label>
                            <select 
                                value={measurementType} 
                                onChange={(e) => {
                                    setMeasurementType(e.target.value);
                                    const units = UNITS_BY_TYPE[e.target.value];
                                    setThisUnit(units[0]);
                                    setThatUnit(units[1]);
                                }}
                            >
                                {UNIT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>From Unit</label>
                                <select value={thisUnit} onChange={(e) => setThisUnit(e.target.value)}>
                                    {UNITS_BY_TYPE[measurementType].map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>To Unit</label>
                                <select value={thatUnit} onChange={(e) => setThatUnit(e.target.value)}>
                                    {UNITS_BY_TYPE[measurementType].map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Value to Convert</label>
                            <input 
                                type="number" 
                                value={thisValue} 
                                onChange={(e) => setThisValue(e.target.value)}
                                step="any"
                                placeholder="0.00"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '10px' }}>
                            {isLoading ? 'Calculating...' : 'Calculate Conversion'}
                        </button>
                    </form>

                    {result && (
                        <div className="result-display fade-in">
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>CONVERSION RESULT</p>
                            <div className="result-value">
                                {result.resultValue.toFixed(4)} <span style={{ fontSize: '1rem', color: '#818cf8' }}>{thatUnit}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* History Sidebar */}
                <div className="glass-card history-card">
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        Recent Activity
                    </h3>
                    {history.length > 0 ? (
                        history.map(item => (
                            <div key={item.id} className="history-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '500' }}>{item.from} →</span>
                                    <span style={{ color: '#818cf8', fontWeight: '700' }}>{item.to}</span>
                                </div>
                                <div className="timestamp">{item.time}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>No conversions yet.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
