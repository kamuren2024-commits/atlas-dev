import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, FileText, ShieldCheck, AlertCircle, History, ArrowRight, MessageSquare, Zap, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type?: 'text' | 'finding' | 'recommendation' | 'risk';
  links?: { label: string; id: string }[];
}

const DecisionAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'I am the Decision Intelligence Assistant. I can help you analyze evaluations, identify hidden risks, and navigate procurement legislation. How can I assist you today?',
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Simulate contextual intelligence response
      setTimeout(() => {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateResponse(input),
          type: 'text',
          links: [
            { label: 'View Related Tender', id: 'tender-2026-08' },
            { label: 'PPADA Section 71', id: 'rule-ppada-71' }
          ]
        };
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setLoading(false);
    }
  };

  const generateResponse = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('risk')) return "Analyzing the current evaluation for Shanghai Grid Metal, I've identified a high-risk relationship anomaly: they share an IP address with Siemens Energy during submission. This pattern often indicates bid coordination. I recommend triggering a deep audit of their beneficial ownership structures.";
    if (q.includes('law') || q.includes('rule')) return "Under PPADA Section 71, mandatory requirements must be strictly verified. The current bidder has failed the KRA PIN verification. This constitutes a non-compliance finding that justifies immediate disqualification unless a manual override with justification is provided by the Accounting Officer.";
    if (q.includes('history')) return "In similar tenders from 2024 (KETRACO/TNT/2024/12), we saw a 15% increase in variation orders from this supplier. My predictive model suggests a 60% probability of similar cost escalations in this project.";
    return "I've analyzed the documents and identified 4 compliance gaps and 2 potential conflict-of-interest links in the knowledge graph. Would you like me to generate a structured decision dossier for your review?";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="decision-assistant">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-none">Decision Assistant</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Memory Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <History size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Zap size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
              
              {m.links && m.links.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  {m.links.map((link, i) => (
                    <button key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-blue-600 border border-slate-100 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-50 transition-colors">
                      <FileText size={12} />
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask about risks, laws, or historical patterns..."
            rows={2}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} className="text-blue-500" />
            Decision Intelligence Mode
          </div>
          <div className="h-4 w-px bg-slate-100" />
          <div className="flex gap-2">
             {['Summary', 'Risks', 'Legislation'].map(tag => (
               <button 
                key={tag} 
                onClick={() => setInput(`Give me a ${tag.toLowerCase()} of this evaluation`)}
                className="text-[9px] font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
               >
                 #{tag}
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionAssistant;
