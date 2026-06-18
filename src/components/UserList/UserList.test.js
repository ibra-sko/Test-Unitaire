import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from './UserList';
import axios from 'axios';

jest.mock('axios');

const users = [
    {
        id: 1,
        nom: 'Doe',
        prenom: 'John',
        ville: 'Paris',
        email: 'john@doe.com',
        date_naissance: '2000-01-01',
        code_postal: '75001',
    },
];

describe('UserList Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('affiche un message quand la liste est vide', () => {
        render(<UserList users={[]} token={null} onUserDeleted={jest.fn()} />);
        expect(screen.getByText(/Aucun utilisateur inscrit/i)).toBeInTheDocument();
        expect(screen.getByText(/Liste des Utilisateurs \(0\)/i)).toBeInTheDocument();
    });

    it('affiche les infos privées et le bouton supprimer pour un admin', () => {
        render(<UserList users={users} token="tok" onUserDeleted={jest.fn()} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/john@doe.com/)).toBeInTheDocument();
        expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });

    it('ne montre pas les infos privées ni le bouton supprimer sans token', () => {
        render(<UserList users={users} token={null} onUserDeleted={jest.fn()} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText(/john@doe.com/)).not.toBeInTheDocument();
        expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
    });

    it('supprime un utilisateur après confirmation', async () => {
        window.confirm = jest.fn(() => true);
        axios.delete.mockResolvedValueOnce({ data: { message: 'Supprimé' } });
        const onUserDeleted = jest.fn();
        render(<UserList users={users} token="tok" onUserDeleted={onUserDeleted} />);

        await act(async () => {
            fireEvent.click(screen.getByText('Supprimer'));
        });

        expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/users/1'), expect.anything());
        expect(onUserDeleted).toHaveBeenCalled();
    });

    it('ne supprime pas si l\'utilisateur annule la confirmation', async () => {
        window.confirm = jest.fn(() => false);
        const onUserDeleted = jest.fn();
        render(<UserList users={users} token="tok" onUserDeleted={onUserDeleted} />);

        await act(async () => {
            fireEvent.click(screen.getByText('Supprimer'));
        });

        expect(axios.delete).not.toHaveBeenCalled();
        expect(onUserDeleted).not.toHaveBeenCalled();
    });

    it('affiche une alerte si la suppression échoue', async () => {
        window.confirm = jest.fn(() => true);
        window.alert = jest.fn();
        axios.delete.mockRejectedValueOnce(new Error('Erreur réseau'));
        render(<UserList users={users} token="tok" onUserDeleted={jest.fn()} />);

        await act(async () => {
            fireEvent.click(screen.getByText('Supprimer'));
        });

        expect(window.alert).toHaveBeenCalledWith('Erreur lors de la suppression');
    });
});
