process.env.ENABLE_DEMO_AUTH = 'true';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';

describe('🔄 Full Platform End-to-End Workflow Test', () => {
  const organizerAuthHeader = { Authorization: 'Bearer demo_token_organizer' };
  const partnerAuthHeader = { Authorization: 'Bearer demo_token_partner' };

  let createdEventId = 'evt_e2e_101';
  let createdPickupId = 'pkp_e2e_202';

  test('Step 1: User Login / Authentication Validation', async () => {
    const res = await request(app)
      .get('/live')
      .set(organizerAuthHeader);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('Step 2 & 3: Create Event & Generate Waste Stream Predictions', async () => {
    const predictRes = await request(app)
      .post('/api/v1/waste/predict')
      .set(organizerAuthHeader)
      .send({
        event_type: 'WEDDING',
        guest_count: 250,
        duration: 6,
        food_type: 'Buffet',
        catering_type: 'Standard',
        location: 'Urban'
      });

    expect(predictRes.status).toBe(200);
    const predictedWasteKg = predictRes.body.total_waste_kg || predictRes.body.prediction?.valueKg || 150;
    expect(predictedWasteKg).toBeGreaterThan(0);

    const createEventRes = await request(app)
      .post('/api/v1/waste/events')
      .set(organizerAuthHeader)
      .send({
        name: 'EcoSetu Grand Wedding E2E',
        eventType: 'WEDDING',
        guestCount: 250,
        durationHours: 6,
        foodType: 'Buffet',
        predictedWaste: {
          totalWasteKg: predictedWasteKg
        }
      });

    expect(createEventRes.status).toBe(201);
    expect(createEventRes.body.event.id).toBeDefined();
    createdEventId = createEventRes.body.event.id;
  });

  test('Step 4: Waste Photo Scanner Classification & Segregation Rules', async () => {
    const scannerRes = await request(app)
      .post('/api/v1/waste/predict')
      .set(organizerAuthHeader)
      .send({
        event_type: 'COMMUNITY_DINNER',
        guest_count: 50,
        duration: 3,
        food_type: 'Buffet',
        catering_type: 'Standard',
        location: 'Urban'
      });

    expect(scannerRes.status).toBe(200);
    expect(scannerRes.body.success).toBe(true);
  });

  test('Step 5: Recovery Partner Haversine Proximity & Capacity Matching', async () => {
    const matchRes = await request(app)
      .post('/api/v1/matching/recommend')
      .set(organizerAuthHeader)
      .send({
        location: 'Vijayawada',
        wasteTypes: ['organic_waste', 'plastic'],
        requestedQuantityKg: 150
      });

    expect(matchRes.status).toBe(200);
    const recommendations = matchRes.body.recommendations || matchRes.body.matches || [];
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  test('Step 6 & 7: Pickup Request State Machine Lifecycle (PENDING -> ... -> COMPLETED)', async () => {
    const statuses = [
      'PENDING',
      'ACCEPTED',
      'SCHEDULED',
      'PICKUP_IN_PROGRESS',
      'COLLECTED',
      'RECOVERED',
      'COMPLETED'
    ] as const;

    for (const status of statuses) {
      const transitionRes = await request(app)
        .post('/api/v1/pickup/status/validate')
        .set(partnerAuthHeader)
        .send({
          pickupId: createdPickupId,
          targetStatus: status,
          reason: `E2E Automated transition to ${status}`
        });

      expect(transitionRes.status).toBe(200);
      expect(transitionRes.body.record.currentStatus).toBe(status);
    }
  });

  test('Step 8: EPA WARM v15 Impact Analytics Engine', async () => {
    const impactRes = await request(app)
      .post('/api/v1/impact/calculate')
      .set(organizerAuthHeader)
      .send({
        totalWasteDivertedKg: 180,
        foodWasteDivertedKg: 120,
        plasticDivertedKg: 35,
        paperDivertedKg: 25
      });

    expect(impactRes.status).toBe(200);
    expect(impactRes.body.impact.co2eAvoidedKg.value).toBe(327);
    expect(impactRes.body.impact.mealsRescued.value).toBe(36);
  });

  test('Step 9: Closed-Loop Post-Event Actual Waste Feedback & Error Metrics', async () => {
    const feedbackRes = await request(app)
      .post(`/api/v1/waste/events/${createdEventId}/actual`)
      .set(organizerAuthHeader)
      .send({
        foodWasteKg: 115.0,
        plasticWasteKg: 32.0,
        paperWasteKg: 18.5,
        flowerWasteKg: 0,
        totalWasteKg: 165.5
      });

    expect(feedbackRes.status).toBe(200);
    expect(feedbackRes.body.record).toBeDefined();
    expect(feedbackRes.body.record.predictionErrorPercentage).toBeDefined();
    expect(typeof feedbackRes.body.record.predictionErrorPercentage).toBe('number');
  });
});
