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
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('devrait permettre de remplir le formulaire et de le soumettre (Integration Test)', () => {
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
        fireEvent.click(btn);

        // Vérifier le succès et l'ajout dans la liste
        expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
        expect(screen.getByTestId('user-item-0')).toHaveTextContent('Jean Dupont - Paris');

        // Attendre que le toaster disparaisse
        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
    });

    it('devrait récupérer le nombre d\'utilisateurs depuis l\'API', async () => {
        axios.get.mockResolvedValueOnce({ data: { utilisateurs: [{}, {}, {}] } });
        render(<App />);
        
        const countText = await screen.findByText(/Nombre d'utilisateurs inscrits en base de données : 3/i);
        expect(countText).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users'));
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
});

