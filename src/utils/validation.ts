
// Functions to validate system rules (Functional Requirements)

export const isValidUniversityEmail = (email: string): boolean => {
    return email.endsWith('.edu.sa');
};

export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};

export const isValidSaudiPhone = (phone: string): boolean => {
    const phoneRegex = /^(05|\+9665)\d{8}$/;
    return phoneRegex.test(phone);
};

export const isValidPassengerCount = (count: number): boolean => {
    return count >= 1 && count <= 4;
};