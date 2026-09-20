import request from 'supertest';
import app from '../src/app';

describe('Security Headers, Zod Validation, & Health Endpoint Tests', () => {
  beforeAll(() => {
    process.env.ENABLE_DEMO_AUTH = 'true';
  });

  it('should return 200 on /live liveness check', async () => {
    const response = await request(app).get('/live');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('should attach X-Request-ID header to every response', async () => {
    const response = await request(app).get('/live');
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.headers['x-request-id']).toMatch(/^req_/);
  });

  it('should reject malformed payloads with 400 Validation Error (Zod)', async () => {
    const response = await request(app)
      .post('/api/v1/waste/predict')
      .set('Authorization', 'Bearer demo_token_organizer')
      .send({
        event_type: '', // Empty string violates min(1) constraint
        guest_count: -50 // Negative guest count violates min(1) constraint
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
