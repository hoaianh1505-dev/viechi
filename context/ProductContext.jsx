'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({ 
    zalo: '0987.654.321', 
    facebook: 'https://facebook.com/vietchi.dacsan' 
  });

  const fetchAll = async () => {
    try {
      const [resP, resB] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/banners')
      ]);
      const dataP = await resP.json();
      const dataB = await resB.json();
      setProducts(dataP);
      setBanners(dataB);
    } catch (e) {
      console.error('Lỗi tải dữ liệu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addProduct = async (p) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    if (res.ok) fetchAll();
  };

  const updateProduct = async (id, p) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    if (res.ok) fetchAll();
  };

  const deleteProduct = async (id) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAll();
  };

  const getId = (item) => item._id || item.id;

  return (
    <ProductContext.Provider value={{ 
      products, 
      banners, 
      contact,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      getId,
      refresh: fetchAll
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
