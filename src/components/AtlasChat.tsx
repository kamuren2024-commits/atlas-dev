import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, MessageSquare, Bot, User, Volume2, VolumeX, 
  Trash2, FileText, Globe, RefreshCcw, BookOpen, Layers
} from 'lucide-react';
import { checkAIAvailability, processAIChat } from '../utils/ai';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  persona?: string;
  text: string;
  timestamp: string;
  citations?: { label: string; url: string; extract: string }[];
  fileAttachment?: string;
  provider?: string;
  model?: string;
}

interface AIRuntimeStatus {
  online: boolean;
  modelCount: number;
  qwenCount: number;
  status: string;
  latency?: number;
}

export default function AtlasChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      senderName: 'Salience Core OS',
      persona: 'Core OS',
      text: "Welcome to **Salience Atlas X**. I am your central intelligence orchestrator. How may I assist with your workspace objectives today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ] as any);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState('Core OS');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AIRuntimeStatus>({ online: false, modelCount: 0, qwenCount: 0, status: 'CHECKING' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personas = [
    { name: 'Core OS', desc: 'Central orchestrator & router', system: 'You are Salience Atlas X Core Operating System, powered by Gemini. Keep your responses crisp, professional, and visually formatted.' },
    { name: 'Strategic Analyst', desc: 'Predictive modeling & strategic advice', system: 'You are the Lead Strategic Advisor of Salience Atlas. Focus on business forecasts, threat vectors, risk matrixing, and actionable items.' },
    { name: 'Code Auditor', desc: 'Syntax reviews & optimization', system: 'You are an elite Staff Software Engineer. Focus on performance efficiency, architectural scalability, and clear TypeScript syntax.' }
  ];

  const templates = [
    "Formulate 2026 Strategic Growth Plan",
    "Identify security risk anomalies in workspace",
    "Draft a scalable metadata configuration schema"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    const loadStatus = async () => {
      const status = await checkAIAvailability();
      if (cancelled) return;
      if (!status) {
        setAiStatus({ online: false, modelCount: 0, qwenCount: 0, status: 'OFFLINE' });
        return;
      }
      const provider = status.providers?.[0];
      setAiStatus({
        online: status.federation?.status === 'HEALTHY' || provider?.status === 'HEALTHY',
        modelCount: status.models?.count ?? status.providers?.[0]?.models ?? 0,
        qwenCount: status.models?.qwenModels ?? 0,
        status: provider?.status || status.federation?.status || 'UNKNOWN',
        latency: provider?.latency,
      });
    };
    loadStatus();
    return () => { cancelled = true; };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() && !attachedFile) return;

    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileAttachment: attachedFile || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    const personaSystem = personas.find(p => p.name === activePersona)?.system;
    
    // Call the REAL local AI runtime through the backend AI Federation.
    // The local Qwen model executes true inference; no simulated responses.
    const result = await processAIChat({
      message: query,
      context: attachedFile || undefined,
      system: personaSystem,
      temperature: 0.75,
      maxTokens: 600,
    });

    const aiOnline = result.success && !!result.response;
    const responseText = aiOnline
      ? result.response
      : `### Local AI Unavailable\n\n${result.error || 'The local AI inference service could not generate a response.'}`;

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      persona: activePersona,
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: aiOnline ? result.provider : undefined,
      model: aiOnline ? result.model : undefined,
      citations: aiOnline ? [
        { label: `${result.model || 'Local Model'} · ${(result.latencyMs/1000).toFixed(1)}s`, url: "#", extract: `Real local Qwen inference via Ollama.` },
        { label: `Tokens ${result.usage?.promptTokens ?? 0}+${result.usage?.completionTokens ?? 0}`, url: "#", extract: "Token usage reported by the local runtime." }
      ] : undefined
    };

    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);

    // Audio text to speech simulation
    if (soundEnabled) {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          // Strip markdown for speech synthesis
          const cleanText = responseText.replace(/[\*\#\`\-\>\+\(\)]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 180));
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.warn('SpeechSynthesis is restricted or blocked in this environment:', err);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
    }
  };

  const clearChat = () => {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('SpeechSynthesis is restricted or blocked in this environment:', err);
    }
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        persona: 'Core OS',
        text: "Database context flushed. All primary nodes initialized to baseline configuration.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl relative overflow-hidden" id="atlas-chat-container">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-indigo-500/10 gap-3" id="chat-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/15 rounded-lg text-indigo-400">
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-display font-semibold tracking-wide text-white">Atlas Conversational Cortex</h2>
            <p className="text-[10px] font-mono text-cyan-400">SESSION_THREAD_ACTIVE // V2.4</p>
          </div>
        </div>

        {/* Local AI Runtime Status Indicator */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[10px] font-mono ${
            aiStatus.online
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : aiStatus.status === 'CHECKING'
              ? 'bg-slate-800/40 border-slate-500/30 text-slate-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
          title={aiStatus.online ? `Real local inference via Qwen (${aiStatus.latency}ms)` : 'Local AI runtime offline'}
        >
          <span className={`relative flex h-2 w-2`}>
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                aiStatus.online ? 'bg-emerald-400' : aiStatus.status === 'CHECKING' ? 'bg-slate-400' : 'bg-red-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                aiStatus.online ? 'bg-emerald-500' : aiStatus.status === 'CHECKING' ? 'bg-slate-400' : 'bg-red-500'
              }`}
            ></span>
          </span>
          <span className="font-semibold">LOCAL AI {aiStatus.online ? '● ONLINE' : aiStatus.status === 'CHECKING' ? '...' : '● OFFLINE'}</span>
          {aiStatus.online && (
            <span className="px-1.5 py-0.5 bg-emerald-500/20 rounded text-[9px]">QWEN · {aiStatus.qwenCount || aiStatus.modelCount} MODELS</span>
          )}
        </div>

        {/* Personas selection */}
        <div className="flex gap-2 items-center bg-slate-900/60 p-1 rounded-xl border border-indigo-500/10">
          {personas.map((p) => (
            <button
              key={p.name}
              onClick={() => setActivePersona(p.name)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activePersona === p.name ? 'bg-indigo-600/45 text-cyan-200 shadow-sm border border-indigo-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/60' : 'text-slate-400 hover:bg-slate-800/30'}`}
            title="Toggle Text-To-Speech Output"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-pink-400 hover:bg-pink-950/25 rounded-lg transition-colors"
            title="Flush chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Zone */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-950/20 backdrop-blur-sm relative scroll-smooth" id="chat-messages-scroll">
        <AnimatePresence initial={false}>
          {messages.map((m: any) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatars */}
              {m.sender !== 'user' && (
                <div className="w-8 h-8 rounded-full border border-indigo-500/20 flex items-center justify-center bg-indigo-950/50 shadow-[0_0_10px_rgba(139,92,246,0.15)] shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}

              {/* Message Payload block */}
              <div className="max-w-[78%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase">
                    {m.sender === 'user' ? 'User Operator' : `${m.persona || 'Intelligence Point'}`}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">{m.timestamp}</span>
                </div>

                <div className={`p-4 rounded-2xl relative shadow-md text-sm border ${
                  m.sender === 'user' 
                    ? 'bg-gradient-to-br from-indigo-950/90 to-slate-900/90 border-indigo-500/20 text-indigo-100 rounded-tr-none' 
                    : 'bg-gradient-to-br from-slate-900/90 to-indigo-950/95 border-indigo-500/10 text-slate-100 rounded-tl-none'
                }`}>
                  {/* Attached file marker */}
                  {m.fileAttachment && (
                    <div className="mb-2 flex items-center gap-2 text-xs py-1 px-2.5 bg-indigo-950/80 rounded-lg text-indigo-300 border border-indigo-500/20">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-mono">Attached Context: {m.fileAttachment}</span>
                    </div>
                  )}

                  {/* Message body */}
                  <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans space-y-1">
                    {/* Real Markdown Formatting Helper */}
                    {m.text.split('\n').map((line: string, i: number) => {
                      if (line.startsWith('###')) {
                        return <h3 key={i} className="text-base font-display font-medium text-white mb-2 pt-1 mt-2 tracking-tight">{line.replace('###', '')}</h3>;
                      }
                      if (line.startsWith('*')) {
                        return <li key={i} className="ml-4 list-disc text-slate-300">{line.replace('*', '').trim()}</li>;
                      }
                      // Simple bold highlights
                      const boldParts = line.split('**');
                      if (boldParts.length > 1) {
                        return (
                          <p key={i} className="mb-2">
                            {boldParts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-cyan-300 font-semibold">{part}</strong> : part)}
                          </p>
                        );
                      }
                      return <p key={i} className="mb-1.5">{line}</p>;
                    })}
                  </div>

                  {/* Sound Animation */}
                  {m.sender !== 'user' && soundEnabled && (
                    <div className="absolute top-3 right-3 flex items-center gap-0.5">
                      <div className="w-[2px] h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-[2px] h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-[2px] h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  )}
                </div>

                {/* Local Model Runtime Badge */}
                {m.sender !== 'user' && m.provider && m.model && (
                  <div className="mt-2 flex items-center gap-1.5 text-[9px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/25 text-emerald-300">● LOCAL</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-700/40 text-cyan-300">{m.model}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-700/40 text-slate-400">via {m.provider}</span>
                  </div>
                )}

                {/* Simulated Web Citations */}
                {m.sender !== 'user' && m.citations && m.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.citations.map((c: any, index: number) => (
                      <div
                        key={index}
                        className="group relative cursor-pointer flex items-center gap-1 text-[10px] bg-slate-900/50 hover:bg-slate-900/80 p-1 px-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <Globe className="w-2.5 h-2.5 text-cyan-500" />
                        <span className="font-mono">{c.label}</span>
                        
                        {/* Interactive Hover Card Citation */}
                        <div className="pointer-events-none opacity-0 group-hover:opacity-100 absolute bottom-full left-0 mb-2 w-56 p-3 bg-slate-950 text-slate-300 rounded-lg shadow-xl border border-indigo-500/20 z-50 transition-opacity duration-200">
                          <p className="text-[10px] font-mono font-semibold text-cyan-400 mb-1">{c.label}</p>
                          <p className="text-[10px] leading-relaxed italic text-slate-400">"{c.extract}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center bg-cyan-950/40 shrink-0">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Assistant Working status bar */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full border border-indigo-500/20 flex items-center justify-center bg-indigo-950/50 shadow-md">
                <RefreshCcw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl max-w-[50%]">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Synthesizing cognitive weights...</span>
                </div>
                <div className="mt-2 flex gap-1 w-full justify-start items-center">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Templates Quick Actions bar */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-t border-indigo-500/10 flex flex-wrap items-center gap-2" id="chat-templates-bar">
        <span className="text-[10px] font-mono font-bold text-indigo-400 flex items-center gap-1">
          <Layers className="w-3 h-3" /> PRESETS:
        </span>
        {templates.map((t, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(t)}
            className="text-[11px] bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-white px-3 py-1 rounded-lg transition-all text-left truncate max-w-xs"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Floating Attachment Indicator */}
      {attachedFile && (
        <div className="bg-slate-950 border-t border-indigo-500/10 px-5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <BookOpen className="w-4 h-4" />
            <span>Workspace source context active: <strong className="text-white">{attachedFile}</strong></span>
          </div>
          <button 
            onClick={() => setAttachedFile(null)}
            className="text-pink-400 hover:text-pink-300 text-[10px] font-mono uppercase tracking-wide"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Chat Input form area */}
      <div className="p-4 bg-slate-950 border-t border-indigo-500/10" id="chat-input-controls">
        <div className="relative flex items-center">
          {/* File attach button */}
          <label className="absolute left-3.5 cursor-pointer text-slate-400 hover:text-white transition-colors" title="Incorporate local text source context">
            <FileText className="w-4 h-4" />
            <input 
              type="file" 
              accept=".txt,.md,.json,.csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Instruct Atlas Core... (Type prompt, or click file clip context)"
            className="w-full bg-slate-900/70 border border-slate-800 focus:border-indigo-500/50 rounded-xl py-3 pl-11 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !attachedFile)}
            className={`absolute right-2 px-3 py-2.5 rounded-lg font-mono text-xs font-semibold uppercase flex items-center gap-1.5 transition-all ${
              loading || (!input.trim() && !attachedFile)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-2 px-1">
          <span>AI GATEWAY: SECURE STREAMING (GEMINI CLIENT)</span>
          <span>AUTOSAVE SYNCED DISPATCH</span>
        </div>
      </div>
    </div>
  );
}
