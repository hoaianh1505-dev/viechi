'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';

export default function Loading() {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 9999, 
      background: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '1.5rem'
    }}>
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut" 
        }}
        style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '24px', 
          background: 'var(--gradient)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 15px 35px rgba(212,96,10,0.3)'
        }}
      >
        <Fish size={40} color="#fff" />
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 800, 
          background: 'var(--gradient)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          VietChi
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Đang tải, vui lòng chờ...
          </span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }}
            style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}
          />
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}
          />
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}
          />
        </div>
      </div>
    </div>
  );
}
