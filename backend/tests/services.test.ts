import { calculateEnvironmentalImpact } from '../src/services/impactCalculator';
import { recommendPartners } from '../src/services/matchingEngine';
import { transitionPickupStatus, isValidTransition } from '../src/services/pickupStateMachine';
import { retrieveRelevantKnowledge } from '../src/services/sustainabilityRAG';

describe('EcoSetu Core Services Unit Tests', () => {
  test('EPA WARM Environmental Impact Calculation', () => {
    const report = calculateEnvironmentalImpact({
      totalWasteDivertedKg: 1000,
      foodWasteDivertedKg: 500,
      plasticDivertedKg: 300,
      paperDivertedKg: 200
    });

    expect(report.methodology).toBe('EPA_WARM');
    expect(report.co2eAvoidedKg.value).toBe(1680); // (500*2.1) + (300*1.5) + (200*0.9) = 1050 + 450 + 180 = 1680
    expect(report.mealsRescued.value).toBe(150);
    expect(report.treesEquivalent.value).toBe(77.2);
  });

  test('Partner Matching Engine filters verified partners and sorts by score', () => {
    const matches = recommendPartners({
      locationName: 'Vijayawada',
      wasteTypes: ['food', 'plastic'],
      requestedQuantityKg: 500,
      serviceRadiusKm: 50
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].partner.verificationStatus).toBe('VERIFIED');
    expect(matches[0].matchScore).toBeGreaterThan(0.5);
  });

  test('Pickup State Machine enforces valid status transitions', () => {
    expect(isValidTransition('PENDING', 'ACCEPTED')).toBe(true);
    expect(isValidTransition('PENDING', 'COMPLETED')).toBe(false);

    const record = transitionPickupStatus('pkp_test_999', 'PENDING', 'test_user', 'Unit test init');
    expect(record.currentStatus).toBe('PENDING');

    const nextRecord = transitionPickupStatus('pkp_test_999', 'ACCEPTED', 'test_user', 'Accept pickup');
    expect(nextRecord.currentStatus).toBe('ACCEPTED');
  });

  test('Sustainability RAG Retriever returns relevant grounded passages', () => {
    const chunks = retrieveRelevantKnowledge('how to manage surplus leftover catering food', 2);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].category).toBe('FOOD_WASTE');
  });
});
