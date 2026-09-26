export interface KnowledgeChunk {
  id: string;
  category: 'FOOD_WASTE' | 'FLORAL_WASTE' | 'PLASTIC_SEGREGATION' | 'FESTIVAL_GUIDELINES' | 'RECOVERY_LOGISTICS';
  title: string;
  content: string;
  keywords: string[];
}

const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: 'rag_food_01',
    category: 'FOOD_WASTE',
    title: 'Event Surplus Food Donation & FSSAI Guidelines',
    content: 'Surplus cooked food from events must be handled within 2-3 hours of preparation. Under FSSAI hygiene standards, food kept above 60°C or below 4°C can be safely distributed to local food relief organizations (e.g. Akshaya Patra, Feeding India). Wet organic leftovers unsuitable for human consumption should be routed directly to anaerobic biogas digesters or aerobic bio-composting units.',
    keywords: ['food', 'leftover', 'surplus', 'catering', 'meal', 'fssai', 'donation', 'hunger', 'cooking']
  },
  {
    id: 'rag_floral_01',
    category: 'FLORAL_WASTE',
    title: 'Festival & Temple Floral Waste Circular Upcycling',
    content: 'Floral waste from weddings, pujas, and festivals (marigold, rose, jasmine, foliage) represents up to 25% of total festival waste volume. Segregating flowers from plastic strings and foil wrappings allows 100% circular recovery: marigold and rose petals are processed into natural dye extract and bio-incense sticks (dhoop), while stem foliage is shredded for rapid vermicomposting.',
    keywords: ['flower', 'floral', 'marigold', 'rose', 'puja', 'temple', 'garland', 'decoration', 'incense', 'dye', 'vermicompost']
  },
  {
    id: 'rag_plastic_01',
    category: 'PLASTIC_SEGREGATION',
    title: 'Single-Use Plastic Ban & Dual-Stream Waste Segregation',
    content: 'Under India Plastic Waste Management Rules, single-use cutlery, thin carry bags, and plastic straws are restricted at public events. Best practice requires establishing dual-stream segregation stations (Organic Wet Waste in green bins, Dry Recyclable Plastics/Paper in blue bins). Clean PET bottles and cardboard boxes achieve 95%+ market recycling value when unmixed with organic food waste.',
    keywords: ['plastic', 'bottle', 'cutlery', 'pet', 'disposable', 'dry waste', 'recycling', 'segregation', 'bin', 'blue bin', 'green bin']
  },
  {
    id: 'rag_festival_01',
    category: 'FESTIVAL_GUIDELINES',
    title: 'Zero-Waste Festival & Mass Gathering Execution Framework',
    content: 'Mass cultural and religious gatherings (Ganesh Utsav, Durga Puja, Diwali melas) generate high peak waste volumes. Recommended zero-waste protocol includes: (1) Pre-event waste forecasting via ML models, (2) Mandatory eco-friendly bio-degradable tableware, (3) On-site sorting hubs staffed by trained green volunteers, and (4) Daily pickup dispatches with verified material recovery facilities.',
    keywords: ['festival', 'mela', 'ganesh', 'puja', 'gathering', 'zero waste', 'mass event', 'wedding', 'celebration']
  },
  {
    id: 'rag_pickup_01',
    category: 'RECOVERY_LOGISTICS',
    title: 'EcoSetu Recovery Partner Matching & State Machine Logistics',
    content: 'EcoSetu AI matches event waste output with certified material recovery facilities (MRFs) using a 5-factor weighted algorithm (Waste Compatibility 35%, Available Capacity 25%, Proximity Distance 20%, Availability 10%, Verification Status 10%). Pickups follow a strict 7-stage lifecycle state machine: PENDING -> ACCEPTED -> SCHEDULED -> PICKUP_IN_PROGRESS -> COLLECTED -> RECOVERED -> COMPLETED.',
    keywords: ['pickup', 'partner', 'matching', 'recovery', 'collector', 'mrf', 'logistics', 'capacity', 'distance']
  }
];

export function retrieveRelevantKnowledge(query: string, maxResults = 3): KnowledgeChunk[] {
  const normalizedQuery = query.toLowerCase();
  const words = normalizedQuery.split(/\W+/).filter(w => w.length > 2);

  const scored = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    for (const word of words) {
      if (chunk.keywords.some(kw => kw.toLowerCase().includes(word))) {
        score += 3;
      }
      if (chunk.content.toLowerCase().includes(word)) {
        score += 1;
      }
      if (chunk.title.toLowerCase().includes(word)) {
        score += 2;
      }
    }
    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.chunk);
}
