/**
 * Calcule l'âge à partir d'une date de naissance (format YYYY-MM-DD).
 * @param {string} dateOfBirth 
 * @returns {number} l'âge en années
 */
export const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    if (isNaN(dob.getTime())) return 0;

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

/**
 * Vérifie si l'âge calculé est supérieur ou égal à 18.
 * @param {string} dateOfBirth 
 * @returns {boolean}
 */
export const isAdult = (dateOfBirth) => {
    return calculateAge(dateOfBirth) >= 18;
};

/**
 * Vérifie le format du code postal français (exactement 5 chiffres).
 * @param {string} zipCode 
 * @returns {boolean}
 */
export const isValidZipCode = (zipCode) => {
    const regex = /^\d{5}$/;
    return regex.test(zipCode);
};

/**
 * Vérifie le format du nom, prénom ou de la ville.
 * Autorise les lettres, espaces, accents, trémas, tirets, apostrophes.
 * N'autorise pas les chiffres ni les caractères spéciaux (type @, #, etc.).
 * @param {string} str 
 * @returns {boolean}
 */
export const isValidNameOrCity = (str) => {
    if (!str || str.trim() === '') return false;
    const regex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return regex.test(str);
};

/**
 * Vérifie si le format de l'email est valide.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    // Regex standard pour validation basique d'email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
