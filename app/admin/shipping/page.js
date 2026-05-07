'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, Save, Loader2, Search, MapPin, 
  AlertCircle, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AdminShippingPage = () => {
  const [provinces, setProvinces] = useState([]);
  const [shippingList, setShippingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editData, setEditData] = useState({
    provinceCode: '',
    provinceName: '',
    fee: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Provinces from API
        const pRes = await fetch('https://provinces.open-api.vn/api/?depth=1');
        const pData = await pRes.json();
        setProvinces(pData);

        // Fetch Shipping Fees from our DB
        const sRes = await fetch('/api/admin/shipping');
        const sData = await sRes.json();
        setShippingList(sData);
      } catch (error) {
        toast.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editData.provinceCode) return toast.error('Vui lòng chọn tỉnh thành');
    
    setSaving(true);
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        const updated = await res.json();
        setShippingList(prev => {
          const exists = prev.find(s => s.provinceCode === updated.provinceCode);
          if (exists) return prev.map(s => s.provinceCode === updated.provinceCode ? updated : s);
          return [...prev, updated].sort((a, b) => a.provinceName.localeCompare(b.provinceName));
        });
        toast.success(`Đã cập nhật phí ship cho ${editData.provinceName}`);
        setEditData({ provinceCode: '', provinceName: '', fee: 0 });
      }
    } catch (error) {
      toast.error('Lỗi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFeeForProvince = (code) => {
    const item = shippingList.find(s => s.provinceCode === String(code));
    return item ? item.fee : 0;
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" /> Đang tải...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>Quản lý Phí Vận Chuyển</h1>
        <p style={{ color: '#64748b' }}>Thiết lập phí giao hàng chi tiết cho từng tỉnh thành trên cả nước.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }} className="admin-grid-layout">
        
        {/* Left: Edit Form */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={20} color="var(--primary)" /> Thiết lập nhanh
          </h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Chọn Tỉnh/Thành phố</label>
              <select 
                value={editData.provinceCode}
                onChange={(e) => {
                  const p = provinces.find(p => String(p.code) === e.target.value);
                  setEditData({ 
                    ...editData, 
                    provinceCode: e.target.value, 
                    provinceName: p?.name || '',
                    fee: getFeeForProvince(e.target.value)
                  });
                }}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: 700 }}
              >
                <option value="">-- Chọn tỉnh thành --</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Phí vận chuyển (VNĐ)</label>
              <input 
                type="number"
                value={editData.fee === 0 ? '' : editData.fee}
                onChange={(e) => setEditData({...editData, fee: e.target.value === '' ? 0 : Number(e.target.value)})}
                placeholder="Nhập số tiền..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: 700 }}
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                background: 'var(--gradient)', color: '#fff', padding: '1rem', 
                borderRadius: '16px', border: 'none', fontWeight: 900, 
                cursor: 'pointer', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', gap: '0.7rem', marginTop: '1rem',
                boxShadow: '0 8px 25px rgba(212,96,10,0.2)'
              }}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Lưu cấu hình
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f0f9ff', borderRadius: '20px', display: 'flex', gap: '0.8rem' }}>
            <AlertCircle size={20} color="#0369a1" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: '#0369a1', lineHeight: 1.5 }}>
              Lưu ý: Nếu một tỉnh thành không được thiết lập phí ship, hệ thống sẽ mặc định lấy <b>Phí vận chuyển mặc định</b> trong phần Cài đặt chung.
            </p>
          </div>
        </section>

        {/* Right: List Table */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Bảng giá vận chuyển</h3>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Tìm tỉnh thành..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Tỉnh / Thành phố</th>
                  <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Phí vận chuyển</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {provinces.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
                  const savedFee = shippingList.find(s => s.provinceCode === String(p.code));
                  return (
                    <tr key={p.code} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#1e293b' }}>{p.name}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: savedFee ? 'var(--primary)' : '#94a3b8' }}>
                        {savedFee ? `${savedFee.fee.toLocaleString()}đ` : 'Chưa thiết lập'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => setEditData({ provinceCode: String(p.code), provinceName: p.name, fee: savedFee?.fee || 0 })}
                          style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminShippingPage;
