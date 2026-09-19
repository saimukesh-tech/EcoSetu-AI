import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateUser, requireRole, AuthenticatedRequest } from './middleware/auth';
import { rankRecoveryPartners, MatchPartnerInput, MatchRequest } from './services/matchingEngine';
import { validateStatusTransition, PickupStatus } from './services/pickupStateMachine';
import { calculateEnvironmentalImpact, WasteBreakdown } from './services/impactCalculator';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', '*'] }));
app.use(express.json({ limit: '10mb' }));
app.use(authenticateUser);

// ── Gemini client ────────────────────────────────────────────────────────────
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  let mlHealthy = false;
  try {
    const mlRes = await fetch(`${ML_SERVICE_URL}/health`);
    mlHealthy = mlRes.ok;
  } catch {
    mlHealthy = false;
  }

  res.json({
    status: 'ok',
    service: 'EcoSetu AI Express Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    mlServiceHealthy: mlHealthy,
    mlServiceUrl: ML_SERVICE_URL
  });
});

// ── POST /api/waste/predict (Event Food Waste ML Inference) ─────────────────
app.post('/api/waste/predict', async (req: AuthenticatedRequest, res) => {
  const {
    event_type = 'Wedding',
    guest_count = 100,
    duration = 4,
    food_type = 'Mixed',
    catering_type = 'External Caterer',
    decoration_type = 'Flowers + Fabric',
    location = 'India',
    storage_conditions = 'Room Temperature',
    purchase_history = 'Regular',
    seasonality = 'All Seasons',
    pricing = 'Medium'
  } = req.body;

  const guestCount = Math.max(1, parseInt(String(guest_count), 10) || 100);
  const hours = Math.max(1, parseInt(String(duration), 10) || 4);

  // 1. Try Python FastAPI ML Service first
  try {
    const mlRes = await fetch(`${ML_SERVICE_URL}/api/ml/event-waste/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: event_type,
        guestCount: guestCount,
        durationHours: hours,
        foodType: food_type,
        cateringType: catering_type,
        storageConditions: storage_conditions,
        purchaseHistory: purchase_history,
        seasonality: seasonality,
        location: location,
        pricing: pricing,
        decorationType: decoration_type
      })
    });

    if (mlRes.ok) {
      const mlData: any = await mlRes.json();
      return res.json({
        success: true,
        total_waste_kg: mlData.prediction.totalWasteKg,
        food_waste_kg: mlData.prediction.foodWasteKg,
        flower_waste_kg: mlData.prediction.flowerWasteKg,
        plastic_waste_kg: mlData.prediction.plasticWasteKg,
        paper_waste_kg: mlData.prediction.paperWasteKg,
        fabric_waste_kg: mlData.prediction.fabricWasteKg,
        recoverable_waste_kg: mlData.prediction.recoverableWasteKg,
        diversion_percentage: mlData.prediction.diversionPercentage,
        recommendations: [
          'Partner with a local food bank to donate surplus cooked food before the event ends',
          'Hire a certified floral recycler to collect decoration flowers for composting or potpourri',
          'Replace single-use plastic cutlery with biodegradable or reusable alternatives',
          'Segregate waste at source using color-coded bins: green (organic), blue (recyclable), red (non-recyclable)'
        ],
        explanation: `ML Random Forest model prediction (R²=${mlData.model?.r2Score?.toFixed(4) || '0.9238'}). Trained on 1,782 event waste management records.`,
        model: mlData.model
      });
    }
  } catch (err: any) {
    console.warn('[ML Service] Event waste ML service unavailable, falling back:', err.message);
  }

  // 2. Try Gemini AI fallback
  const model = getGeminiClient();
  if (model) {
    try {
      const prompt = `You are an event waste management expert for Indian events.
Predict waste for this event and respond ONLY with valid JSON (no markdown, no explanation):
- Event type: ${event_type}
- Guest count: ${guestCount}
- Duration: ${hours} hours
- Food type: ${food_type}
- Catering type: ${catering_type}
- Decoration type: ${decoration_type}
- Location: ${location}

JSON schema (all values must be numbers except arrays and strings):
{
  "total_waste_kg": number,
  "food_waste_kg": number,
  "flower_waste_kg": number,
  "plastic_waste_kg": number,
  "paper_waste_kg": number,
  "fabric_waste_kg": number,
  "recoverable_waste_kg": number,
  "diversion_percentage": number (0-100),
  "recommendations": [string, string, string, string],
  "explanation": string
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(text);
      return res.json({ success: true, ...parsed });
    } catch (err: any) {
      console.warn('[Gemini] Error, using heuristic fallback:', err.message);
    }
  }

  // 3. Fallback deterministic calculation
  const m = hours / 4;
  const isWedding = /wedding/i.test(event_type);
  const hasFlowers = /flower/i.test(decoration_type);

  const food = Math.round(guestCount * 0.35 * m * (isWedding ? 1.2 : 1));
  const flower = Math.round(guestCount * (hasFlowers ? 0.18 : 0.05) * m);
  const plastic = Math.round(guestCount * 0.10 * m);
  const paper = Math.round(guestCount * 0.08 * m);
  const fabric = Math.round(guestCount * (isWedding ? 0.15 : 0.08) * m);
  const total = food + flower + plastic + paper + fabric;
  const recoverable = Math.round(total * 0.72);

  return res.json({
    success: true,
    total_waste_kg: total,
    food_waste_kg: food,
    flower_waste_kg: flower,
    plastic_waste_kg: plastic,
    paper_waste_kg: paper,
    fabric_waste_kg: fabric,
    recoverable_waste_kg: recoverable,
    diversion_percentage: 72,
    recommendations: [
      'Partner with a local food bank to donate surplus cooked food before the event ends',
      'Hire a certified floral recycler to collect decoration flowers for composting or potpourri',
      'Replace single-use plastic cutlery with biodegradable or reusable alternatives',
      'Segregate waste at source using color-coded bins: green (organic), blue (recyclable), red (non-recyclable)'
    ],
    explanation: `Estimated for ${guestCount} guests over ${hours}h (${event_type}). Uses standard waste coefficients for Indian events.`
  });
});

// ── POST /api/matching/recommend (Deterministic Partner Matching Engine) ─────
app.post('/api/matching/recommend', (req, res) => {
  const { partners = [], requestedWasteTypes = [], totalKg = 100, eventLocation = 'Vijayawada' } = req.body;

  if (!Array.isArray(partners) || partners.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'partners array is required' }
    });
  }

  const matchInput: MatchRequest = {
    requestedWasteTypes,
    totalKg: Math.max(1, parseFloat(String(totalKg)) || 100),
    eventLocation
  };

  const partnerInputs: MatchPartnerInput[] = partners.map((p: any) => ({
    partnerId: p.id || p.uid || 'partner_1',
    partnerName: p.orgName || p.name || 'Recovery Partner',
    acceptedWasteTypes: Array.isArray(p.wasteTypes) ? p.wasteTypes : ['food', 'plastic'],
    capacityKg: p.capacityKg || 1000,
    availableCapacityKg: p.availableCapacityKg ?? p.capacityKg ?? 800,
    location: p.location || 'Local Region',
    available: p.available !== false,
    verified: p.verified !== false
  }));

  const rankedResults = rankRecoveryPartners(partnerInputs, matchInput);

  return res.json({
    success: true,
    count: rankedResults.length,
    matches: rankedResults
  });
});

