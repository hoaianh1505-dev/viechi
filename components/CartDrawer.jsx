'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0,
              width: '100%', maxWidth: '400px',
              background: '#fff',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShoppingBag size={22} color="var(--primary)" /> Giỏ hàng của bạn
              </h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <ShoppingBag size={64} color="var(--text-dim)" style={{ marginBottom: '1.5rem' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Giỏ hàng đang trống.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="btn btn-primary" 
                    style={{ marginTop: '1.5rem' }}
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {cart.map((item) => (
                    <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', background: 'var(--bg-section)' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                        <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                          {item.price.toLocaleString('vi-VN')}đ/{item.unit || 'kg'}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-section)', borderRadius: '8px', padding: '2px' }}>
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity - 0.1)}
                              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-sub)' }}
                            >
                              <Minus size={14} />
                            </button>
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item._id, parseFloat(e.target.value))}
                              step="0.1"
                              style={{ 
                                width: '50px', background: 'none', border: 'none', 
                                textAlign: 'center', fontWeight: 700, fontSize: '0.85rem',
                                color: 'var(--text-main)', outline: 'none'
                              }}
                            />
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity + 0.1)}
                              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-sub)' }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {item.unit || 'kg'}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', marginTop: '0.5rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-card)', background: 'var(--bg-section)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Tổng cộng:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {cartTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <Link 
                  href="/checkout"
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', boxShadow: '0 10px 25px rgba(212,96,10,0.3)', textAlign: 'center', textDecoration: 'none' }}
                  onClick={() => setIsCartOpen(false)}
                >
                  Tiến hành thanh toán
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
