'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function ChatBot() {
  const { user } = useUser();
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

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      // Sử dụng setTimeout để đảm bảo DOM đã cập nhật chiều cao mới nhất
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages, loading, isOpen]);

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
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          user: user // Gửi thông tin user hiện tại (có thể là admin)
        })
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
    { label: '🚚 Kiểm tra đơn hàng', prompt: 'Tôi muốn kiểm tra trạng thái đơn hàng của mình' },
    { label: '🔥 Bán chạy nhất', prompt: 'Sản phẩm nào đang bán chạy nhất tại cửa hàng?' },
    { label: '🎁 Tư vấn quà biếu', prompt: 'Tư vấn cho tôi các loại đặc sản làm quà biếu sang trọng' },
    { label: '💰 Phí vận chuyển', prompt: 'Phí vận chuyển được tính như thế nào?' },
    { label: '⏳ Thời gian giao hàng', prompt: 'Giao hàng về tỉnh mất bao lâu thì nhận được?' },
    { label: '🦐 Tôm khô loại 1', prompt: 'Cửa hàng mình có tôm khô loại 1 cao cấp không?' },
    { label: '📦 Hút chân không', prompt: 'Các sản phẩm có được đóng gói hút chân không không?' },
    { label: '👁️ Kiểm tra hàng', prompt: 'Tôi có được kiểm tra hàng trước khi thanh toán không?' },
    { label: '💳 Thanh toán', prompt: 'Cửa hàng hỗ trợ những hình thức thanh toán nào?' },
    { label: '🧧 Khuyến mãi', prompt: 'Hôm nay có chương trình khuyến mãi gì đặc biệt không?' },
    { label: '❄️ Cách bảo quản', prompt: 'Hướng dẫn tôi cách bảo quản các loại khô để được lâu' },
    { label: '🧾 Hóa đơn đỏ', prompt: 'Bên mình có hỗ trợ xuất hóa đơn VAT không?' },
    { label: '🏢 Giá sỉ', prompt: 'Tôi muốn mua số lượng lớn, chính sách giá sỉ thế nào?' },
    { label: '🧂 Độ mặn', prompt: 'Cửa hàng có loại khô nào mặn đậm đà hoặc mặn vừa không?' },
    { label: '🥦 Ít mặn/Vị thanh', prompt: 'Tư vấn cho tôi các loại khô ít mặn, phù hợp cho người già hoặc người ăn kiêng' },
    { label: '🗺️ Khẩu vị vùng miền', prompt: 'Khẩu vị miền Bắc và miền Trung thì nên chọn loại đặc sản nào?' },
    { label: '🛶 Đặc sản miền Tây', prompt: 'Những món khô nào là đặc sản chính gốc miền Tây bán chạy nhất?' },
    { label: '📍 Địa chỉ', prompt: 'Cửa hàng mình có địa chỉ ở đâu?' },
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: isMobile ? '1rem' : '2rem', 
      right: isMobile ? '1rem' : '2rem', 
      zIndex: 2000 
    }}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: isMobile ? '50px' : '64px',
          height: isMobile ? '50px' : '64px',
          borderRadius: '50%',
          background: 'var(--gradient)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(212, 96, 10, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        {isOpen ? <X size={isMobile ? 20 : 32} /> : <MessageSquare size={isMobile ? 20 : 32} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: isMobile ? 0 : '100px',
              right: isMobile ? 0 : '30px',
              width: isMobile ? '100%' : '400px',
              height: isMobile ? '70vh' : '500px',
              background: '#fff',
              borderRadius: isMobile ? '32px 32px 0 0' : '28px',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1001,
              border: isMobile ? 'none' : '1px solid rgba(212, 96, 10, 0.1)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: isMobile ? '1rem' : '1.25rem',
              background: 'var(--gradient)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.2)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  <Bot size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>VietChi Super AI</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <motion.span 
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }}
                    ></motion.span>
                    <p style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600, margin: 0 }}>Sẵn sàng tư vấn 24/7</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => {
                    if(confirm("Xóa toàn bộ lịch sử trò chuyện?")) {
                      setMessages([{ role: 'model', content: 'Chào bạn! Siêu trợ lý VietChi đã sẵn sàng hỗ trợ lại từ đầu. Mình có thể giúp gì cho bạn? 😊' }]);
                      localStorage.removeItem('vietchi_chat_history');
                    }
                  }} 
                  title="Xóa lịch sử"
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', transition: '0.2s' }}
                >
                  <Loader2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex' }}
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
                padding: '1.75rem 1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem', 
                background: 'linear-gradient(to bottom, #fffcf9, #fff)', 
                scrollBehavior: 'smooth'
              }}
            >
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i} 
                  style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: isMobile ? '92%' : '85%',
                    display: 'flex',
                    gap: '0.75rem',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '12px', 
                    background: msg.role === 'user' ? 'var(--gradient)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    flexShrink: 0,
                    border: msg.role === 'user' ? 'none' : '1px solid #fef2e8'
                  }}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
                  </div>
                  <div style={{ 
                    padding: '1.1rem 1.4rem', 
                    borderRadius: msg.role === 'user' ? '24px 4px 24px 24px' : '4px 24px 24px 24px',
                    background: msg.role === 'user' ? 'var(--gradient)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    fontSize: '0.98rem',
                    lineHeight: 1.6,
                    boxShadow: msg.role === 'user' ? '0 12px 25px -8px rgba(212,96,10,0.4)' : '0 8px 20px rgba(0,0,0,0.04)',
                    whiteSpace: 'pre-wrap',
                    border: msg.role === 'user' ? 'none' : '1px solid #fef2e8'
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
    </div>
  );
}
