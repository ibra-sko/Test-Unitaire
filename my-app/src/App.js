import React, { useState, useEffect } from 'react';
import './App.css';
import Registration from './components/Registration/Registration';
import { countUsers } from './utils/api';

function App() {
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    // Utilisation du port passé en variable d'environnement (avec 8000 par défaut si non défini)
    countUsers()
      .then(count => {
        setUserCount(count);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      });
  }, []);

  return (
    <div className="app-container">
      <Registration />
      <footer className="app-footer">
        <div className="db-count">
          {userCount !== null ? (
            <span>👨‍💻 {userCount} utilisateur(s) inscrit(s) en base de données</span>
          ) : (
            <span>⏳ Chargement de l'API...</span>
          )}
        </div>
        <a href="https://github.com/ibra-sko/Test-Unitaire#readme" className="readme-link" target="_blank" rel="noopener noreferrer">
          📖 Consulter la documentation (README)
        </a>
      </footer>
    </div>
  );
}

export default App;
