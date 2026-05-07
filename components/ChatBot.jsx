'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Chào bạn! Mình là VietChi AI. Mình có thể giúp gì cho bạn trong việc lựa chọn đặc sản hôm nay nhỉ? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vietchi_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history");
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('vietchi_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textInput) => {
    const text = textInput || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await res.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: 'model', content: data.content }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'model', content: "Hệ thống AI đang bận một chút, bạn thử lại sau giây lát nhé! 🙏" }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line.split('**').map((part, j) => (
          j % 2 === 1 ? <strong key={j} style={{ fontWeight: 800, color: 'inherit' }}>{part}</strong> : part
        ))}
        <br />
      </span>
    ));
  };

  const quickActions = [
    { label: '🚚 Kiểm tra đơn hàng', prompt: 'Tôi muốn kiểm tra trạng thái đơn hàng' },
    { label: '🎁 Tư vấn quà biếu', prompt: 'Tư vấn cho tôi các loại khô làm quà biếu sang trọng' },
    { label: '🔥 Món bán chạy nhất', prompt: 'Hiện tại loại khô nào đang bán chạy nhất?' },
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: isMobile ? '1rem' : '2rem', 
      right: isMobile ? '1rem' : '2rem', 
      zIndex: 2000 
    }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed', 
              bottom: isMobile ? '0' : '5.5rem', 
              right: isMobile ? '0' : '2rem',
              width: isMobile ? '100vw' : '400px', 
              height: isMobile ? '100vh' : '600px',
              background: '#fff', 
              borderRadius: isMobile ? '0' : '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              border: isMobile ? 'none' : '1px solid rgba(212,96,10,0.1)',
              zIndex: 2001
            }}
          >
            {/* Header */}
            <div style={{ 
              background: 'var(--gradient)', 
              padding: isMobile ? '1.5rem 1.25rem 1.25rem' : '1.25rem', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(212,96,10,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '42px', height: '42px', 
                  borderRadius: '14px', 
                  background: 'rgba(255,255,255,0.25)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  <Bot size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>VietChi AI Assistant</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }}></span>
                    <p style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>Đang trực tuyến</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => {
                    if(confirm("Xóa lịch sử trò chuyện?")) {
                      setMessages([{ role: 'model', content: 'Chào bạn! Mình đã sẵn sàng hỗ trợ lại từ đầu. 😊' }]);
                      localStorage.removeItem('vietchi_chat_history');
                    }
                  }} 
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
                >
                  <Loader2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '1.5rem 1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem', 
                background: '#fff9f5', // Tone cam nhạt đồng bộ web
                scrollBehavior: 'smooth'
              }}
            >
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: isMobile ? '90%' : '85%',
                    display: 'flex',
                    gap: '0.75rem',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '10px', 
                    background: msg.role === 'user' ? 'var(--primary)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    flexShrink: 0,
                    border: msg.role === 'user' ? 'none' : '1px solid #ffe2cc'
                  }}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div style={{ 
                    padding: '1rem 1.25rem', 
                    borderRadius: msg.role === 'user' ? '22px 4px 22px 22px' : '4px 22px 22px 22px',
                    background: msg.role === 'user' ? 'var(--primary)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    boxShadow: msg.role === 'user' ? '0 10px 20px -5px rgba(212,96,10,0.3)' : '0 4px 15px rgba(0,0,0,0.03)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {renderContent(msg.content)}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffe2cc' }}>
                    <Bot size={16} />
                  </div>
                  <div style={{ padding: '0.85rem 1.25rem', background: '#fff', borderRadius: '4px 20px 20px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map(dot => (
                        <motion.div
                          key={dot}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: dot * 0.1 }}
                          style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', opacity: 0.6 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!loading && (
              <div style={{ 
                padding: '0.85rem 1rem', 
                background: '#fff', 
                display: 'flex', 
                gap: '0.6rem', 
                overflowX: 'auto', 
                borderTop: '1px solid #fef2e8',
                scrollbarWidth: 'none'
              }}>
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '100px',
                      background: '#fef2e8',
                      border: '1px solid #ffd8bf',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              style={{ 
                padding: isMobile ? '1rem 1rem 2.5rem' : '1.25rem', 
                borderTop: '1px solid #fef2e8', 
                background: '#fff', 
                display: 'flex', 
                gap: '0.75rem' 
              }}
            >
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Hỏi bất cứ điều gì..."
                style={{ 
                  flex: 1, border: '1px solid #ffe2cc', background: '#fff', 
                  padding: '0.9rem 1.25rem', borderRadius: '16px', fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                style={{ 
                  width: '52px', height: '52px', borderRadius: '16px', 
                  background: 'var(--gradient)', color: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: (loading || !input.trim()) ? 0.5 : 1,
                  boxShadow: '0 8px 20px rgba(212,96,10,0.25)'
                }}
              >
                <Send size={22} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: isMobile ? '56px' : '64px', 
          height: isMobile ? '56px' : '64px', 
          borderRadius: '20px',
          background: 'var(--gradient)', color: '#fff', border: 'none',
          boxShadow: '0 12px 30px rgba(212,96,10,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
}
