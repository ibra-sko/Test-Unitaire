import { countUsers, registerUser, getUsers, loginAdmin, deleteUser } from './api';
import axios from 'axios';

jest.mock('axios');

describe('API Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('countUsers doit retourner le nombre d\'utilisateurs en succès', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: { utilisateurs: [{}, {}] } }));
    const count = await countUsers();
    expect(count).toBe(2);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users'));
  });

  it('countUsers doit lever une erreur si l\'appel échoue', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur API')));
    await expect(countUsers()).rejects.toThrow('Erreur API');
  });

  it('registerUser doit envoyer les données et retourner le résultat en succès', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({ data: { message: 'OK' } }));
    const result = await registerUser({ nom: 'Test' });
    expect(result.message).toBe('OK');
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/users'), { nom: 'Test' });
  });

  it('getUsers doit envoyer le token si présent', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: { utilisateurs: [] } }));
    await getUsers('test-token');
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users'), { headers: { Authorization: 'Bearer test-token' } });
  });

  it('loginAdmin doit envoyer email et password', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({ data: { access_token: 'token' } }));
    const result = await loginAdmin('admin@test.com', 'password');
    expect(result.access_token).toBe('token');
  });

  it('deleteUser doit envoyer le token d\'autorisation', async () => {
    axios.delete.mockImplementationOnce(() => Promise.resolve({ data: { message: 'Deleted' } }));
    await deleteUser(1, 'test-token');
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/users/1'), { headers: { Authorization: 'Bearer test-token' } });
  });

  it('utilise REACT_APP_API_URL quand la variable est définie', async () => {
    const original = process.env.REACT_APP_API_URL;
    process.env.REACT_APP_API_URL = 'https://api.prod.com';
    jest.resetModules();
    const freshAxios = require('axios');
    freshAxios.get.mockResolvedValueOnce({ data: { utilisateurs: [] } });
    const { getUsers: freshGetUsers } = require('./api');

    await freshGetUsers();
    expect(freshAxios.get).toHaveBeenCalledWith('https://api.prod.com/users', {});

    process.env.REACT_APP_API_URL = original;
  });

  it('retombe sur le port 8000 par défaut sans REACT_APP_SERVER_PORT', async () => {
    const originalUrl = process.env.REACT_APP_API_URL;
    const originalPort = process.env.REACT_APP_SERVER_PORT;
    delete process.env.REACT_APP_API_URL;
    delete process.env.REACT_APP_SERVER_PORT;
    jest.resetModules();
    const freshAxios = require('axios');
    freshAxios.get.mockResolvedValueOnce({ data: { utilisateurs: [] } });
    const { getUsers: freshGetUsers } = require('./api');

    await freshGetUsers();
    expect(freshAxios.get).toHaveBeenCalledWith('http://localhost:8000/users', {});

    process.env.REACT_APP_API_URL = originalUrl;
    process.env.REACT_APP_SERVER_PORT = originalPort;
  });
});
