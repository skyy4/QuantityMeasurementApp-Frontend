import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRightLeft,
    Calculator,
    ChevronRight,
    EqualNot,
    History,
    LogOut,
    Plus,
    Ruler,
    Scale,
    Split,
    SquareMinus,
    Thermometer,
    Waves
} from 'lucide-react';
import { OPERATIONS, UNIT_TYPES, UNITS_BY_TYPE } from '../constants/units';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const EPSILON = 0.000001;
const HISTORY_LIMIT = 8;

const TYPE_META = {
    LENGTH: { label: 'Length', icon: Ruler, description: 'Spatial measurements and unit conversion.' },
    WEIGHT: { label: 'Weight', icon: Scale, description: 'Mass comparisons across common standards.' },
    VOLUME: { label: 'Volume', icon: Waves, description: 'Liquid and capacity calculations.' },
    TEMPERATURE: { label: 'Temperature', icon: Thermometer, description: 'Scale transitions across heat units.' }
};

const OPERATION_META = {
    convert: {
        label: 'Convert',
        icon: ArrowRightLeft,
        buttonLabel: 'Calculate conversion',
        resultEyebrow: 'Conversion result'
    },
    compare: {
        label: 'Compare',
        icon: EqualNot,
        buttonLabel: 'Compare quantities',
        resultEyebrow: 'Comparison result'
    },
    add: {
        label: 'Add',
        icon: Plus,
        buttonLabel: 'Add quantities',
        resultEyebrow: 'Addition result'
    },
    subtract: {
        label: 'Subtract',
        icon: SquareMinus,
        buttonLabel: 'Subtract quantities',
        resultEyebrow: 'Subtraction result'
    },
    divide: {
        label: 'Divide (Ratio)',
        icon: Split,
        buttonLabel: 'Calculate ratio',
        resultEyebrow: 'Division result'
    }
};

const toDisplayNumber = (value, digits = 4) => Number(value).toFixed(digits);

