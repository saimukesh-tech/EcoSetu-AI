import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIGatewayRequest {
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

export interface AIGatewayResponse {
  reply: string;
  telemetry: {
    model: string;
    promptVersion: string;
    latencyMs: number;
    fallbackUsed: boolean;
    promptInjectionDetected: boolean;
  };
}

// Prompt Injection Detection patterns (OWASP AISVS Compliance)
const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /disregard (the )?above/i,
  /you are now an? (unrestricted|evil|admin)/i,
  /system prompt override/i,
  /reveal your (system )?instructions/i,
  /print your (initial )?prompt/i
];

export function detectPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

export async function processAIChatRequest(req: AIGatewayRequest): Promise<AIGatewayResponse> {
  const start = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Prompt Injection Security Check
  if (detectPromptInjection(req.message)) {
    console.warn(JSON.stringify({
      type: 'SECURITY_ALERT',
      alert: 'PROMPT_INJECTION_ATTEMPT',
      requestId: req.requestId,
      userId: req.userId,
      inputSnippet: req.message.substring(0, 100)
    }));

    return {
      reply: 'I am designed specifically to assist with event waste segregation, composting, and eco-friendly event planning. Please ask a query related to sustainability!',
      telemetry: {
        model: 'gemini-1.5-flash',
        promptVersion: 'waste-assistant-v2',
        latencyMs: Date.now() - start,
        fallbackUsed: true,
        promptInjectionDetected: true
      }
    };
  }

  // 2. Fallback execution if Gemini API key is missing or invalid
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === 'demo_key') {
    return {
      reply: generateStructuredSustainabilityAdvice(req.message, req.context),
      telemetry: {
        model: 'ecosetu-advisory-heuristics-v1',
        promptVersion: 'waste-assistant-v2',
        latencyMs: Date.now() - start,
        fallbackUsed: true,
        promptInjectionDetected: false
      }
    };
  }

  // 3. Execute Gemini AI Call
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `You are EcoSetu AI Assistant, an expert in Indian event waste management, festival waste segregation, composting, bio-recycling, and zero-waste wedding planning.
    Always provide actionable, concise, and structured sustainability recommendations.`;

    const prompt = `${systemInstruction}\n\nUser Context: ${JSON.stringify(req.context || {})}\nUser Query: ${req.message}`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return {
      reply: responseText,
      telemetry: {
        model: 'gemini-1.5-flash',
        promptVersion: 'waste-assistant-v2',
        latencyMs: Date.now() - start,
        fallbackUsed: false,
        promptInjectionDetected: false
      }
    };
  } catch (error: any) {
    console.error(JSON.stringify({
      type: 'AI_GATEWAY_ERROR',
      requestId: req.requestId,
      error: error.message || error
    }));

    // Controlled fallback
    return {
      reply: generateStructuredSustainabilityAdvice(req.message, req.context),
      telemetry: {
        model: 'ecosetu-advisory-heuristics-v1',
        promptVersion: 'waste-assistant-v2',
        latencyMs: Date.now() - start,
        fallbackUsed: true,
        promptInjectionDetected: false
      }
    };
  }
}

function generateStructuredSustainabilityAdvice(message: string, context?: Record<string, any>): string {
  const query = message.toLowerCase();

  if (query.includes('food') || query.includes('catering') || query.includes('leftover')) {
    return `🌱 **Food Waste Management Guidelines:**
1. **Immediate Rescue:** Partner with local food banks (Akshaya Patra / Feeding India) within 2 hours of meal completion.
2. **On-Site Segregation:** Separate wet food waste into 30kg labeled organic bins for bio-composting.
3. **Oil & Grease:** Store used cooking oil separately for biodiesel recycling.`;
  }

  if (query.includes('flower') || query.includes('decoration') || query.includes('puja')) {
    return `🌸 **Floral Waste Circular Recovery:**
1. **Segregation:** Keep marigold, rose, and green foliage unmixed from plastic wraps.
2. **Floral Recyclers:** Send marigold and roses to incense stick & organic dye manufacturing units.
3. **Composting:** Shred green foliage for rapid aerobic composting.`;
  }

  if (query.includes('plastic') || query.includes('bottle') || query.includes('cutlery')) {
    return `♻️ **Plastic & Dry Waste Segregation:**
1. **Banning Single-Use:** Replace disposable plastic bottles with refillable glass water dispensers.
2. **Collection:** Set up dual-stream recycling stations at all exit points.
3. **Recycler Dispatch:** Schedule bulk plastic pickup with registered plastic recycling aggregators.`;
  }

  return `♻️ **EcoSetu Event Sustainability Plan:**
1. Estimate expected waste volumes using our ML Predictor.
2. Schedule a verified Recovery Partner matching your waste categories.
3. Track real-time pickup status and measure your EPA CO₂e reduction metrics!`;
}
