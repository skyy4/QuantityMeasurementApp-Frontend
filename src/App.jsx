import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));

  useEffect(() => {
    // Check if redirect from Google Auth contains a token in URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      localStorage.setItem('jwt_token', urlToken);
      setToken(urlToken);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ 
        style: { 
          background: '#1e293b', 
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.1)'
        } 
      }}/>
      {token ? <Dashboard token={token} onLogout={handleLogout} /> : <Login />}
    </>
  );
}

export default App;