const getNumericResult = (data) => {
    const candidates = [data?.resultValue, data?.result, data?.value];

    for (const candidate of candidates) {
        const parsed = Number(candidate);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return null;
};

const getBooleanResult = (data) => {
    if (typeof data?.result === 'boolean') {
        return data.result;
    }

    if (typeof data?.resultString === 'boolean') {
        return data.resultString;
    }

    if (typeof data?.equal === 'boolean') {
        return data.equal;
    }

    if (typeof data?.isEqual === 'boolean') {
        return data.isEqual;
    }

    if (typeof data?.resultString === 'string') {
        return data.resultString.trim().toLowerCase() === 'true';
    }

    return null;
};

const formatResult = ({ operation, data, thisValue, thisUnit, thatValue, thatUnit }) => {
    if (operation === 'compare') {
        const isEqual = getBooleanResult(data);

        if (isEqual === null) {
            return null;
        }

        return {
            displayValue: isEqual ? 'Equal' : 'Not equal',
            displayUnit: '',
            summary: `${thisValue} ${thisUnit} and ${thatValue} ${thatUnit} are ${isEqual ? 'equal' : 'not equal'}.`,
            historyTo: isEqual ? 'Equal' : 'Not equal'
        };
    }

    const numericResult = getNumericResult(data);

    if (numericResult === null) {
        return null;
    }

    if (operation === 'divide') {
        return {
            displayValue: toDisplayNumber(numericResult),
            displayUnit: 'ratio',
            summary: `${thisValue} ${thisUnit} divided by ${thatValue} ${thatUnit} equals ${toDisplayNumber(numericResult)}.`,
            historyTo: toDisplayNumber(numericResult)
        };
    }

    const resultUnit = data?.resultUnit || thatUnit;

    if (operation === 'convert') {
        return {
            displayValue: toDisplayNumber(numericResult),
            displayUnit: resultUnit,
            summary: `${thisValue} ${thisUnit} converts to ${toDisplayNumber(numericResult)} ${resultUnit}.`,
            historyTo: `${toDisplayNumber(numericResult, 2)} ${resultUnit}`
        };
    }

    return {
        displayValue: toDisplayNumber(numericResult),
        displayUnit: resultUnit,
        summary: `${thisValue} ${thisUnit} ${operation === 'add' ? 'plus' : 'minus'} ${thatValue} ${thatUnit} equals ${toDisplayNumber(numericResult)} ${resultUnit}.`,
        historyTo: `${toDisplayNumber(numericResult, 2)} ${resultUnit}`
    };
};

const formatHistoryTimestamp = (createdAt) => {
    if (!createdAt) {
        return 'Recently';
    }

    const parsedDate = new Date(createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
        return 'Recently';
    }

    return parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatHistoryItem = (entry) => {
    const operationKey = (entry.operation || '').toLowerCase();
    const operationMeta = OPERATION_META[operationKey];
    const typeLabel = TYPE_META[entry.thisMeasurementType]?.label
        || entry.thisMeasurementType
        || 'Measurement';

    const from = operationKey === 'convert'
        ? `${entry.thisValue} ${entry.thisUnit}`
        : `${entry.thisValue} ${entry.thisUnit}${entry.thatValue !== null && entry.thatValue !== undefined ? ` and ${entry.thatValue} ${entry.thatUnit}` : ''}`;

    let to = entry.resultUnit
        ? `${toDisplayNumber(entry.resultValue, 2)} ${entry.resultUnit}`
        : entry.resultString || (entry.resultValue !== null && entry.resultValue !== undefined ? toDisplayNumber(entry.resultValue, 2) : 'No result');

    if (entry.error) {
        to = entry.errorMessage || 'Operation failed';
    }

    return {
        id: entry.id || `${entry.createdAt || Date.now()}-${entry.operation}`,
        operation: operationMeta?.label || entry.operation || 'Operation',
        type: typeLabel,
        from,
        to,
        time: formatHistoryTimestamp(entry.createdAt)
    };
};

const Dashboard = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [measurementType, setMeasurementType] = useState('LENGTH');
    const [operation, setOperation] = useState('convert');
    const [thisUnit, setThisUnit] = useState('FEET');
    const [thatUnit, setThatUnit] = useState('INCH');
    const [thisValue, setThisValue] = useState('');
    const [thatValue, setThatValue] = useState('');
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const fetchHistory = async ({ silent = false } = {}) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        if (!silent) {
            setHistoryLoading(true);
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/history/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const formattedHistory = Array.isArray(response.data)
                ? response.data.map(formatHistoryItem).slice(0, HISTORY_LIMIT)
                : [];
            setHistory(formattedHistory);
        } catch (err) {
            console.error('History fetch error:', err);
            if (err.response?.status === 401) {
                handleLogout();
                return;
            }

            toast.error('Unable to load calculation history right now.');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

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
        setThisValue('');
        setThatValue('');
        setResult(null);
    };

    const handleOperationChange = (nextOperation) => {
        setOperation(nextOperation);
        setThatValue('');
        setResult(null);
    };

    const handleSwapUnits = () => {
        setThisUnit(thatUnit);
        setThatUnit(thisUnit);

        if (operation !== 'convert') {
            setThisValue(thatValue);
            setThatValue(thisValue);
        }
    };

    const handleCalculation = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const parsedThisValue = Number.parseFloat(thisValue);
        const parsedThatValue = Number.parseFloat(thatValue);
        const requiresSecondValue = operation !== 'convert';

        if (Number.isNaN(parsedThisValue)) {
            toast.error('Enter a valid first quantity.');
            return;
        }

        if (requiresSecondValue && Number.isNaN(parsedThatValue)) {
            toast.error('Enter a valid second quantity.');
            return;
        }

        if (operation === 'divide' && Math.abs(parsedThatValue) < EPSILON) {
            toast.error('Division by zero is not allowed.');
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const requestBody = {
                thisQuantityDTO: {
                    value: parsedThisValue,
                    unit: thisUnit,
                    measurementType
                },
                thatQuantityDTO: {
                    ...(requiresSecondValue ? { value: parsedThatValue } : {}),
                    unit: thatUnit,
                    measurementType
                }
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/v1/quantities/${operation}`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const formattedResult = formatResult({
                operation,
                data: response.data,
                thisValue: parsedThisValue,
                thisUnit,
                thatValue: requiresSecondValue ? parsedThatValue : null,
                thatUnit
            });

            if (!formattedResult) {
                toast.error('Received an unexpected response from the backend.');
                return;
            }

            setResult(formattedResult);
            await fetchHistory({ silent: true });
            toast.success(`${OPERATION_META[operation].label} completed.`);
        } catch (err) {
            console.error('Quantity operation error:', err);
            if (err.response?.status === 401) {
                handleLogout();
                return;
            }

            toast.error(
                err.response?.data?.errorMessage ||
                err.response?.data?.message ||
                `Unable to ${operation} these quantities right now.`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const activeTypeMeta = TYPE_META[measurementType];
    const ActiveIcon = activeTypeMeta.icon;
    const activeOperationMeta = OPERATION_META[operation];
    const ActiveOperationIcon = activeOperationMeta.icon;
    const requiresSecondValue = operation !== 'convert';

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

                    <div className="operation-picker" role="tablist" aria-label="Operations">
                        {OPERATIONS.map((item) => {
                            const isActive = item.id === operation;
                            const OperationIcon = OPERATION_META[item.id].icon;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`operation-pill${isActive ? ' is-active' : ''}`}
                                    onClick={() => handleOperationChange(item.id)}
                                >
                                    <OperationIcon size={15} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <form className="converter-form" onSubmit={handleCalculation}>
                        <div className="field-grid field-grid-split">
                            <div className="form-group">
                                <label htmlFor="from-unit">{operation === 'convert' ? 'From unit' : 'First unit'}</label>
                                <select id="from-unit" value={thisUnit} onChange={(e) => setThisUnit(e.target.value)}>
                                    {UNITS_BY_TYPE[measurementType].map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>

                            <button className="swap-indicator swap-button" type="button" onClick={handleSwapUnits}>
                                <ArrowRightLeft size={16} />
                            </button>

                            <div className="form-group">
                                <label htmlFor="to-unit">{operation === 'convert' ? 'To unit' : 'Second unit'}</label>
                                <select id="to-unit" value={thatUnit} onChange={(e) => setThatUnit(e.target.value)}>
                                    {UNITS_BY_TYPE[measurementType].map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={`field-grid${requiresSecondValue ? ' dual-value-grid' : ''}`}>
                            <div className="form-group">
                                <label htmlFor="input-value">{operation === 'convert' ? 'Value to convert' : 'First quantity'}</label>
                                <input
                                    id="input-value"
                                    type="number"
                                    value={thisValue}
                                    onChange={(e) => setThisValue(e.target.value)}
                                    step="any"
                                    placeholder="0.00"
                                />
                            </div>

                            {requiresSecondValue && (
                                <div className="form-group">
                                    <label htmlFor="second-input-value">Second quantity</label>
                                    <input
                                        id="second-input-value"
                                        type="number"
                                        value={thatValue}
                                        onChange={(e) => setThatValue(e.target.value)}
                                        step="any"
                                        placeholder="0.00"
                                    />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            <span>{isLoading ? 'Calculating...' : activeOperationMeta.buttonLabel}</span>
                            <ChevronRight size={18} />
                        </button>
                    </form>

                    {result && (
                        <div className="result-card">
                            <div className="result-header">
                                <p className="eyebrow">{activeOperationMeta.resultEyebrow}</p>
                                <div className="result-badge">
                                    <ActiveOperationIcon size={14} />
                                    <span>{activeOperationMeta.label}</span>
                                </div>
                            </div>
                            <div className="result-main">
                                <strong>{result.displayValue}</strong>
                                {result.displayUnit && <span>{result.displayUnit}</span>}
                            </div>
                            <p className="result-subtext">{result.summary}</p>
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
                            <span>Operation</span>
                            <strong>{activeOperationMeta.label}</strong>
                        </div>
                        <div className="insight-row">
                            <span>Input pair</span>
                            <strong>{thisUnit} {operation === 'convert' ? 'to' : 'and'} {thatUnit}</strong>
                        </div>
                        <div className="insight-row">
                            <span>{requiresSecondValue ? 'Entered values' : 'Entered value'}</span>
                            <strong>{requiresSecondValue ? `${thisValue || '0'} / ${thatValue || '0'}` : thisValue || '0'}</strong>
                        </div>
                    </section>

                    <section className="panel-card history-card">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">Activity</p>
                                <h2>Recent calculations</h2>
                            </div>
                            <History size={18} />
                        </div>

                        {historyLoading ? (
                            <div className="empty-state">
                                <History size={18} />
                                <p>Loading history...</p>
                                <span>Recent server-side calculations will appear here.</span>
                            </div>
                        ) : history.length > 0 ? (
                            <div className="history-list">
                                {history.map((item) => (
                                    <article key={item.id} className="history-item">
                                        <div className="history-row">
                                            <span>{item.from}</span>
                                            <strong>{item.to}</strong>
                                        </div>
                                        <div className="history-meta">
                                            <span>{item.operation}</span>
                                            <span>{item.type}</span>
                                            <span>{item.time}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <History size={18} />
                                <p>No calculations yet.</p>
                                <span>Your latest server-side calculations will appear here.</span>
                            </div>
                        )}
                    </section>
                </aside>
            </main>
        </div>
    );
};

export default Dashboard;
