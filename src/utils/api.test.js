import { countUsers, registerUser } from './api';
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

  it('registerUser doit lever une erreur si l\'appel échoue', async () => {
    axios.post.mockImplementationOnce(() => Promise.reject(new Error('Erreur API POST')));
    await expect(registerUser({})).rejects.toThrow('Erreur API POST');
  });
});
