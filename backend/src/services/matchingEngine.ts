export interface MatchPartnerInput {
  partnerId: string;
  partnerName: string;
  acceptedWasteTypes: string[];
  capacityKg: number;
  availableCapacityKg: number;
  location: string;
  available: boolean;
  verified: boolean;
}

export interface MatchRequest {
  requestedWasteTypes: string[];
  totalKg: number;
  eventLocation?: string;
}

export interface PartnerMatchResult {
  partnerId: string;
  partnerName: string;
  matchScore: number;
  compatibilityPercentage: number;
  reasons: string[];
  partner: MatchPartnerInput;
}

export function computePartnerMatchScore(
  partner: MatchPartnerInput,
  req: MatchRequest
): PartnerMatchResult {
  const reasons: string[] = [];
  let score = 0.0;

  // 1. Waste Type Compatibility (Max 0.40)
  const reqTypes = req.requestedWasteTypes.map(t => t.toLowerCase());
  const partnerTypes = partner.acceptedWasteTypes.map(t => t.toLowerCase());

  const matchedTypes = reqTypes.filter(t =>
    partnerTypes.some(pt => pt.includes(t) || t.includes(pt))
  );

  const wasteTypeRatio = reqTypes.length > 0 ? matchedTypes.length / reqTypes.length : 1.0;
  const wasteScore = wasteTypeRatio * 0.40;
  score += wasteScore;

  if (matchedTypes.length > 0) {
    reasons.push(`Accepts ${matchedTypes.join(', ')} waste`);
  } else {
    reasons.push(`Does not accept requested waste categories`);
  }

  // 2. Available Capacity (Max 0.30)
  if (partner.availableCapacityKg >= req.totalKg) {
    score += 0.30;
    reasons.push(`Has sufficient capacity (${partner.availableCapacityKg} kg available vs ${req.totalKg} kg requested)`);
  } else if (partner.availableCapacityKg > 0) {
    const capRatio = partner.availableCapacityKg / req.totalKg;
    score += capRatio * 0.30;
    reasons.push(`Partial capacity available (${partner.availableCapacityKg} kg of ${req.totalKg} kg)`);
  } else {
    reasons.push(`Currently at maximum capacity`);
  }

  // 3. Availability Status (Max 0.15)
  if (partner.available) {
    score += 0.15;
    reasons.push(`Currently available for immediate pickup scheduling`);
  } else {
    reasons.push(`Currently unavailable for new pickups`);
  }

  // 4. Verification Status (Max 0.15)
  if (partner.verified) {
    score += 0.15;
    reasons.push(`Verified EcoSetu recovery partner`);
  } else {
    reasons.push(`Pending partner verification`);
  }

  const finalScore = Math.min(1.0, Math.max(0.0, Math.round(score * 100) / 100));

  return {
    partnerId: partner.partnerId,
    partnerName: partner.partnerName,
    matchScore: finalScore,
    compatibilityPercentage: Math.round(finalScore * 100),
    reasons,
    partner
  };
}

export function rankRecoveryPartners(
  partners: MatchPartnerInput[],
  req: MatchRequest
): PartnerMatchResult[] {
  return partners
    .map(p => computePartnerMatchScore(p, req))
    .sort((a, b) => b.matchScore - a.matchScore);
}
