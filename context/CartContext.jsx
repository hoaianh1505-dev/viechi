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

  // 1. Initial Load: Try DB first if logged in, else localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const res = await fetch('/api/cart');
          const data = await res.json();
          if (data.cart) {
            setCart(data.cart);
            return;
          }
        } catch (e) {}
      } else {
        // Clear cart on logout
        setCart([]);
        localStorage.removeItem('vietchi_cart');
      }
    };
    loadCart();
  }, [user]);

  // 2. Sync to localStorage (Always) and DB (If logged in)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    localStorage.setItem('vietchi_cart', JSON.stringify(cart));

    if (user) {
      const syncCart = async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
          });
        } catch (e) {}
      };
      // Simple debounce/delay could be added here if needed
      syncCart();
    }
  }, [cart, user]);

  const addToCart = (product, quantity = 1) => {
    if (!user) {
      router.push('/login');
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
