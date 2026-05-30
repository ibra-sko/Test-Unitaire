import React from 'react';
import './App.css';
import Registration from './components/Registration/Registration';

function App() {
  return (
    <div>
      <Registration />
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
        <a href="https://github.com/ibra-sko/Test-Unitaire#readme" target="_blank" rel="noopener noreferrer">
          📖 Lire la documentation (README)
        </a>
      </div>
    </div>
  );
}

export default App;
