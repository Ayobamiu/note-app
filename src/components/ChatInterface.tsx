import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await window.electronAPI.askAI(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't reach the brain. Try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden ring-1 ring-black/5">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200/50 bg-white/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-800">
              <Sparkles size={18} className="text-purple-500" />
              <h3 className="font-semibold text-sm">Ask your notes</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-200/50 rounded-full transition-colors text-zinc-500"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center p-4">
                <Sparkles size={32} className="mb-2 opacity-20" />
                <p className="text-sm">Ask me anything about your notes...</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  "max-w-[85%] p-3 text-sm rounded-2xl shadow-sm",
                  msg.role === 'user'
                    ? "bg-zinc-900 text-white self-end ml-auto rounded-br-none"
                    : "bg-white text-zinc-800 self-start mr-auto border border-zinc-100 rounded-bl-none"
                )}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white border border-zinc-100 text-zinc-500 self-start mr-auto p-3 rounded-2xl rounded-bl-none text-sm flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white/50 border-t border-zinc-200/50">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a question..."
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="absolute right-2 p-1.5 bg-zinc-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen 
            ? "bg-zinc-200 text-zinc-600 rotate-90" 
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};
