import axios from 'axios';

// En production sur Vercel, l'URL de base doit être celle de l'API déployée.
// En local, on utilise le localhost.
// Vercel définit REACT_APP_API_URL si on le configure dans l'environnement.
const API_URL = process.env.REACT_APP_API_URL || `http://localhost:${process.env.REACT_APP_SERVER_PORT || 8000}`;

export const countUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data.utilisateurs.length;
};

export const getUsers = async (token = null) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axios.get(`${API_URL}/users`, config);
  return response.data.utilisateurs;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/users`, userData);
  return response.data;
};

export const loginAdmin = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const deleteUser = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.delete(`${API_URL}/users/${id}`, config);
  return response.data;
};
