'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Trash2, Shield, User, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d4600a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Đã xóa người dùng');
          fetchUsers();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa người dùng');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Quản lý người dùng</h1>
          <p style={{ color: '#64748b' }}>Danh sách khách hàng và quản trị viên trong hệ thống.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, sđt..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', 
              borderRadius: '16px', border: '1px solid #e2e8f0',
              outline: 'none', background: '#fff', fontSize: '0.9rem'
            }} 
          />
        </div>
      </header>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TỔNG NGƯỜI DÙNG</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{users.length}</h3>
          </div>
        </div>
        <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>QUẢN TRỊ VIÊN</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{users.filter(u => u.role === 'admin').length}</h3>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>NGƯỜI DÙNG</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>LIÊN HỆ</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>VAI TRÒ</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>NGÀY TẠO</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: user.role === 'admin' ? 'var(--gradient)' : '#f1f5f9',
                        color: user.role === 'admin' ? '#fff' : '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                      }}>
                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.1rem' }}>{user.fullName}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {user._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                        <Mail size={14} /> {user.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                        <Phone size={14} /> {user.phone || 'Chưa cập nhật'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800,
                      background: user.role === 'admin' ? '#fff1f2' : '#f0fdf4',
                      color: user.role === 'admin' ? '#e11d48' : '#16a34a',
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                    }}>
                      {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                      {user.role === 'admin' ? 'ADMIN' : 'KHÁCH HÀNG'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === 'admin'}
                      style={{ 
                        padding: '0.6rem', borderRadius: '10px', border: 'none', 
                        background: '#fef2f2', color: '#ef4444', cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', opacity: user.role === 'admin' ? 0.4 : 1
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              <Users size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Không tìm thấy người dùng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
