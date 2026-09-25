import request from 'supertest';
import app from '../src/app';

describe('CORS Strict Origin Enforcement Security Tests', () => {
  it('should allow requests from whitelisted origins', async () => {
    const res = await request(app)
      .get('/live')
      .set('Origin', 'https://ecosetu-ai.vercel.app');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://ecosetu-ai.vercel.app');
  });

  it('should reject requests from unwhitelisted / malicious origins', async () => {
    const res = await request(app)
      .get('/live')
      .set('Origin', 'https://malicious-attacker-domain.com');

    // Express CORS middleware returns error or omits Access-Control-Allow-Origin header
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
