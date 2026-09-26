import { GoogleGenerativeAI } from '@google/generative-ai';
import { retrieveRelevantKnowledge } from './sustainabilityRAG';
import { ENV } from '../config/environment';

export interface AIGatewayRequest {
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

export interface AIGatewayResponse {
  reply: string;
  groundedKnowledge: Array<{ id: string; title: string }>;
  telemetry: {
    model: string;
    promptVersion: string;
    latencyMs: number;
    fallbackUsed: boolean;
    promptInjectionDetected: boolean;
  };
}

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
  const apiKey = ENV.GEMINI_API_KEY;

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
      reply: 'I am designed specifically to assist with event waste segregation, composting, circular recovery, and eco-friendly event planning. Please ask a query related to sustainability!',
      groundedKnowledge: [],
      telemetry: {
        model: 'gemini-1.5-flash',
        promptVersion: 'ecosetu-rag-v2',
        latencyMs: Date.now() - start,
        fallbackUsed: true,
        promptInjectionDetected: true
      }
    };
  }

  // 2. Retrieve Grounded RAG Knowledge Chunks
  const ragChunks = retrieveRelevantKnowledge(req.message, 3);
  const ragContextText = ragChunks.length > 0
    ? ragChunks.map(c => `[Knowledge Base: ${c.title}]\n${c.content}`).join('\n\n')
    : 'No specific local RAG document matched; apply standard EcoSetu zero-waste principles.';

  const groundedMeta = ragChunks.map(c => ({ id: c.id, title: c.title }));

  // 3. Fallback execution if Gemini API key is missing or default key
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === 'demo_key') {
    return {
      reply: generateStructuredSustainabilityAdvice(req.message, ragChunks),
      groundedKnowledge: groundedMeta,
      telemetry: {
        model: 'ecosetu-rag-advisory-v2',
        promptVersion: 'ecosetu-rag-v2',
        latencyMs: Date.now() - start,
        fallbackUsed: true,
        promptInjectionDetected: false
      }
    };
  }

  // 4. Execute Grounded Gemini AI Call
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `You are EcoSetu AI RAG Assistant, an expert in Indian event waste intelligence, festival waste segregation, composting, floral upcycling, and zero-waste logistics.
Answer the user query strictly grounded in the verified RAG knowledge base context and platform telemetry provided below. If relevant EcoSetu platform data is present, incorporate it directly.`;

    const prompt = `${systemInstruction}

=== VERIFIED GROUNDED RAG KNOWLEDGE ===
${ragContextText}

=== PLATFORM & USER CONTEXT ===
${JSON.stringify(req.context || {}, null, 2)}

=== USER QUERY ===
${req.message}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return {
      reply: responseText,
      groundedKnowledge: groundedMeta,
      telemetry: {
        model: 'gemini-1.5-flash',
        promptVersion: 'ecosetu-rag-v2',
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

    return {
      reply: generateStructuredSustainabilityAdvice(req.message, ragChunks),
      groundedKnowledge: groundedMeta,
      telemetry: {
        model: 'ecosetu-rag-advisory-v2',
        promptVersion: 'ecosetu-rag-v2',
        latencyMs: Date.now() - start,
        fallbackUsed: true,
        promptInjectionDetected: false
      }
    };
  }
}

function generateStructuredSustainabilityAdvice(message: string, ragChunks: any[]): string {
  if (ragChunks.length > 0) {
    const primary = ragChunks[0];
    return `🌱 **EcoSetu Grounded Sustainability Advice (${primary.title})**\n\n${primary.content}\n\n♻️ **Recommended Action:** Segregate waste into labelled streams at the source and schedule a verified EcoSetu Recovery Partner.`;
  }

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

  return `♻️ **EcoSetu Event Sustainability Plan:**
1. Estimate expected waste volumes using our ML Predictor.
2. Schedule a verified Recovery Partner matching your waste categories.
3. Track real-time pickup status and measure your EPA CO₂e reduction metrics!`;
}
