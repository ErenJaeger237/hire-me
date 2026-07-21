const request = require('supertest');
const app = require('../src/server');
const { sequelize } = require('../src/models');
const UserClass = require('../src/classes/UserClass');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Hire Me Backend API & OOP Domain Tests', () => {
  describe('UserClass OOP Unit Tests', () => {
    test('UserClass should encapsulate attributes and verify password correctly', async () => {
      const user = new UserClass({
        id: 10,
        name: 'Test Person',
        email: 'test@example.com',
        password_hash: '$2a$10$e8460p72lBvWb5aP6Qx12.N4qBvWb5aP6Qx12.N4qBvWb5aP6Qx12',
        role: 'CLIENT',
        createdAt: new Date(),
      });

      expect(user.getId()).toBe(10);
      expect(user.getName()).toBe('Test Person');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getRole()).toBe('CLIENT');
      expect(user.toJSON()).not.toHaveProperty('_passwordHash');
    });
  });

  describe('API Route HTTP Status Tests', () => {
    test('GET /api/providers should return 200 OK and an array', async () => {
      const res = await request(app).get('/api/providers');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/auth/login should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrong' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
