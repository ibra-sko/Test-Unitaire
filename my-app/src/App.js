import React, { useState, useEffect } from 'react';
import './App.css';
import Registration from './components/Registration/Registration';
import axios from 'axios';

function App() {
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    // Utilisation du port passé en variable d'environnement (avec 8000 par défaut si non défini)
    const port = process.env.REACT_APP_SERVER_PORT || 8000;
    axios.get(`http://localhost:${port}/users`)
      .then(response => {
        // L'API Python renvoie un dictionnaire avec la clé 'utilisateurs' contenant le tableau
        setUserCount(response.data.utilisateurs.length);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      });
  }, []);

  return (
    <div>
      <Registration />
      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '18px', fontWeight: 'bold' }}>
        {userCount !== null ? (
          <p>👨‍💻 Nombre d'utilisateurs inscrits en base de données : {userCount}</p>
        ) : (
          <p>⏳ Chargement des utilisateurs depuis l'API...</p>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
        <a href="https://github.com/ibra-sko/Test-Unitaire#readme" target="_blank" rel="noopener noreferrer">
          📖 Lire la documentation (README)
        </a>
      </div>
    </div>
  );
}

export default App;
