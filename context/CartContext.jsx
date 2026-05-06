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

  // 1. Initial Load & Syncing
  useEffect(() => {
    const loadAndSyncCart = async () => {
      // Always load from localStorage first for instant UI
      const savedCart = localStorage.getItem('vietchi_cart');
      let localCart = [];
      if (savedCart) {
        try { localCart = JSON.parse(savedCart); setCart(localCart); } catch (e) {}
      }

      if (user) {
        try {
          const res = await fetch('/api/cart');
          const data = await res.json();
          
          if (data.cart && data.cart.length > 0) {
            // MERGE LOGIC: If local guest cart has items, merge them with DB cart
            if (localCart.length > 0) {
              const merged = [...data.cart];
              localCart.forEach(localItem => {
                const exists = merged.find(dbItem => dbItem._id === localItem._id);
                if (exists) {
                  exists.quantity += localItem.quantity;
                } else {
                  merged.push(localItem);
                }
              });
              setCart(merged);
              // Save merged cart back to DB immediately
              fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: merged })
              });
            } else {
              setCart(data.cart);
            }
          } else if (localCart.length > 0) {
            // If DB is empty but local has items, push local to DB
            fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cart: localCart })
            });
          }
        } catch (e) {
          console.error("Cart sync error:", e);
        }
      }
    };
    loadAndSyncCart();
  }, [user]);

  // 2. Continuous Sync to localStorage and DB
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    localStorage.setItem('vietchi_cart', JSON.stringify(cart));

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
