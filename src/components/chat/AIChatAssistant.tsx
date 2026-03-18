'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { sendChatMessage } from '@/lib/api';
import { useQuizStore } from '@/store/quizStore';
import type { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function AIChatAssistant() {
  const { session } = useQuizStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: `Hi! I'm your AI learning assistant 🧠 I can help you understand concepts related to your quiz, give hints, or explain answers. What would you like to know?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const currentQuestion =
        session?.questions[session.currentQuestionIndex];
      const correctOption = currentQuestion?.options.find(
        (o) => o.id === currentQuestion.correctOptionId
      );

      const { message } = await sendChatMessage(userMessage.content, {
        topic: session?.config.topic ?? 'general knowledge',
        currentQuestion: currentQuestion?.question,
        correctAnswer: correctOption?.text,
      });

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    'Give me a hint',
    'Explain the concept',
    'Why is this difficult?',
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-primary flex items-center justify-center shadow-2xl group"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          id="ai-chat-panel"
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] h-[500px] glass-card rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI Learning Assistant</h3>
              <p className="text-xs text-gray-500">Powered by Gemini</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                  ${msg.role === 'assistant' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-violet-500/20 border border-violet-500/30'}`}>
                  {msg.role === 'assistant' ? (
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-violet-400" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2.5 text-xs leading-relaxed
                  ${msg.role === 'assistant'
                    ? 'bg-white/[0.04] border border-white/[0.06] text-gray-300'
                    : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                id={`quick-prompt-${prompt.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setInput(prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/[0.06] flex gap-2">
            <input
              ref={inputRef}
              id="ai-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              disabled={isLoading}
            />
            <button
              id="ai-chat-send"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center disabled:opacity-50 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
