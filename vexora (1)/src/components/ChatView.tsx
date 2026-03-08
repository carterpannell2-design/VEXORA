import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Trash2, History, Plus, MessageSquare, Brain, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string; // Changed to string for JSON serialization
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export const ChatView: React.FC = () => {
  // Helper to load conversations
  const loadConversations = (): Conversation[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('vexora_chats');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved chats", e);
      return [];
    }
  };

  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const saved = loadConversations();
    return saved.length > 0 ? saved[0].id : null;
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize GenAI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // Save conversations to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('vexora_chats', JSON.stringify(conversations));
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentId, conversations]);

  const getCurrentMessages = () => {
    return conversations.find(c => c.id === currentId)?.messages || [];
  };

  const startNewChat = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentId(newId);
    setShowSidebar(false);
    setError(null);
  };

  const deleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentId === id) {
      setCurrentId(null);
    }
  };

  const updateConversationTitle = (id: string, firstMessage: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')
        };
      }
      return c;
    }));
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    let activeId = currentId;
    let isNew = false;

    if (!activeId) {
      activeId = Date.now().toString();
      isNew = true;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    // Optimistic update
    setConversations(prev => {
      if (isNew) {
        return [{
          id: activeId!,
          title: updatedInput.slice(0, 30) + (updatedInput.length > 30 ? '...' : ''),
          messages: [userMessage],
          timestamp: Date.now()
        }, ...prev];
      } else {
        return prev.map(c => {
          if (c.id === activeId) {
            // Update title if it's the first message
            const title = c.messages.length === 0 
              ? updatedInput.slice(0, 30) + (updatedInput.length > 30 ? '...' : '')
              : c.title;
            return {
              ...c,
              title,
              messages: [...c.messages, userMessage],
              timestamp: Date.now()
            };
          }
          return c;
        });
      }
    });
    
    if (isNew) setCurrentId(activeId);

    try {
      // Select model based on thinking mode
      // gemini-3.1-pro-preview for complex tasks (Thinking Mode)
      // gemini-3-flash-preview for fast tasks (Standard Mode)
      const model = thinkingMode ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
      
      const currentHistory = conversations.find(c => c.id === activeId)?.messages || [];
      // Include the new user message in history context if it wasn't already there (it is in state, but maybe not in the ref yet)
      // Actually, we should just take the messages from the state update we just did.
      // But since state update is async, we construct it manually here.
      const historyMessages = isNew ? [] : currentHistory;
      
      const history = historyMessages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: model,
        history: history,
        config: {
          systemInstruction: thinkingMode 
            ? "You are Vexora AI in Deep Thought mode. You are a highly intelligent, analytical, and thorough assistant. You should think through problems step-by-step, consider multiple angles, and provide comprehensive, well-reasoned answers. You prefer dark mode aesthetics and tech-focused metaphors."
            : "You are Vexora AI, a helpful, witty, and concise assistant embedded in the Vexora web application. You prefer dark mode aesthetics and tech-focused metaphors.",
        },
      });

      const result = await chat.sendMessage({ message: userMessage.text });
      const responseText = result.text;

      if (!responseText) {
        throw new Error("No response from AI");
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString()
      };

      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: [...c.messages, botMessage]
          };
        }
        return c;
      }));

    } catch (err: any) {
      console.error("AI Error:", err);
      setError(err.message || "Failed to get response from AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCurrentChat = () => {
    if (currentId) {
      setConversations(prev => prev.map(c => {
        if (c.id === currentId) {
          return { ...c, messages: [] };
        }
        return c;
      }));
    }
  };

  const currentMessages = getCurrentMessages();

  return (
    <div className="flex h-full overflow-hidden bg-black">
      {/* Sidebar - Desktop: always visible, Mobile: slide-over */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-white/5 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} className="text-indigo-400" />
              History
            </h2>
            <button 
              onClick={() => setShowSidebar(false)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center gap-2 w-full p-3 mb-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium"
          >
            <Plus size={20} />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {conversations.length === 0 && (
              <div className="text-center text-zinc-500 py-8 text-sm">
                No saved conversations
              </div>
            )}
            {conversations.map(chat => (
              <button
                key={chat.id}
                onClick={() => {
                  setCurrentId(chat.id);
                  setShowSidebar(false);
                }}
                className={`
                  w-full text-left p-3 rounded-xl transition-all group relative
                  ${currentId === chat.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}
                `}
              >
                <div className="flex items-center gap-3 pr-8">
                  <MessageSquare size={16} className={currentId === chat.id ? 'text-indigo-400' : 'opacity-50'} />
                  <span className="truncate text-sm font-medium">{chat.title || 'New Chat'}</span>
                </div>
                <div 
                  onClick={(e) => deleteConversation(e, chat.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(true)}
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
            >
              <History size={24} />
            </button>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              {thinkingMode ? <Brain size={24} /> : <Sparkles size={24} />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Vexora AI
                {thinkingMode && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Thinking Mode</span>}
              </h1>
              <p className="text-zinc-500 text-xs hidden sm:block">
                {thinkingMode ? 'Powered by Gemini 3.1 Pro' : 'Powered by Gemini 3 Flash'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setThinkingMode(!thinkingMode)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                ${thinkingMode 
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                  : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-zinc-200'}
              `}
              title="Toggle Thinking Mode"
            >
              <Brain size={16} />
              <span className="hidden sm:inline">Thinking Mode</span>
            </button>
            
            {currentMessages.length > 0 && (
              <button 
                onClick={clearCurrentChat}
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Clear Current Chat"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-zinc-950/30">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${thinkingMode ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}>
                {thinkingMode ? <Brain size={48} className="text-indigo-400" /> : <Bot size={48} className="text-indigo-400" />}
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">
                {thinkingMode ? 'Deep Thought Mode Active' : 'How can I help you today?'}
              </h3>
              <p className="text-zinc-400 max-w-md">
                {thinkingMode 
                  ? 'I will take more time to think through complex problems and provide detailed, reasoned responses.'
                  : 'Ask me about code, creative writing, analysis, or just chat. I\'m here to assist.'}
              </p>
            </div>
          ) : (
            currentMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${msg.role === 'user' ? 'bg-zinc-700 text-zinc-300' : 'bg-indigo-600 text-white'}
                `}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className={`
                  max-w-[85%] md:max-w-[75%] rounded-2xl p-4 leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-none' 
                    : 'bg-indigo-500/10 text-indigo-100 border border-indigo-500/20 rounded-tl-none'}
                `}>
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                  <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                {thinkingMode ? (
                  <>
                    <Brain size={16} className="text-indigo-400 animate-pulse" />
                    <span className="text-sm text-indigo-300 animate-pulse">Thinking deeply...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </>
                )}
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 mx-auto max-w-2xl"
            >
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-zinc-950 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={thinkingMode ? "Ask a complex question..." : "Type a message..."}
                className={`
                  w-full bg-zinc-900 border rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 transition-all text-white placeholder-zinc-500
                  ${thinkingMode 
                    ? 'border-indigo-500/30 focus:ring-indigo-500/50 focus:border-indigo-500/50' 
                    : 'border-white/10 focus:ring-indigo-500/50'}
                `}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  ${thinkingMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}
                `}
              >
                <Send size={20} />
              </button>
            </form>
            <div className="text-center mt-3 flex items-center justify-center gap-2">
               <p className="text-[10px] text-zinc-600">
                 Vexora AI can make mistakes. Consider checking important information.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
