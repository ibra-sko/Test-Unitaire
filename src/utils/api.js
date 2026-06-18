import axios from 'axios';

const port = process.env.REACT_APP_SERVER_PORT || 8000;
const API_URL = `http://localhost:${port}`;

export const countUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data.utilisateurs.length;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/users`, userData);
  return response.data;
};
