import React, { useState, useEffect, useRef } from 'react';
import { chatWithBot } from '../services/geminiService';
import { Send, User, Bot, Loader2, Database } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o assistente virtual do Pronto-Socorro. Como posso ajudar com dados de gestão hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load custom data from Admin Panel
    const savedData = localStorage.getItem('ps_context_data');
    if (savedData) {
      setContextData(savedData);
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Pass contextData to the service
      const responseText = await chatWithBot(history, userMsg, contextData);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, ocorreu um erro. Tente novamente mais tarde.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] animate-fade-in flex flex-col">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assistente Virtual</h1>
          <p className="text-slate-500">Tire dúvidas sobre gestão e indicadores (Gemini 3 Pro).</p>
        </div>
        {contextData && (
          <div className="text-xs flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <Database size={12} />
            Dados do Admin Carregados
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-full flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="flex items-center gap-2 text-slate-400 ml-12">
                 <Loader2 className="animate-spin" size={16} />
                 <span className="text-xs">Digitando...</span>
               </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;