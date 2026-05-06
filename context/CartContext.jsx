'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isInitialMount = useRef(true);

  // 1. Initial Load & Syncing from DB
  useEffect(() => {
    const fetchCartFromDB = async () => {
      if (user) {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            setCart(data.cart || []);
          }
        } catch (e) {
          console.error("Cart fetch error:", e);
        }
      } else {
        // If user logs out, clear the local state immediately
        setCart([]);
      }
    };
    fetchCartFromDB();
  }, [user]);

  // 2. Auto-sync to DB when cart changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (user) {
      const timeoutId = setTimeout(() => {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart })
        }).catch(err => console.error("Auto-sync failed:", err));
      }, 500); // Debounce to avoid too many requests
      return () => clearTimeout(timeoutId);
    }
  }, [cart, user]);

  const addToCart = (product, quantity = 1) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
        icon: '🔒',
        duration: 3000
      });
      // Optionally open login side/modal here if you have one
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => 
          item._id === product._id 
            ? { ...item, quantity: parseFloat((item.quantity + quantity).toFixed(2)) } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item._id === productId ? { ...item, quantity: parseFloat(quantity.toFixed(2)) } : item
    ));
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: [] })
        });
      } catch (e) {}
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartTotal, 
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
