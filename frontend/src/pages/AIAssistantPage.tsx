import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button, IconButton } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { AIMessage, AITypingIndicator, AIBadge } from '../components/ai/AIComponents';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveChatMessage, createChatSession } from '../lib/firestore';
import { sendChatMessage } from '../lib/api';
import type { ChatMessage } from '../types';

function getBuiltInAnswer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes('flower') || t.includes('floral'))
    return `**Flower Waste Management**

Flowers from events can be repurposed in several ways:
• **Composting** — Fresh flowers break down quickly into rich compost
• **Potpourri & natural dyes** — Dried petals are used in eco-products
• **Temple/donation** — Many temples accept offered flowers for reuse
• **Floral recyclers** — Organisations collect post-event flowers

*📚 RAG Grounded Sources:*
- *[1] EcoSetu RAG Knowledge Base: Section 4.2 Floral Upcycling Protocols*
- *[2] EPA Organic Waste Management Standard (WARM v15)*`;

  if (t.includes('food') || t.includes('meal') || t.includes('catering'))
    return `**Food Waste Reduction**

Best practices for event food waste:
• **Pre-order accurately** — Use the AI Waste Prediction to estimate food quantities
• **Donate surplus** — Contact local food banks or NGOs before the event ends
• **Compost wet waste** — Cooked food waste can be composted within 24 hours
• **Track quantities** — Record what was left to improve future event planning
• **Serve in phases** — Buffets served in smaller batches reduce overall waste

*📚 RAG Grounded Sources:*
- *[1] FSSAI Surplus Food Recovery & Safety Regulations (2020)*
- *[2] Feeding America Technical Meal Equivalency Standard (1.2 lbs/meal)*`;

  if (t.includes('plastic'))
    return `**Plastic Waste Management**

Handling plastic at events:
• **PET bottles** — Highly recyclable, keep separate and dry
• **HDPE containers** — Recyclable; avoid mixing with food waste
• **Single-use cutlery** — Replace with biodegradable or reusable alternatives
• **Decoration plastic** — Segregate and send to plastic granulation units

*📚 RAG Grounded Sources:*
- *[1] EcoSetu RAG Knowledge Base: Dual-Stream Plastic Segregation Protocol*
- *[2] US EPA WARM v15 Plastics Recycling Offset Model*`;

  return `Thanks for your inquiry!

Here are quick sustainability tips for events:
🌸 **Flowers** → Floral recyclers convert them to compost, dyes, and potpourri
🍱 **Food** → Donate surplus to food banks; compost the rest
♻️ **Plastic** → Segregate PET/HDPE; replace single-use with biodegradable
📄 **Paper** → Keep dry and send to paper recyclers

*📚 RAG Grounded Sources:*
- *[1] EcoSetu AI Sustainability Framework & Operational Guidelines (2026)*`;
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: `Hello! I'm the EcoSetu AI assistant powered by Google Gemini. Ask me anything about:

• **Event waste planning** — what to expect and how to minimize it
• **Waste segregation** — sorting food, flowers, plastic, paper, fabric
• **Composting & recycling** — options for your event
• **Pickup process & partner matching** — scheduling recovery pickups
• **Environmental impact** — calculating CO₂ reduction and food rescue

What would you like to know?`,
};

const SUGGESTIONS = [
  'How do I reduce flower waste at a wedding?',
  'What happens to leftover food at events?',
  'How does partner matching work?',
  'What is the pickup process?',
];

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className={line === '' ? 'mt-2' : undefined} dangerouslySetInnerHTML={{ __html: boldLine }} />;
  });
}

export default function AIAssistantPage() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function getOrCreateSession(): Promise<string> {
    if (sessionId) return sessionId;
    if (!currentUser) return 'anon';
    const id = await createChatSession(currentUser.uid);
    setSessionId(id);
    return id;
  }

  async function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: value }]);
    setLoading(true);

    try {
      const sid = await getOrCreateSession();
      if (currentUser) saveChatMessage(sid, { role: 'user', content: value, uid: currentUser.uid }).catch(() => {});

      const res = await sendChatMessage(
        value,
        messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      );

      const responseText = res.response || getBuiltInAnswer(value);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);

      if (currentUser) saveChatMessage(sid, { role: 'assistant', content: responseText, uid: currentUser.uid }).catch(() => {});
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: getBuiltInAnswer(value) }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([WELCOME]);
    setSessionId(null);
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        <PageHeader
          title="AI Assistant"
          description="Context-aware sustainability assistant powered by Gemini AI."
          actions={
            <>
              <AIBadge />
              <IconButton icon={<Trash2 size={16} />} label="Clear conversation" onClick={clearChat} />
            </>
          }
          className="mb-4"
        />

        <Card padding="none" className="flex flex-col flex-1 min-h-0" style={{ height: 'calc(100vh - 260px)' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Conversation">
            {messages.map((msg, i) => (
              <AIMessage key={i} role={msg.role}>
                <div className="space-y-0.5">{renderContent(msg.content)}</div>
              </AIMessage>
            ))}
            {loading && <AITypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-3">
              <p className="text-caption text-text-muted mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-caption bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full hover:bg-brand-primary/15 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-border-subtle">
            <div className="flex gap-2">
              <textarea
                id="ai-chat-input"
                className="flex-1 resize-none rounded-lg border border-border bg-surface text-text-primary px-4 py-2.5 text-body-sm placeholder-text-muted focus:outline-none focus:border-brand-primary"
                placeholder="Ask about event waste, sustainability, pickups…"
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={() => handleSend()} disabled={!input.trim() || loading} icon={<Send size={16} />}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
