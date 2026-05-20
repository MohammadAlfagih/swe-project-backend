import request from "supertest";
import app from "../src/app";

// Set environment to test for rate limiter rules
process.env.NODE_ENV = "test";

describe("Non-Functional Tests: Security and Performance", () => {
    test("Health Check: System should be up and running", async () => {
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("OK");
    });

    test("Security: Helmet should add security headers", async () => {
        const response = await request(app).get("/health");
        // Helmet hides the "X-Powered-By: Express" header for security
        expect(response.headers["x-powered-by"]).toBeUndefined();
        // Helmet adds Content-Security-Policy
        expect(response.headers["content-security-policy"]).toBeDefined();
    });

    test("Performance/Security: Rate Limiter should block excessive requests", async () => {
        // We set max limit to 5 in test environment
        for (let i = 0; i < 5; i++) {
            await request(app).get("/health");
        }
        
        // The 6th request should be blocked
        const response = await request(app).get("/health");
        expect(response.status).toBe(429); // 429 Too Many Requests
    });
});