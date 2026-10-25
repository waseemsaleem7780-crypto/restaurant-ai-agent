import { useState, useEffect } from 'react';
import { Store, DollarSign, Activity, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';

// Dummy Chart Data (Baad mein hum isko real orders se connect karenge)
const chartData = [
  { name: 'Mon', messages: 40, orders: 24 },
  { name: 'Tue', messages: 30, orders: 13 },
  { name: 'Wed', messages: 20, orders: 58 },
  { name: 'Thu', messages: 27, orders: 39 },
  { name: 'Fri', messages: 18, orders: 48 },
  { name: 'Sat', messages: 23, orders: 38 },
  { name: 'Sun', messages: 34, orders: 43 },
];

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    api.get('/api/admin/restaurants').then(res => setRestaurants(res.data));
  }, []);

  return (
    <div>
      {/* HEADER WITH LIVE STATUS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Overview</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Welcome back, Super Admin!</p>
        </div>

        {/* UNIQUE FEATURE: Live Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', padding: '8px 16px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
          <span style={{ position: 'relative', display: 'flex', height: '10px', width: '10px' }}>
            <span style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#10b981', opacity: 0.75 }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '10px', width: '10px', backgroundColor: '#10b981' }}></span>
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>AI Agent Online</span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px' }}><Store size={22} color="#3b82f6" /></div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', backgroundColor: '#dcfce3', padding: '4px 8px', borderRadius: '12px' }}>+12%</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Total Restaurants</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', color: '#0f172a' }}>{restaurants.length}</h2>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px' }}><DollarSign size={22} color="#10b981" /></div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', backgroundColor: '#dcfce3', padding: '4px 8px', borderRadius: '12px' }}>+5%</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Total Revenue</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', color: '#0f172a' }}>0 <span style={{fontSize: '16px'}}>PKR</span></h2>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '8px' }}><Activity size={22} color="#f59e0b" /></div>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '12px' }}>-2%</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Active Orders</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', color: '#0f172a' }}>0</h2>
        </div>

      </div>

      {/* CHARTS SECTION (UNIQUE FEATURE) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* Line Chart */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>AI Interactions</h3>
            <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div> Messages</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div> Orders</span>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMsg)" />
                <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Widget */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
           <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
             <TrendingUp size={40} color="#3b82f6" />
           </div>
           <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>System Performance</h3>
           <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Aapka AI agent pichle 7 dinon mein 92% messages ka khud jawab diya hai bina kisi human help ke.</p>
        </div>

      </div>

    </div>
  );
}