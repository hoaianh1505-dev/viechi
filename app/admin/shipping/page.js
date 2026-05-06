'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, MapPin, DollarSign, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminShipping() {
  const [fees, setFees] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFee, setNewFee] = useState({ province: '', fee: '' });

  useEffect(() => {
    fetchFees();
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  const fetchFees = async () => {
    try {
      const res = await fetch('/api/shipping');
      const data = await res.json();
      setFees(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Lỗi tải phí ship');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newFee.province || !newFee.fee) return toast.error('Vui lòng nhập đủ thông tin');
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFee)
      });
      if (res.ok) {
        toast.success('Đã cập nhật phí ship');
        setNewFee({ province: '', fee: '' });
        fetchFees();
      }
    } catch (error) {
      toast.error('Lỗi khi lưu');
    }
  };

  const deleteFee = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa phí ship này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/shipping/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Đã xóa');
          fetchFees();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Phí vận chuyển</h1>
        <p style={{ color: '#64748b' }}>Thiết lập phí giao hàng theo từng tỉnh thành.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
        {/* Form thêm mới */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Plus size={20} color="var(--primary)" /> Thêm phí mới
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tỉnh / Thành phố</label>
              <select 
                value={newFee.province} 
                onChange={e => setNewFee({...newFee, province: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none' }}
              >
                <option value="">Chọn tỉnh thành</option>
                {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Phí giao hàng (VNĐ)</label>
              <input 
                type="number" 
                value={newFee.fee} 
                onChange={e => setNewFee({...newFee, fee: e.target.value})}
                placeholder="Ví dụ: 30000"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none' }}
              />
            </div>
            <button 
              onClick={handleSave}
              style={{ width: '100%', padding: '1rem', background: 'var(--gradient)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 8px 20px rgba(212,96,10,0.2)' }}
            >
              <Save size={18} /> Lưu thiết lập
            </button>
          </div>
        </div>

        {/* Danh sách hiện tại */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.85rem' }}>TỈNH / THÀNH PHỐ</th>
                <th style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.85rem' }}>PHÍ SHIP</th>
                <th style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.85rem', textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <MapPin size={16} color="var(--primary)" /> {f.province}
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {f.fee.toLocaleString()}đ
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <button onClick={() => deleteFee(f._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {fees.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Chưa có thiết lập phí ship nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
