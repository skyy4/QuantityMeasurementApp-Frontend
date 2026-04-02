import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    toast.success('Logged out successfully.', { duration: 3000 });
  };

  const handleAuthSuccess = (nextToken, message) => {
    localStorage.setItem('jwt_token', nextToken);
    setToken(nextToken);
    toast.success(message, { duration: 4000 });
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.95rem'
          }
        }}
      />
      {token
        ? <Dashboard token={token} onLogout={handleLogout} />
        : <Login onAuthSuccess={handleAuthSuccess} />
      }
    </>
  );
}

export default App;
