import React, { useState, useEffect } from 'react';
import './App.css';
import Registration from './components/Registration/Registration';
import AdminLogin from './components/AdminLogin/AdminLogin';
import UserList from './components/UserList/UserList';
import { getUsers } from './utils/api';

function App() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    getUsers(token)
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <div className="app-container">
      <AdminLogin onLogin={handleLogin} onLogout={handleLogout} token={token} />
      <Registration onUserAdded={fetchUsers} />
      {loading ? (
        <p style={{ textAlign: 'center' }}>⏳ Chargement des utilisateurs...</p>
      ) : (
        <UserList users={users} token={token} onUserDeleted={fetchUsers} />
      )}
      <footer className="app-footer">
        <a href="https://github.com/ibra-sko/Test-Unitaire#readme" className="readme-link" target="_blank" rel="noopener noreferrer">
          📖 Consulter la documentation (README)
        </a>
      </footer>
    </div>
  );
}

export default App;
