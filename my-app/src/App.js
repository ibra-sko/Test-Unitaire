import React, { useState, useEffect } from 'react';
import './App.css';

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  if (isNaN(dob.getTime())) return 0;

  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
  }
  return age;
};

export const isAdult = (dateOfBirth) => {
  return calculateAge(dateOfBirth) >= 18;
};

export const isValidZipCode = (zipCode) => {
  const regex = /^\d{5}$/;
  return regex.test(zipCode);
};

export const isValidNameOrCity = (str) => {
  if (!str || str.trim() === '') return false;
  const regex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return regex.test(str);
};

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const initialFormState = {
  nom: '',
  prenom: '',
  email: '',
  dateNaissance: '',
  ville: '',
  codePostal: ''
};

function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showToaster, setShowToaster] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setUsers(savedUsers);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isValidNameOrCity(formData.nom)) newErrors.nom = "Format du nom invalide";
    if (!isValidNameOrCity(formData.prenom)) newErrors.prenom = "Format du prénom invalide";
    if (!isValidEmail(formData.email)) newErrors.email = "Format de l'email invalide";
    if (!isAdult(formData.dateNaissance)) newErrors.dateNaissance = "Vous devez avoir au moins 18 ans";
    if (!isValidNameOrCity(formData.ville)) newErrors.ville = "Format de la ville invalide";
    if (!isValidZipCode(formData.codePostal)) newErrors.codePostal = "Le code postal doit contenir exactement 5 chiffres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormFilled = Object.values(formData).every(val => val && val.trim() !== '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newUsers = [...users, formData];
      localStorage.setItem('registeredUsers', JSON.stringify(newUsers));
      setUsers(newUsers);
      
      setShowToaster(true);
      setTimeout(() => setShowToaster(false), 3000);
      
      setFormData(initialFormState);
      setErrors({});
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {showToaster && <div data-testid="success-toaster" style={{ background: '#4caf50', color: 'white', padding: '10px', marginBottom: '10px' }}>Inscription réussie !</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Nom</label><br/>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} data-testid="input-nom" />
          {errors.nom && <div style={{ color: 'red' }} data-testid="error-nom">{errors.nom}</div>}
        </div>

        <div>
          <label>Prénom</label><br/>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} data-testid="input-prenom" />
          {errors.prenom && <div style={{ color: 'red' }} data-testid="error-prenom">{errors.prenom}</div>}
        </div>

        <div>
          <label>Email</label><br/>
          <input type="email" name="email" value={formData.email} onChange={handleChange} data-testid="input-email" />
          {errors.email && <div style={{ color: 'red' }} data-testid="error-email">{errors.email}</div>}
        </div>

        <div>
          <label>Date de naissance</label><br/>
          <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} data-testid="input-dateNaissance" />
          {errors.dateNaissance && <div style={{ color: 'red' }} data-testid="error-dateNaissance">{errors.dateNaissance}</div>}
        </div>

        <div>
          <label>Ville</label><br/>
          <input type="text" name="ville" value={formData.ville} onChange={handleChange} data-testid="input-ville" />
          {errors.ville && <div style={{ color: 'red' }} data-testid="error-ville">{errors.ville}</div>}
        </div>

        <div>
          <label>Code Postal</label><br/>
          <input type="text" name="codePostal" value={formData.codePostal} onChange={handleChange} data-testid="input-codePostal" />
          {errors.codePostal && <div style={{ color: 'red' }} data-testid="error-codePostal">{errors.codePostal}</div>}
        </div>

        <button type="submit" disabled={!isFormFilled} data-testid="submit-btn">Sauvegarder</button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h2>Liste des inscrits</h2>
        <ul data-testid="users-list">
          {users.map((user, index) => (
            <li key={index} data-testid={`user-item-${index}`}>{user.prenom} {user.nom} - {user.ville}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
