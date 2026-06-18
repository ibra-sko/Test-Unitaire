import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Registration from './Registration';
import axios from 'axios';

jest.mock('axios');

describe('Registration Component', () => {
    beforeEach(() => {
        // Clear local storage and timers before each test
        localStorage.clear();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-05-07T00:00:00Z'));
        axios.post.mockResolvedValue({ data: {} });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    const fillForm = (data) => {
        fireEvent.change(screen.getByTestId('input-nom'), { target: { name: 'nom', value: data.nom } });
        fireEvent.change(screen.getByTestId('input-prenom'), { target: { name: 'prenom', value: data.prenom } });
        fireEvent.change(screen.getByTestId('input-email'), { target: { name: 'email', value: data.email } });
        fireEvent.change(screen.getByTestId('input-dateNaissance'), { target: { name: 'dateNaissance', value: data.dateNaissance } });
        fireEvent.change(screen.getByTestId('input-ville'), { target: { name: 'ville', value: data.ville } });
        fireEvent.change(screen.getByTestId('input-codePostal'), { target: { name: 'codePostal', value: data.codePostal } });
    };

    it('should render all form fields with the submit button disabled initially', () => {
        render(<Registration />);
        expect(screen.getByTestId('input-nom')).toBeInTheDocument();
        expect(screen.getByTestId('input-prenom')).toBeInTheDocument();
        expect(screen.getByTestId('input-email')).toBeInTheDocument();
        expect(screen.getByTestId('input-dateNaissance')).toBeInTheDocument();
        expect(screen.getByTestId('input-ville')).toBeInTheDocument();
        expect(screen.getByTestId('input-codePostal')).toBeInTheDocument();
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('should enable submit button only when all fields are filled', () => {
        render(<Registration />);
        const btn = screen.getByTestId('submit-btn');
        expect(btn).toBeDisabled();

        fillForm({
            nom: 'Doe',
            prenom: 'John',
            email: 'test@test.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '' // One missing
        });
        expect(btn).toBeDisabled();

        fireEvent.change(screen.getByTestId('input-codePostal'), { target: { name: 'codePostal', value: '75001' } });
        expect(btn).not.toBeDisabled();
    });

    it('should display error messages for invalid fields on submit', async () => {
        render(<Registration />);
        fillForm({
            nom: 'Doe123', // invalid
            prenom: 'John@', // invalid
            email: 'test', // invalid
            dateNaissance: '2010-01-01', // < 18
            ville: 'Paris 12', // invalid
            codePostal: '7500' // invalid
        });

        const btn = screen.getByTestId('submit-btn');
        expect(btn).not.toBeDisabled();
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(screen.getByTestId('error-nom')).toHaveTextContent("Format du nom invalide");
        expect(screen.getByTestId('error-prenom')).toHaveTextContent("Format du prénom invalide");
        expect(screen.getByTestId('error-email')).toHaveTextContent("Format de l'email invalide");
        expect(screen.getByTestId('error-dateNaissance')).toHaveTextContent("Vous devez avoir au moins 18 ans");
        expect(screen.getByTestId('error-ville')).toHaveTextContent("Format de la ville invalide");
        expect(screen.getByTestId('error-codePostal')).toHaveTextContent("Le code postal doit contenir exactement 5 chiffres");
    });

    it('should clear specific error message when user changes the input', async () => {
        render(<Registration />);
        fillForm({
            nom: 'Doe123',
            prenom: 'John',
            email: 'test@test.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '75001'
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('submit-btn'));
        });
        expect(screen.getByTestId('error-nom')).toBeInTheDocument();

        // Change nom to clear error
        fireEvent.change(screen.getByTestId('input-nom'), { target: { name: 'nom', value: 'Doe' } });
        expect(screen.queryByTestId('error-nom')).not.toBeInTheDocument();
    });

    it('should submit form via API, call onUserAdded, show toaster, and clear fields', async () => {
        const onUserAdded = jest.fn();
        render(<Registration onUserAdded={onUserAdded} />);
        fillForm({
            nom: 'Doe',
            prenom: 'John',
            email: 'test@example.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '75001'
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('submit-btn'));
        });

        // Toaster should appear
        expect(screen.getByTestId('success-toaster')).toBeInTheDocument();

        // The API should have been called and the parent notified
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/users'),
            expect.objectContaining({ nom: 'Doe', prenom: 'John', ville: 'Paris' })
        );
        expect(onUserAdded).toHaveBeenCalled();

        // Form fields should be cleared
        expect(screen.getByTestId('input-nom')).toHaveValue('');
        expect(screen.getByTestId('input-prenom')).toHaveValue('');

        // Fast forward time to make toaster disappear
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
    });

    it('se soumet sans erreur même si onUserAdded n\'est pas fourni', async () => {
        render(<Registration />);
        fillForm({
            nom: 'Doe',
            prenom: 'John',
            email: 'test@example.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '75001'
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('submit-btn'));
        });

        expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
    });

    it('affiche une erreur sur le champ email si l\'API renvoie un statut 400', async () => {
        axios.post.mockRejectedValueOnce({ response: { status: 400, data: { detail: 'Cet email est déjà utilisé' } } });
        render(<Registration onUserAdded={jest.fn()} />);
        fillForm({
            nom: 'Doe',
            prenom: 'John',
            email: 'doublon@example.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '75001'
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('submit-btn'));
        });

        expect(screen.getByTestId('error-email')).toHaveTextContent('Cet email est déjà utilisé');
        expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
    });

    it('logue l\'erreur si l\'API échoue avec une autre erreur', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        axios.post.mockRejectedValueOnce(new Error('Server down'));
        render(<Registration onUserAdded={jest.fn()} />);
        fillForm({
            nom: 'Doe',
            prenom: 'John',
            email: 'test@example.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '75001'
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('submit-btn'));
        });

        expect(consoleSpy).toHaveBeenCalledWith('Erreur API:', expect.any(Error));
        consoleSpy.mockRestore();
    });
});
