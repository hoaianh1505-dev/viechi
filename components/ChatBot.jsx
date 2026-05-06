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
  const scrollRef = useRef(null);

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
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
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
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              position: 'absolute', bottom: '4.5rem', right: 0,
              width: '380px', height: '550px',
              background: '#fff', borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              border: '1px solid var(--border-card)'
            }}
          >
            {/* Header */}
            <div style={{ 
              background: 'var(--gradient)', padding: '1.25rem', 
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>VietChi AI Advisor</h4>
                  <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>⚡ Phản hồi siêu tốc</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    if(confirm("Xóa lịch sử chat?")) {
                      setMessages([{ role: 'model', content: 'Chào bạn! Mình đã sẵn sàng hỗ trợ lại từ đầu. 😊' }]);
                      localStorage.removeItem('vietchi_chat_history');
                    }
                  }} 
                  title="Xóa lịch sử"
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}
                >
                  <Loader2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc' }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  gap: '0.6rem',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{ 
                    width: '30px', height: '30px', borderRadius: '50%', 
                    background: msg.role === 'user' ? 'var(--primary)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    flexShrink: 0
                  }}>
                    {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  <div style={{ 
                    padding: '0.85rem 1.1rem', 
                    borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                    background: msg.role === 'user' ? 'var(--primary)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#fff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Bot size={15} />
                  </div>
                  <div style={{ padding: '0.85rem 1.25rem', background: '#fff', borderRadius: '4px 20px 20px 20px', boxShadow: '0 3px 10px rgba(0,0,0,0.04)' }}>
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}
                    >
                      AI đang suy nghĩ...
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!loading && (
              <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderTop: '1px solid #edf2f7' }}>
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '999px',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-sub)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              style={{ padding: '1rem', borderTop: '1px solid var(--border-card)', background: '#fff', display: 'flex', gap: '0.6rem' }}
            >
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Hỏi VietChi AI bất cứ điều gì..."
                style={{ 
                  flex: 1, border: 'none', background: '#f1f5f9', 
                  padding: '0.85rem 1.25rem', borderRadius: '14px', fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'background 0.2s'
                }}
                onFocus={e => e.target.style.background = '#e2e8f0'}
                onBlur={e => e.target.style.background = '#f1f5f9'}
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                style={{ 
                  width: '46px', height: '46px', borderRadius: '14px', 
                  background: 'var(--gradient)', color: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: (loading || !input.trim()) ? 0.5 : 1,
                  boxShadow: '0 4px 10px rgba(212,96,10,0.2)'
                }}
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'var(--gradient)', color: '#fff', border: 'none',
          boxShadow: '0 10px 30px rgba(212,96,10,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
}
