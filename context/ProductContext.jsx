'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import initialData from '@/data/database.json';

const ProductContext = createContext();

const API = '/api';

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [contact] = useState(initialData.contact);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);

  // Check server & load data
  useEffect(() => {
    let timer;
    const init = async () => {
      try {
        const res = await fetch(`${API}/health`);
        if (res.ok) {
          const [pRes, bRes] = await Promise.all([
            fetch(`${API}/products`),
            fetch(`${API}/banners`),
          ]);
          if (pRes.ok) setProducts(await pRes.json());
          if (bRes.ok) setBanners(await bRes.json());
          
          setServerOnline(true);
          setLoading(false);
          if (timer) clearInterval(timer);
        } else {
          throw new Error('Server not ready');
        }
      } catch (err) {
        setServerOnline(false);
        // Load từ local nếu server chưa sẵn sàng
        if (products.length === 0) {
          const lp = localStorage.getItem('vietchi_products');
          const lb = localStorage.getItem('vietchi_banners');
          setProducts(lp ? JSON.parse(lp) : initialData.products);
          setBanners(lb ? JSON.parse(lb) : initialData.banners);
        }
        setLoading(false);
      }
    };

    init();
    timer = setInterval(() => {
      if (!serverOnline) init();
    }, 3000);

    const loggedIn = localStorage.getItem('vietchi_admin_logged');
    if (loggedIn === 'true') setIsAdmin(true);

    return () => clearInterval(timer);
  }, [serverOnline]);

  // ---- Products ----
  const addProduct = async (data) => {
    if (serverOnline) {
      const res = await fetch(`${API}/products`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      });
      if (res.ok) { 
        const p = await res.json(); 
        setProducts(prev => [p, ...prev]); 
      }
    } else {
      const p = { ...data, id: Date.now().toString() };
      const next = [p, ...products];
      setProducts(next);
      localStorage.setItem('vietchi_products', JSON.stringify(next));
    }
  };

  const updateProduct = async (id, data) => {
    if (serverOnline) {
      const res = await fetch(`${API}/products/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      });
      if (res.ok) { 
        const p = await res.json(); 
        setProducts(prev => prev.map(x => (x._id === id || x.id === id) ? p : x)); 
      }
    } else {
      const next = products.map(x => (x.id === id ? { ...data, id } : x));
      setProducts(next);
      localStorage.setItem('vietchi_products', JSON.stringify(next));
    }
  };

  const deleteProduct = async (id) => {
    if (serverOnline) {
      await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(x => x._id !== id && x.id !== id));
    } else {
      const next = products.filter(x => x.id !== id);
      setProducts(next);
      localStorage.setItem('vietchi_products', JSON.stringify(next));
    }
  };

  // ---- Banners ----
  const addBanner = async (data) => {
    if (serverOnline) {
      const res = await fetch(`${API}/banners`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      });
      if (res.ok) { 
        const b = await res.json(); 
        setBanners(prev => [...prev, b]); 
      }
    } else {
      const b = { ...data, id: 'b' + Date.now() };
      const next = [...banners, b];
      setBanners(next);
      localStorage.setItem('vietchi_banners', JSON.stringify(next));
    }
  };

  const updateBanner = async (id, data) => {
    if (serverOnline) {
      const res = await fetch(`${API}/banners/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      });
      if (res.ok) { 
        const b = await res.json(); 
        setBanners(prev => prev.map(x => (x._id === id || x.id === id) ? b : x)); 
      }
    } else {
      const next = banners.map(x => (x.id === id ? { ...data, id } : x));
      setBanners(next);
      localStorage.setItem('vietchi_banners', JSON.stringify(next));
    }
  };

  const deleteBanner = async (id) => {
    if (serverOnline) {
      await fetch(`${API}/banners/${id}`, { method: 'DELETE' });
      setBanners(prev => prev.filter(x => x._id !== id && x.id !== id));
    } else {
      const next = banners.filter(x => x.id !== id);
      setBanners(next);
      localStorage.setItem('vietchi_banners', JSON.stringify(next));
    }
  };

  // ---- Auth ----
  const login = (username, password) => {
    if (username === initialData.admin.username && password === initialData.admin.password) {
      setIsAdmin(true);
      localStorage.setItem('vietchi_admin_logged', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('vietchi_admin_logged');
  };

  // Helper: get stable id
  const getId = (item) => item?._id || item?.id;

  return (
    <ProductContext.Provider value={{
      products, banners, contact, isAdmin, loading, serverOnline,
      addProduct, updateProduct, deleteProduct,
      addBanner, updateBanner, deleteBanner,
      login, logout, getId,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
