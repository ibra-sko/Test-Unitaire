import React, { useState } from 'react';
import './Registration.css';
import { isAdult, isValidZipCode, isValidNameOrCity, isValidEmail } from '../../utils/validation';
import { registerUser } from '../../utils/api';

const initialFormState = {
  nom: '',
  prenom: '',
  email: '',
  dateNaissance: '',
  ville: '',
  codePostal: ''
};

export default function Registration({ onUserAdded }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showToaster, setShowToaster] = useState(false);

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

  // Button non clickable si un champ est vide
  const isFormFilled = Object.values(formData).every(val => val && val.trim() !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await registerUser(formData);

        // Notify App to refresh users
        if (onUserAdded) {
          onUserAdded();
        }

        // Show toaster
        setShowToaster(true);
        setTimeout(() => setShowToaster(false), 3000);

        // Reset fields
        setFormData(initialFormState);
        setErrors({});
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setErrors(prev => ({ ...prev, email: error.response.data.detail }));
        } else {
          console.error("Erreur API:", error);
        }
      }
    }
  };

  return (
    <div className="registration-container">
      {showToaster && <div className="toaster" data-testid="success-toaster">Inscription réussie !</div>}

      <form className="registration-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Nom</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} data-testid="input-nom" />
          {errors.nom && <span className="error-message" data-testid="error-nom">{errors.nom}</span>}
        </div>

        <div className="form-group">
          <label>Prénom</label>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} data-testid="input-prenom" />
          {errors.prenom && <span className="error-message" data-testid="error-prenom">{errors.prenom}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} data-testid="input-email" />
          {errors.email && <span className="error-message" data-testid="error-email">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Date de naissance</label>
          <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} data-testid="input-dateNaissance" />
          {errors.dateNaissance && <span className="error-message" data-testid="error-dateNaissance">{errors.dateNaissance}</span>}
        </div>

        <div className="form-group">
          <label>Ville</label>
          <input type="text" name="ville" value={formData.ville} onChange={handleChange} data-testid="input-ville" />
          {errors.ville && <span className="error-message" data-testid="error-ville">{errors.ville}</span>}
        </div>

        <div className="form-group">
          <label>Code Postal</label>
          <input type="text" name="codePostal" value={formData.codePostal} onChange={handleChange} data-testid="input-codePostal" />
          {errors.codePostal && <span className="error-message" data-testid="error-codePostal">{errors.codePostal}</span>}
        </div>

        <button type="submit" className="submit-btn" disabled={!isFormFilled} data-testid="submit-btn">Sauvegarder</button>
      </form>
    </div>
  );
}
