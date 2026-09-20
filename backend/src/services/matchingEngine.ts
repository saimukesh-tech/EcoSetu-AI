export interface PartnerProfile {
  id: string;
  name: string;
  acceptedWasteTypes: string[];
  capacityKg: number;
  availableCapacityKg: number;
  location: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  isAvailable: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'UNDER_REVIEW' | 'SUSPENDED';
  rating: number;
  contactEmail: string;
  contactPhone: string;
}

export interface MatchRequest {
  eventId?: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  wasteTypes: string[];
  requestedQuantityKg: number;
  serviceRadiusKm?: number;
}

export interface RecommendedMatch {
  partnerId: string;
  partnerName: string;
  matchScore: number;
  distanceKm?: number;
  reasons: string[];
  partner: PartnerProfile;
}

// Sample Verified Recovery Partners with geospatial coordinates
const samplePartners: PartnerProfile[] = [
  {
    id: 'partner_vjw_01',
    name: 'Vijayawada EcoRecycle Unit',
    acceptedWasteTypes: ['food', 'organic', 'plastic', 'paper'],
    capacityKg: 1500,
    availableCapacityKg: 1200,
    location: 'Vijayawada Central',
    latitude: 16.5062,
    longitude: 80.6480,
    serviceRadiusKm: 50,
    isAvailable: true,
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    contactEmail: 'pickup@vjw-ecorecycle.in',
    contactPhone: '+91-9876543210'
  },
  {
    id: 'partner_gnt_02',
    name: 'Guntur Green Bio-Composting',
    acceptedWasteTypes: ['food', 'organic', 'floral'],
    capacityKg: 2500,
    availableCapacityKg: 1800,
    location: 'Guntur Industrial Zone',
    latitude: 16.3067,
    longitude: 80.4365,
    serviceRadiusKm: 60,
    isAvailable: true,
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    contactEmail: 'info@gntbiocompost.org',
    contactPhone: '+91-9876543211'
  },
  {
    id: 'partner_hyd_03',
    name: 'Hyderabad Urban Material Recovery Facility',
    acceptedWasteTypes: ['plastic', 'paper', 'cardboard', 'metal', 'textile'],
    capacityKg: 5000,
    availableCapacityKg: 4200,
    location: 'Hyderabad Kukatpally',
    latitude: 17.4849,
    longitude: 78.4138,
    serviceRadiusKm: 100,
    isAvailable: true,
    verificationStatus: 'VERIFIED',
    rating: 4.7,
    contactEmail: 'dispatch@hydmrf.co.in',
    contactPhone: '+91-9876543212'
  }
];

// Haversine Formula for exact spherical distance calculation in kilometers
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function recommendPartners(req: MatchRequest): RecommendedMatch[] {
  // Default coordinates to Vijayawada center if not provided
  const eventLat = req.latitude ?? 16.5062;
  const eventLon = req.longitude ?? 80.6480;
  const maxRadiusKm = req.serviceRadiusKm ?? 50;

  const matches: RecommendedMatch[] = [];

  for (const partner of samplePartners) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Waste Compatibility (35% weight)
    const matchingTypes = req.wasteTypes.filter(wt =>
      partner.acceptedWasteTypes.some(pwt => pwt.toLowerCase() === wt.toLowerCase())
    );
    const typeCompatRatio = req.wasteTypes.length > 0 ? matchingTypes.length / req.wasteTypes.length : 0;
    const typeScore = typeCompatRatio * 0.35;
    score += typeScore;
    if (matchingTypes.length > 0) {
      reasons.push(`Accepts ${matchingTypes.join(', ')} waste`);
    }

    // 2. Capacity Check (25% weight)
    const hasCapacity = partner.availableCapacityKg >= req.requestedQuantityKg;
    if (hasCapacity) {
      score += 0.25;
      reasons.push(`Has capacity (${partner.availableCapacityKg} kg available vs ${req.requestedQuantityKg} kg requested)`);
    } else {
      const capRatio = partner.availableCapacityKg / req.requestedQuantityKg;
      score += capRatio * 0.15;
      reasons.push(`Partial capacity (${partner.availableCapacityKg} kg available)`);
    }

    // 3. Proximity Distance via Haversine Formula (20% weight)
    const distanceKm = calculateHaversineDistanceKm(eventLat, eventLon, partner.latitude, partner.longitude);
    if (distanceKm <= maxRadiusKm) {
      const distanceScore = Math.max(0, (1 - distanceKm / maxRadiusKm)) * 0.20;
      score += distanceScore;
      reasons.push(`Located ${distanceKm} km away (within ${maxRadiusKm} km service radius)`);
    } else {
      reasons.push(`Outside optimal radius (${distanceKm} km away)`);
    }

    // 4. Real-time Availability (10% weight)
    if (partner.isAvailable) {
      score += 0.10;
      reasons.push('Available for immediate pickup scheduling');
    }

    // 5. Verification Status (10% weight)
    if (partner.verificationStatus === 'VERIFIED') {
      score += 0.10;
      reasons.push('Verified EcoSetu recovery partner');
    }

    const roundedScore = Math.round(score * 100) / 100;

    if (roundedScore > 0.2) {
      matches.push({
        partnerId: partner.id,
        partnerName: partner.name,
        matchScore: roundedScore,
        distanceKm,
        reasons,
        partner
      });
    }
  }

  // Sort by highest match score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
