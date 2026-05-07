import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App, { 
    calculateAge, 
    isAdult, 
    isValidZipCode, 
    isValidNameOrCity, 
    isValidEmail 
} from './App';

describe('Validation Utils in App', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-05-07T00:00:00Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('calculateAge', () => {
        it('should calculate the correct age when birthday has passed this year', () => {
            expect(calculateAge('2000-01-01')).toBe(24);
        });

        it('should calculate the correct age when birthday has not passed this year', () => {
            expect(calculateAge('2000-12-31')).toBe(23);
        });

        it('should calculate the correct age when birthday is today', () => {
            expect(calculateAge('2006-05-07')).toBe(18);
        });

        it('should return 0 if no date is provided', () => {
            expect(calculateAge('')).toBe(0);
            expect(calculateAge(null)).toBe(0);
            expect(calculateAge(undefined)).toBe(0);
        });

        it('should return 0 if invalid date is provided', () => {
            expect(calculateAge('not-a-date')).toBe(0);
        });
    });

    describe('isAdult', () => {
        it('should return true for age >= 18', () => {
            expect(isAdult('2000-01-01')).toBe(true);
            expect(isAdult('2006-05-07')).toBe(true);
        });

        it('should return false for age < 18', () => {
            expect(isAdult('2006-05-08')).toBe(false);
            expect(isAdult('2010-01-01')).toBe(false);
        });
    });

    describe('isValidZipCode', () => {
        it('should return true for exactly 5 digits', () => {
            expect(isValidZipCode('75001')).toBe(true);
        });

        it('should return false for incorrect lengths or non-digits', () => {
            expect(isValidZipCode('7500')).toBe(false);
            expect(isValidZipCode('750012')).toBe(false);
            expect(isValidZipCode('7500a')).toBe(false);
            expect(isValidZipCode('')).toBe(false);
        });
    });

    describe('isValidNameOrCity', () => {
        it('should return true for valid names/cities', () => {
            expect(isValidNameOrCity('Jean')).toBe(true);
            expect(isValidNameOrCity('Jean-Pierre')).toBe(true);
            expect(isValidNameOrCity('Hélène')).toBe(true);
            expect(isValidNameOrCity('L\'Haÿ-les-Roses')).toBe(true);
        });

        it('should return false for invalid characters or empty', () => {
            expect(isValidNameOrCity('Jean123')).toBe(false);
            expect(isValidNameOrCity('Jean@')).toBe(false);
            expect(isValidNameOrCity('   ')).toBe(false);
            expect(isValidNameOrCity('')).toBe(false);
            expect(isValidNameOrCity(null)).toBe(false);
            expect(isValidNameOrCity(undefined)).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
        });

        it('should return false for invalid emails', () => {
            expect(isValidEmail('test.example.com')).toBe(false);
            expect(isValidEmail('test@.com')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });
});

describe('App Component Registration', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-05-07T00:00:00Z'));
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

    it('should enable submit button only when all fields are filled', () => {
        render(<App />);
        const btn = screen.getByTestId('submit-btn');
        expect(btn).toBeDisabled();

        fillForm({
            nom: 'Doe',
            prenom: 'John',
            email: 'test@test.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '' 
        });
        expect(btn).toBeDisabled();

        fireEvent.change(screen.getByTestId('input-codePostal'), { target: { name: 'codePostal', value: '75001' } });
        expect(btn).not.toBeDisabled();
    });

    it('should display error messages for invalid fields on submit', () => {
        render(<App />);
        fillForm({
            nom: 'Doe123',
            prenom: 'John@',
            email: 'test',
            dateNaissance: '2010-01-01',
            ville: 'Paris 12',
            codePostal: '7500'
        });

        const btn = screen.getByTestId('submit-btn');
        fireEvent.click(btn);

        expect(screen.getByTestId('error-nom')).toBeInTheDocument();
        expect(screen.getByTestId('error-prenom')).toBeInTheDocument();
        expect(screen.getByTestId('error-email')).toBeInTheDocument();
        expect(screen.getByTestId('error-dateNaissance')).toBeInTheDocument();
        expect(screen.getByTestId('error-ville')).toBeInTheDocument();
        expect(screen.getByTestId('error-codePostal')).toBeInTheDocument();
    });

    it('should clear specific error message when user changes the input', () => {
        render(<App />);
        fillForm({
            nom: 'Doe123',
            prenom: 'John',
            email: 'test@test.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '75001'
        });

        fireEvent.click(screen.getByTestId('submit-btn'));
        expect(screen.getByTestId('error-nom')).toBeInTheDocument();

        fireEvent.change(screen.getByTestId('input-nom'), { target: { name: 'nom', value: 'Doe' } });
        expect(screen.queryByTestId('error-nom')).not.toBeInTheDocument();
    });

    it('should successfully submit form, show toaster, clear fields, and update list', () => {
        render(<App />);
        fillForm({
            nom: 'Doe',
            prenom: 'John',
            email: 'test@example.com',
            dateNaissance: '2000-01-01',
            ville: 'Paris',
            codePostal: '75001'
        });

        fireEvent.click(screen.getByTestId('submit-btn'));

        expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
        expect(screen.getByTestId('user-item-0')).toHaveTextContent('John Doe - Paris');

        expect(screen.getByTestId('input-nom')).toHaveValue('');

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
    });

    it('should load existing users from localStorage on mount', () => {
        localStorage.setItem('registeredUsers', JSON.stringify([{ nom: 'Smith', prenom: 'Jane', ville: 'Lyon' }]));
        render(<App />);
        expect(screen.getByTestId('user-item-0')).toHaveTextContent('Jane Smith - Lyon');
    });
});
