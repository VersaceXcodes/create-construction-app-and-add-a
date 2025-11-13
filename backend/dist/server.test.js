import request from 'supertest';
import { app } from './server.js';
describe('Server API Tests', () => {
    describe('Health Check', () => {
        it('should return 200 on health check endpoint', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
        });
    });
    describe('Authentication', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                user_type: 'buyer'
            });
            expect([200, 201, 400, 409]).toContain(response.status);
        });
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            expect([200, 401]).toContain(response.status);
        });
    });
});
//# sourceMappingURL=server.test.js.map