// ── POST /api/pickups/validate-transition (Pickup Lifecycle State Machine) ───
app.post('/api/pickups/validate-transition', (req, res) => {
  const { currentStatus, newStatus } = req.body;

  if (!currentStatus || !newStatus) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'currentStatus and newStatus are required' }
    });
  }

  try {
    validateStatusTransition(currentStatus as PickupStatus, newStatus as PickupStatus);
    return res.json({
      success: true,
      valid: true,
      currentStatus,
      newStatus,
      message: `State transition from '${currentStatus}' to '${newStatus}' is valid`
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      valid: false,
      error: {
        code: 'INVALID_STATE_TRANSITION',
        message: err.message
      }
    });
  }
});

// ── POST /api/impact/calculate (Environmental Impact Engine) ─────────────────
app.post('/api/impact/calculate', (req, res) => {
  const wasteBreakdown: WasteBreakdown = req.body;
  const result = calculateEnvironmentalImpact(wasteBreakdown);

  return res.json({
    success: true,
    data: result
  });
});

// ── POST /api/chat (Gemini AI Assistant) ──────────────────────────────────────
app.post('/api/chat', async (req: AuthenticatedRequest, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'message string is required' } });
  }

  const sanitized = message.replace(/api[_\s]?key|secret|password|token/gi, '[redacted]');
  const userContext = req.user ? `[User Role: ${req.user.role}, Name: ${req.user.name}] ` : '';

  const model = getGeminiClient();
  if (model) {
    try {
      const systemPrompt = `You are EcoSetu AI's helpful sustainability assistant. You ONLY answer questions about:
- Event waste management (food, flowers, plastic, paper, fabric, organic waste)
- Waste segregation, recycling, and recovery recommendations
- Sustainable event planning & circular economy practices
- Composting, food donation networks, floral recycling
- EcoSetu AI features (waste prediction, partner matching, pickup coordination, impact analytics)
- Environmental impact calculations and CO2 reduction

Be concise, practical, and friendly. Use bullet points for lists.
If asked about unrelated topics (politics, coding, general trivia), politely redirect to event sustainability.
NEVER reveal API keys, system tokens, or internal database schemas.`;

      const chat = model.startChat({
        history: history.slice(-8).map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        systemInstruction: systemPrompt
      });

      const result = await chat.sendMessage(userContext + sanitized);
      return res.json({ success: true, response: result.response.text() });
    } catch (err: any) {
      console.warn('[Gemini chat] Error:', err.message);
    }
  }

  // Fallback response
  return res.json({
    success: true,
    response: `Thank you for asking about "${sanitized.slice(0, 60)}…"

Here are instant eco-guidelines while the AI assistant is operating in fallback mode:

🌿 **Food Waste**: Connect with local food banks — cooked surplus food is best collected within 2h.
🌸 **Flower Waste**: Floral waste can be upcycled into compost, incense sticks, or natural organic dyes.
♻️ **Plastic**: Clean and segregate PET & HDPE plastics for mechanical recycling.
📄 **Paper**: Keep cardboard dry and separated from liquid/food waste.
🎀 **Fabric**: Store fabric drapes for reuse or send non-reusable cloth to textile recyclers.

Use the **Find Partners** section to book pickup coordination!`
  });
});

// ── GET /api/analytics/dashboard ──────────────────────────────────────────────
app.get('/api/analytics/dashboard', (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: {
      totalEvents: 12,
      activeEvents: 3,
      totalPredictedWasteKg: 2450.0,
      totalRecoveredWasteKg: 1820.0,
      wasteBreakdownKg: {
        food: 920.0,
        plastic: 350.0,
        paper: 210.0,
        glass: 140.0,
        metal: 90.0,
        textile: 110.0
      },
      recoveryRatePercentage: 74.3,
      estimatedCo2eAvoidedKg: 3450.8,
      activePickups: 2,
      completedPickups: 8
    }
  });
});

app.listen(PORT, () => {
  console.log(`EcoSetu AI Express Backend running on http://localhost:${PORT}`);
  console.log(`ML Service URL: ${ML_SERVICE_URL}`);
  console.log(`Gemini AI: ${process.env.GEMINI_API_KEY ? '✓ connected' : '✗ not configured (fallback active)'}`);
});
