import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import axios from 'axios';

jest.mock('axios');

describe('App Component - Tests d\'intégration', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-05-07T00:00:00Z'));
        axios.get.mockResolvedValue({ data: { utilisateurs: [] } });
        axios.post.mockResolvedValue({ data: {} });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('devrait permettre de remplir le formulaire et de le soumettre (Integration Test)', async () => {
        // 1er appel (montage) : liste vide. 2e appel (après ajout via onUserAdded) : l'utilisateur créé.
        axios.get
            .mockResolvedValueOnce({ data: { utilisateurs: [] } })
            .mockResolvedValueOnce({ data: { utilisateurs: [{ id: 1, nom: 'Dupont', prenom: 'Jean', ville: 'Paris' }] } });

        render(<App />);

        // Remplir le formulaire
        fireEvent.change(screen.getByTestId('input-nom'), { target: { name: 'nom', value: 'Dupont' } });
        fireEvent.change(screen.getByTestId('input-prenom'), { target: { name: 'prenom', value: 'Jean' } });
        fireEvent.change(screen.getByTestId('input-email'), { target: { name: 'email', value: 'jean.dupont@test.com' } });
        fireEvent.change(screen.getByTestId('input-dateNaissance'), { target: { name: 'dateNaissance', value: '2000-01-01' } });
        fireEvent.change(screen.getByTestId('input-ville'), { target: { name: 'ville', value: 'Paris' } });
        fireEvent.change(screen.getByTestId('input-codePostal'), { target: { name: 'codePostal', value: '75001' } });

        // Vérifier que le bouton est actif
        const btn = screen.getByTestId('submit-btn');
        expect(btn).not.toBeDisabled();

        // Soumettre le formulaire
        await act(async () => {
            fireEvent.click(btn);
        });

        // Laisser le refetch (onUserAdded -> getUsers) se résoudre
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        // Vérifier le succès et l'ajout dans la liste (rendue par UserList)
        expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
        expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
        expect(screen.getByText(/Paris/i)).toBeInTheDocument();

        // Attendre que le toaster disparaisse
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });
        expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
    });

    it('devrait récupérer le nombre d\'utilisateurs depuis l\'API', async () => {
        axios.get.mockResolvedValueOnce({ data: { utilisateurs: [{ id: 1 }, { id: 2 }, { id: 3 }] } });
        render(<App />);

        await act(async () => {
            await Promise.resolve();
        });

        // UserList affiche le compteur : "Liste des Utilisateurs (3)"
        expect(screen.getByText(/Liste des Utilisateurs \(3\)/i)).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users'), expect.anything());
    });

    it('devrait gérer les erreurs de l\'API lors de la récupération des utilisateurs', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        axios.get.mockRejectedValueOnce(new Error('API Error'));
        
        render(<App />);
        
        await act(async () => {
            await Promise.resolve();
        });
        
        expect(consoleSpy).toHaveBeenCalledWith("Erreur lors de la récupération des utilisateurs:", expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('devrait gérer la connexion puis la déconnexion de l\'administrateur', async () => {
        axios.get.mockResolvedValue({ data: { utilisateurs: [] } });
        axios.post.mockResolvedValueOnce({ data: { access_token: 'admin-token' } });

        render(<App />);

        // Connexion via le formulaire AdminLogin
        fireEvent.change(screen.getByPlaceholderText('Email Admin'), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'secret' } });
        await act(async () => {
            fireEvent.click(screen.getByText('Connexion'));
            await Promise.resolve();
        });

        // handleLogin : token stocké + mode admin affiché
        expect(localStorage.getItem('adminToken')).toBe('admin-token');
        expect(screen.getByText(/Mode Administrateur activé/i)).toBeInTheDocument();

        // handleLogout : token retiré
        await act(async () => {
            fireEvent.click(screen.getByText('Se déconnecter'));
        });
        expect(localStorage.getItem('adminToken')).toBeNull();
        expect(screen.getByText('Connexion')).toBeInTheDocument();
    });
});

