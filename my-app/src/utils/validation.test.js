import {
    calculateAge,
    isAdult,
    isValidZipCode,
    isValidNameOrCity,
    isValidEmail
} from './validation';

describe('Validation Utils', () => {
    beforeAll(() => {
        // Set fixed system time for consistent age calculation tests
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-05-07T00:00:00Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('calculateAge', () => {
        it('should calculate the correct age when birthday has passed this year', () => {
            // May 7th 2024 - birthday Jan 1st 2000 => 24
            expect(calculateAge('2000-01-01')).toBe(24);
        });

        it('should calculate the correct age when birthday has not passed this year', () => {
            // May 7th 2024 - birthday Dec 31st 2000 => 23
            expect(calculateAge('2000-12-31')).toBe(23);
        });

        it('should calculate the correct age when birthday is today', () => {
            // May 7th 2024 - birthday May 7th 2006 => 18
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
            expect(isAdult('2000-01-01')).toBe(true); // 24
            expect(isAdult('2006-05-07')).toBe(true); // 18
        });

        it('should return false for age < 18', () => {
            expect(isAdult('2006-05-08')).toBe(false); // 17 (tomorrow is their 18th)
            expect(isAdult('2010-01-01')).toBe(false); // 14
        });
    });

    describe('isValidZipCode', () => {
        it('should return true for exactly 5 digits', () => {
            expect(isValidZipCode('75001')).toBe(true);
            expect(isValidZipCode('01000')).toBe(true);
        });

        it('should return false for incorrect lengths or non-digits', () => {
            expect(isValidZipCode('7500')).toBe(false); // 4 digits
            expect(isValidZipCode('750012')).toBe(false); // 6 digits
            expect(isValidZipCode('7500a')).toBe(false); // contains letter
            expect(isValidZipCode('75 01')).toBe(false); // contains space
            expect(isValidZipCode('')).toBe(false); // empty
        });
    });

    describe('isValidNameOrCity', () => {
        it('should return true for valid names/cities', () => {
            expect(isValidNameOrCity('Jean')).toBe(true);
            expect(isValidNameOrCity('Jean-Pierre')).toBe(true);
            expect(isValidNameOrCity('Hélène')).toBe(true);
            expect(isValidNameOrCity('L\'Haÿ-les-Roses')).toBe(true);
            expect(isValidNameOrCity('Saint Étienne')).toBe(true);
            expect(isValidNameOrCity('François')).toBe(true);
        });

        it('should return false for invalid characters or empty', () => {
            expect(isValidNameOrCity('Jean123')).toBe(false); // contains numbers
            expect(isValidNameOrCity('Jean@')).toBe(false); // contains special char
            expect(isValidNameOrCity('   ')).toBe(false); // only spaces
            expect(isValidNameOrCity('')).toBe(false); // empty
            expect(isValidNameOrCity(null)).toBe(false);
            expect(isValidNameOrCity(undefined)).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('prenom.nom@domaine.fr')).toBe(true);
            expect(isValidEmail('a@b.co')).toBe(true);
        });

        it('should return false for invalid emails', () => {
            expect(isValidEmail('test.example.com')).toBe(false); // missing @
            expect(isValidEmail('test@example')).toBe(false); // missing extension
            expect(isValidEmail('test@.com')).toBe(false); // missing domain
            expect(isValidEmail('@example.com')).toBe(false); // missing local part
            expect(isValidEmail('')).toBe(false); // empty
            expect(isValidEmail(null)).toBe(false);
        });
    });
});
