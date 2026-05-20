import { 
    isValidUniversityEmail, 
    isValidPassword, 
    isValidSaudiPhone, 
    isValidPassengerCount 
} from "../src/utils/validation";

describe("Functional Tests: System Validation Rules", () => {
    test("Should accept valid Saudi university email", () => {
        expect(isValidUniversityEmail("student@ksu.edu.sa")).toBe(true);
    });

    test("Should reject non-university email", () => {
        expect(isValidUniversityEmail("student@gmail.com")).toBe(false);
    });

    test("Should accept password with 8 or more characters", () => {
        expect(isValidPassword("StrongPass123")).toBe(true);
    });

    test("Should reject short password", () => {
        expect(isValidPassword("1234567")).toBe(false);
    });

    test("Should accept valid Saudi phone number", () => {
        expect(isValidSaudiPhone("+966501234567")).toBe(true);
        expect(isValidSaudiPhone("0501234567")).toBe(true);
    });

    test("Should accept passenger count between 1 and 4", () => {
        expect(isValidPassengerCount(3)).toBe(true);
        expect(isValidPassengerCount(1)).toBe(true);
        expect(isValidPassengerCount(4)).toBe(true);
    });

    test("Should reject invalid passenger count", () => {
        expect(isValidPassengerCount(5)).toBe(false);
        expect(isValidPassengerCount(0)).toBe(false);
    });
});