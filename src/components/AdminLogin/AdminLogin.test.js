import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminLogin from './AdminLogin';
import axios from 'axios';

jest.mock('axios');

describe('AdminLogin Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('affiche le formulaire quand il n\'y a pas de token', () => {
        render(<AdminLogin onLogin={jest.fn()} onLogout={jest.fn()} token={null} />);
        expect(screen.getByPlaceholderText('Email Admin')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
        expect(screen.getByText('Connexion')).toBeInTheDocument();
    });

    it('connecte l\'admin et appelle onLogin avec le token', async () => {
        axios.post.mockResolvedValueOnce({ data: { access_token: 'jwt-123' } });
        const onLogin = jest.fn();
        render(<AdminLogin onLogin={onLogin} onLogout={jest.fn()} token={null} />);

        fireEvent.change(screen.getByPlaceholderText('Email Admin'), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'secret' } });

        await act(async () => {
            fireEvent.click(screen.getByText('Connexion'));
        });

        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/login'), { email: 'admin@test.com', password: 'secret' });
        expect(onLogin).toHaveBeenCalledWith('jwt-123');
        // Les champs sont réinitialisés
        expect(screen.getByPlaceholderText('Email Admin')).toHaveValue('');
        expect(screen.getByPlaceholderText('Mot de passe')).toHaveValue('');
    });

    it('affiche le message d\'erreur renvoyé par l\'API', async () => {
        axios.post.mockRejectedValueOnce({ response: { data: { detail: 'Identifiants incorrects' } } });
        render(<AdminLogin onLogin={jest.fn()} onLogout={jest.fn()} token={null} />);

        fireEvent.change(screen.getByPlaceholderText('Email Admin'), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'mauvais' } });

        await act(async () => {
            fireEvent.click(screen.getByText('Connexion'));
        });

        expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
    });

    it('affiche un message générique si l\'erreur n\'a pas de détail', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network error'));
        render(<AdminLogin onLogin={jest.fn()} onLogout={jest.fn()} token={null} />);

        fireEvent.change(screen.getByPlaceholderText('Email Admin'), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'x' } });

        await act(async () => {
            fireEvent.click(screen.getByText('Connexion'));
        });

        expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
    });

    it('affiche le mode administrateur et gère la déconnexion quand un token est présent', () => {
        const onLogout = jest.fn();
        render(<AdminLogin onLogin={jest.fn()} onLogout={onLogout} token="jwt-123" />);

        expect(screen.getByText(/Mode Administrateur activé/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText('Se déconnecter'));
        expect(onLogout).toHaveBeenCalled();
    });
});
