import { useState, useEffect } from 'react';
import { Store, DollarSign, Activity } from 'lucide-react';
import api from '../api/client';

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    api.get('/api/admin/restaurants').then(res => setRestaurants(res.data));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Overview</h1>
        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Welcome back, Super Admin!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '10px' }}><Store size={20} color="#3b82f6" /></div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Total Restaurants</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#0f172a' }}>{restaurants.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '10px' }}><DollarSign size={20} color="#10b981" /></div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Total Revenue</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#0f172a' }}>0 <span style={{fontSize: '16px'}}>PKR</span></h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '10px' }}><Activity size={20} color="#f59e0b" /></div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Active Orders</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#0f172a' }}>0</h2>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}><h3 style={{ margin: 0 }}>Registered Restaurants</h3></div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
            <tr>
              <th style={{ padding: '16px 20px' }}>Name</th>
              <th style={{ padding: '16px 20px' }}>WhatsApp</th>
              <th style={{ padding: '16px 20px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 20px', fontWeight: '500' }}>{r.name}</td>
                <td style={{ padding: '16px 20px' }}>{r.whatsapp_number}</td>
                <td style={{ padding: '16px 20px' }}><span style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}