import React, { useState } from 'react';
import { loginAdmin } from '../../utils/api';
import './AdminLogin.css';

const AdminLogin = ({ onLogin, onLogout, token }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await loginAdmin(email, password);
      onLogin(data.access_token);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur de connexion");
    }
  };

  if (token) {
    return (
      <div className="admin-login-container">
        <p>👨‍💼 Mode Administrateur activé</p>
        <button onClick={onLogout} className="logout-btn">Se déconnecter</button>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <h3>Accès Administrateur</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input 
          type="email" 
          placeholder="Email Admin" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Connexion</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default AdminLogin;
