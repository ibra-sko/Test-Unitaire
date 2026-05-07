import { calculateAge } from "./module";
/**
 * @fuction calculateAge
 */
describe('caclculateAge Unite Test Suites', () => {
    it('should return a correct age', () => {
        const ibra = { birth: new Date("05/22/2004") };
        expect(calculateAge(ibra)).toEqual(21);
    });

    it('should throw a "missing param p" error', () => {
        expect(() => calculateAge()).toThrow("missing param p")
    });

    it('should throw a "missing argument p.birth" error', () => {
        const ibra = { birth: undefined };
        expect(() => calculateAge(ibra)).toThrow("missing argument p.birth")
    })

    it('should throw an error when the format date is incorrect', () => {
        const ibra = { birth: "invalid date" };
        expect(() => calculateAge(ibra)).toThrow("invalid date")
    });

    it('should throw an error when p is empty or null', () => {
        expect(() => calculateAge(null)).toThrow("missing param p");
        expect(() => calculateAge({})).toThrow("missing argument p.birth");
        const ibra = { birth: null };
        expect(() => calculateAge(ibra)).toThrow("missing argument p.birth");
    });

    it('should throw a error when p.birth is false', () => {
        const ibra = { birth: false };
        expect(() => calculateAge(ibra)).toThrow("missing argument p.birth");
    });

    it('should throw an error for a future date (if considered invalid) or invalid date object', () => {
        const ibra = { birth: new Date("invalid date") };
        expect(() => calculateAge(ibra)).toThrow("invalid date");
    });
});
