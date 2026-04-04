import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRightLeft,
    Calculator,
    ChevronRight,
    History,
    LogOut,
    Ruler,
    Scale,
    Thermometer,
    Waves
} from 'lucide-react';
import { UNIT_TYPES, UNITS_BY_TYPE } from '../constants/units';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const TYPE_META = {
    LENGTH: { label: 'Length', icon: Ruler, description: 'Spatial measurements and unit conversion.' },
    WEIGHT: { label: 'Weight', icon: Scale, description: 'Mass comparisons across common standards.' },
    VOLUME: { label: 'Volume', icon: Waves, description: 'Liquid and capacity calculations.' },
    TEMPERATURE: { label: 'Temperature', icon: Thermometer, description: 'Scale transitions across heat units.' }
};

const Dashboard = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
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

    const handleMeasurementTypeChange = (type) => {
        setMeasurementType(type);
        const units = UNITS_BY_TYPE[type];
        setThisUnit(units[0]);
        setThatUnit(units[1]);
        setResult(null);
    };

    const handleConvert = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setIsLoading(true);

        try {
            const requestBody = {
                thisQuantityDTO: {
                    value: parseFloat(thisValue),
                    unit: thisUnit,
                    measurementType
                },
                thatQuantityDTO: {
                    unit: thatUnit,
                    measurementType
                }
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/v1/quantities/convert`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResult(response.data);

            const newHistoryItem = {
                id: Date.now(),
                type: TYPE_META[measurementType].label,
                from: `${thisValue} ${thisUnit}`,
                to: `${response.data.resultValue.toFixed(2)} ${thatUnit}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

    const activeTypeMeta = TYPE_META[measurementType];
    const ActiveIcon = activeTypeMeta.icon;

    return (
        <div className="dashboard-shell">
            <header className="topbar">
                <div className="brand-lockup">
                    <div className="brand-badge">
                        <Calculator size={16} />
                        <span>Quantity Analyzer</span>
                    </div>
                    <div>
                        <h1>Conversion workspace</h1>
                        <p>Purpose-built for fast calculations and readable output.</p>
                    </div>
                </div>

                <div className="topbar-actions">
                    <div className="user-chip">
                        <span className="user-chip-label">Signed in</span>
                        <strong>{user.name || user.email || 'User'}</strong>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary" type="button">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="dashboard-grid">
                <section className="panel-card workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Converter</p>
                            <h2>Build the next measurement</h2>
                        </div>
                        <div className="metric-badge">
                            <ActiveIcon size={16} />
                            <span>{activeTypeMeta.label}</span>
                        </div>
                    </div>

                    <p className="supporting-copy measure-copy">{activeTypeMeta.description}</p>

                    <div className="type-picker" role="tablist" aria-label="Measurement types">
                        {UNIT_TYPES.map((type) => {
                            const meta = TYPE_META[type];
                            const TypeIcon = meta.icon;
                            const isActive = type === measurementType;

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    className={`type-pill${isActive ? ' is-active' : ''}`}
                                    onClick={() => handleMeasurementTypeChange(type)}
                                >
                                    <TypeIcon size={16} />
                                    <span>{meta.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <form className="converter-form" onSubmit={handleConvert}>
                        <div className="field-grid field-grid-split">
                            <div className="form-group">
                                <label htmlFor="from-unit">From unit</label>
                                <select id="from-unit" value={thisUnit} onChange={(e) => setThisUnit(e.target.value)}>
                                    {UNITS_BY_TYPE[measurementType].map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="swap-indicator" aria-hidden="true">
                                <ArrowRightLeft size={16} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="to-unit">To unit</label>
                                <select id="to-unit" value={thatUnit} onChange={(e) => setThatUnit(e.target.value)}>
                                    {UNITS_BY_TYPE[measurementType].map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="input-value">Value to convert</label>
                            <input
                                id="input-value"
                                type="number"
                                value={thisValue}
                                onChange={(e) => setThisValue(e.target.value)}
                                step="any"
                                placeholder="0.00"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            <span>{isLoading ? 'Calculating...' : 'Calculate conversion'}</span>
                            <ChevronRight size={18} />
                        </button>
                    </form>

                    {result && (
                        <div className="result-card">
                            <p className="eyebrow">Result</p>
                            <div className="result-main">
                                <strong>{result.resultValue.toFixed(4)}</strong>
                                <span>{thatUnit}</span>
                            </div>
                            <p className="result-subtext">
                                {thisValue} {thisUnit} converts to {result.resultValue.toFixed(4)} {thatUnit}.
                            </p>
                        </div>
                    )}
                </section>

                <aside className="sidebar-stack">
                    <section className="panel-card insight-card">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">Overview</p>
                                <h2>Current mode</h2>
                            </div>
                        </div>
                        <div className="insight-row">
                            <span>Active measurement</span>
                            <strong>{activeTypeMeta.label}</strong>
                        </div>
                        <div className="insight-row">
                            <span>Input pair</span>
                            <strong>{thisUnit} to {thatUnit}</strong>
                        </div>
                        <div className="insight-row">
                            <span>Entered value</span>
                            <strong>{thisValue || '0'}</strong>
                        </div>
                    </section>

                    <section className="panel-card history-card">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">Activity</p>
                                <h2>Recent conversions</h2>
                            </div>
                            <History size={18} />
                        </div>

                        {history.length > 0 ? (
                            <div className="history-list">
                                {history.map((item) => (
                                    <article key={item.id} className="history-item">
                                        <div className="history-row">
                                            <span>{item.from}</span>
                                            <strong>{item.to}</strong>
                                        </div>
                                        <div className="history-meta">
                                            <span>{item.type}</span>
                                            <span>{item.time}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <History size={18} />
                                <p>No conversions yet.</p>
                                <span>Your latest calculations will appear here.</span>
                            </div>
                        )}
                    </section>
                </aside>
            </main>
        </div>
    );
};

export default Dashboard;
