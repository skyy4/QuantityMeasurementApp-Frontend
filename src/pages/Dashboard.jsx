import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeftRight, LogOut, Ruler, Scale, Droplets, Thermometer, Info } from 'lucide-react';
import { UNITS, OPERATIONS, API_BASE_URL } from '../constants/units';

const Dashboard = ({ token, onLogout }) => {
  const types = [
    { id: 'LengthUnit', label: 'Length', icon: <Ruler size={18} /> },
    { id: 'WeightUnit', label: 'Weight', icon: <Scale size={18} /> },
    { id: 'VolumeUnit', label: 'Volume', icon: <Droplets size={18} /> },
    { id: 'TemperatureUnit', label: 'Temperature', icon: <Thermometer size={18} /> },
  ];

  const [activeType, setActiveType] = useState('LengthUnit');
  const [activeOp, setActiveOp] = useState('convert');
  
  const [val1, setVal1] = useState('');
  const [unit1, setUnit1] = useState(UNITS.LengthUnit[0]);
  
  const [val2, setVal2] = useState('');
  const [unit2, setUnit2] = useState(UNITS.LengthUnit[1] || UNITS.LengthUnit[0]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('calc_history');
    return saved ? JSON.parse(saved) : [];
  });

  // When type changes, reset units and values
  useEffect(() => {
    setUnit1(UNITS[activeType][0]);
    setUnit2(UNITS[activeType][1] || UNITS[activeType][0]);
    setVal1('');
    setVal2('');
    setResult(null);
  }, [activeType]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  const handleSwap = () => {
    setUnit1(unit2);
    setUnit2(unit1);
    if (activeOp !== 'convert') {
      setVal1(val2);
      setVal2(val1);
    }
  };

  const handleAction = async () => {
    const v1 = parseFloat(val1);
    const v2 = activeOp === 'convert' ? 0 : parseFloat(val2);

    if (isNaN(v1) || (activeOp !== 'convert' && isNaN(v2))) {
      toast.error('Please enter valid numerical values.');
      return;
    }

    const payload = {
      thisQuantityDTO: { value: v1, unit: unit1, measurementType: activeType },
      thatQuantityDTO: { value: v2, unit: unit2, measurementType: activeType }
    };

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/quantities/${activeOp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        toast.error('Session expired or invalid. Please log in again.');
        onLogout();
        return;
      }

      if (!res.ok) throw new Error("Server Error or Unauthorized");
      
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.errorMessage);
        setResult({ isError: true, message: data.errorMessage });
      } else {
        processSuccess(data);
      }
    } catch (e) {
      toast.error('Failed to connect to backend engine.');
      setResult({ isError: true, message: 'Server communication failed.' });
    } finally {
      setLoading(false);
    }
  };

  const processSuccess = (data) => {
    let messageHtml = '';
    let rawMessage = '';
    
    if (activeOp === 'convert') {
      messageHtml = `<span>${data.thisValue} ${data.thisUnit} = <strong class="result-value">${data.resultValue.toFixed(4)} ${data.resultUnit}</strong></span>`;
      rawMessage = `${data.thisValue} ${data.thisUnit} = ${data.resultValue.toFixed(4)} ${data.resultUnit}`;
    } else if (activeOp === 'compare') {
      const eqLog = data.resultString === 'true';
      messageHtml = eqLog
        ? `The quantities are <strong style="color:var(--success)">EQUAL</strong>.`
        : `The quantities are <strong style="color:var(--error)">NOT EQUAL</strong>.`;
      rawMessage = eqLog ? 'EQUAL' : 'NOT EQUAL';
    } else if (activeOp === 'add' || activeOp === 'subtract') {
      messageHtml = `Result: <strong class="result-value">${data.resultValue.toFixed(3)} ${data.resultUnit}</strong>`;
      rawMessage = `${activeOp.toUpperCase()} Result: ${data.resultValue.toFixed(3)} ${data.resultUnit}`;
    } else if (activeOp === 'divide') {
      messageHtml = `Ratio Result: <strong class="result-value">${Number(data.resultValue).toFixed(4)}</strong>`;
      rawMessage = `Ratio: ${Number(data.resultValue).toFixed(4)}`;
    }
    
    setResult({ isError: false, html: messageHtml });
    toast.success('Calculation successful!');

    // Add to History
    setHistory(prev => {
      const newHist = [{ op: activeOp.toUpperCase(), type: activeType, details: rawMessage, id: Date.now() }, ...prev];
      return newHist.slice(0, 10); // keep last 10
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>
          <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📏</text></svg>" width="32" alt="icon"/>
          Quantity Analyzer
        </h2>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      <div className="nav-tabs">
        {types.map(t => (
          <button 
            key={t.id} 
            className={`tab ${activeType === t.id ? 'active' : ''}`}
            onClick={() => setActiveType(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="content-section">
        <div className="operations">
          {OPERATIONS.map(op => (
            <button 
              key={op.id}
              className={`op-btn ${activeOp === op.id ? 'active' : ''}`}
              onClick={() => setActiveOp(op.id)}
            >
              {op.label}
            </button>
          ))}
        </div>

        <div className="input-groups">
          {/* Input 1 */}
          <div className="input-group">
            <label>Quantity 1</label>
            <div className="input-controls">
              <input 
                type="number" 
                value={val1} 
                onChange={e => setVal1(e.target.value)} 
                placeholder="0.0" 
              />
              <select value={unit1} onChange={e => setUnit1(e.target.value)}>
                {UNITS[activeType].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <button className="swap-btn" onClick={handleSwap} title="Swap Units">
            <ArrowLeftRight size={20} />
          </button>

          {/* Input 2 */}
          <div className="input-group">
            <label>{activeOp === 'convert' ? 'Target Unit' : 'Quantity 2'}</label>
            <div className="input-controls" style={activeOp === 'convert' ? { background: 'transparent', border: 'none'} : {}}>
              {activeOp !== 'convert' && (
                <input 
                  type="number" 
                  value={val2} 
                  onChange={e => setVal2(e.target.value)} 
                  placeholder="0.0" 
                />
              )}
              <select 
                value={unit2} 
                onChange={e => setUnit2(e.target.value)}
                style={activeOp === 'convert' ? { borderLeft: 'none', background: 'rgba(15,23,42,0.8)', borderRadius: '12px', border: '1px solid var(--border-glass)' } : {}}
              >
                {UNITS[activeType].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button className="btn" onClick={handleAction} disabled={loading}>
          {loading ? <div className="loader"></div> : `${activeOp === 'convert' ? 'Convert' : 'Compute'} Quantity`}
        </button>

        {result && (
          <div className={`result-box ${result.isError ? 'error' : ''}`}>
            {result.isError ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Info size={20} />
                {result.message}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: result.html }} />
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Calculations</h3>
            <button 
              className="logout-btn" 
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
              onClick={() => setHistory([])}
            >
              Clear
            </button>
          </div>
          <div className="history-list">
            {history.map(h => (
              <div key={h.id} className="history-item">
                <span style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.2)', borderRadius: '12px' }}>
                  {h.op}
                </span>
                <span>{h.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
