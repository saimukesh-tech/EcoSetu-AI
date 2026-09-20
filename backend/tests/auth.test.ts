import request from 'supertest';
import app from '../src/app';

describe('Authentication & RBAC Middleware Integration Tests', () => {
  const originalEnv = process.env.ENABLE_DEMO_AUTH;

  beforeAll(() => {
    process.env.ENABLE_DEMO_AUTH = 'true';
    process.env.NODE_ENV = 'development';
  });

  afterAll(() => {
    process.env.ENABLE_DEMO_AUTH = originalEnv;
  });

  it('should reject unauthenticated requests to protected endpoints when demo auth is disabled', async () => {
    process.env.ENABLE_DEMO_AUTH = 'false';
    const response = await request(app)
      .post('/api/v1/waste/predict')
      .send({
        event_type: 'Wedding',
        guest_count: 500,
        duration: 5
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should allow valid demo organizer tokens in development mode', async () => {
    process.env.ENABLE_DEMO_AUTH = 'true';
    const response = await request(app)
      .post('/api/v1/waste/predict')
      .set('Authorization', 'Bearer demo_token_organizer')
      .send({
        event_type: 'Wedding',
        guest_count: 500,
        duration: 5
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should enforce Role-Based Access Control (RBAC) and reject unauthorized roles', async () => {
    process.env.ENABLE_DEMO_AUTH = 'true';
    // Pickup creation requires ORGANIZER or ADMIN role
    const response = await request(app)
      .post('/api/v1/pickup')
      .set('Authorization', 'Bearer demo_token_partner') // Partner role
      .send({
        eventId: 'evt_123',
        partnerId: 'partner_vjw_01',
        wasteTypes: ['organic'],
        estimatedQuantityKg: 100,
        scheduledTime: '2026-10-01T10:00:00Z',
        pickupAddress: 'Vijayawada'
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
