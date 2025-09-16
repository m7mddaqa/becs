

import React, { useState } from 'react';
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PublicRegisterPage from "./pages/PublicRegisterPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [showPublicRegister, setShowPublicRegister] = useState(false);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  if (!token) {
    if (showPublicRegister) {
      return <>
        <button onClick={() => setShowPublicRegister(false)} className="absolute top-4 left-4 bg-gray-400 text-white px-4 py-2 rounded">Back to Login</button>
        <PublicRegisterPage onSuccess={() => setShowPublicRegister(false)} />
      </>;
    }
    return <LoginPage onLogin={handleLogin} onShowRegister={() => setShowPublicRegister(true)} />;
  }

  if (showRegister) {
    return (
      <div className="App">
        <button onClick={() => setShowRegister(false)} className="absolute top-4 left-4 bg-gray-400 text-white px-4 py-2 rounded">Back</button>
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        <RegisterPage token={token} />
      </div>
    );
  }

  return (
    <div className="App">
      <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      <button onClick={() => setShowRegister(true)} className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded">Register User</button>
      <Dashboard />
    </div>
  );
}

export default App;
