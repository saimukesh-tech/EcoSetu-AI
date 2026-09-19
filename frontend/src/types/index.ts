export type UserRole = 'ORGANIZER' | 'RECOVERY_PARTNER';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: UserRole;
  createdAt: any;
  updatedAt: any;
}

export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  guestCount: number;
  duration: number;
  foodType: string;
  cateringType: string;
  decorationType: string;
  organizerUid: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  wastePredictionId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface WastePrediction {
  id: string;
  uid: string;
  eventId?: string;
  input: {
    event_type: string;
    guest_count: number;
    duration: number;
    food_type: string;
    catering_type: string;
    decoration_type: string;
    location: string;
  };
  result: WastePredictionResult;
  createdAt: any;
}

export interface WastePredictionResult {
  total_waste_kg: number;
  food_waste_kg: number;
  flower_waste_kg: number;
  plastic_waste_kg: number;
  paper_waste_kg: number;
  fabric_waste_kg: number;
  recoverable_waste_kg: number;
  diversion_percentage: number;
  recommendations: string[];
  explanation: string;
}

export interface PickupRequest {
  id: string;
  eventId: string;
  organizerUid: string;
  partnerUid?: string;
  wasteTypes: string[];
  totalKg: number;
  pickupDate: string;
  pickupAddress: string;
  status: 'PENDING' | 'MATCHED' | 'ACCEPTED' | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface ImpactRecord {
  id: string;
  uid: string;
  eventId?: string;
  wasteKgDiverted: number;
  co2Saved: number;
  mealsRescued?: number;
  treesEquivalent?: number;
  createdAt: any;
}

export interface Notification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: any;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sessionId?: string;
  uid?: string;
  createdAt?: any;
}

export interface RecoveryPartner {
  id: string;
  uid: string;
  orgName: string;
  wasteTypes: string[];
  capacityKg: number;
  location: string;
  lat?: number;
  lng?: number;
  available: boolean;
  verified: boolean;
  isDemo?: boolean;
}
