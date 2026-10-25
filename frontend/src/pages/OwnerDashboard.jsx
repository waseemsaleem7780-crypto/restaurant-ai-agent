import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Utensils, ShoppingBag, DollarSign, Plus, Edit, Trash2, X, Upload, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';

// Dummy chart data (baad mein real orders se connect karenge)
const chartData = [
  { name: 'Mon', orders: 12, revenue: 4500 },
  { name: 'Tue', orders: 19, revenue: 7200 },
  { name: 'Wed', orders: 15, revenue: 5600 },
  { name: 'Thu', orders: 25, revenue: 9800 },
  { name: 'Fri', orders: 32, revenue: 12500 },
  { name: 'Sat', orders: 40, revenue: 16000 },
  { name: 'Sun', orders: 38, revenue: 14500 },
];

export default function OwnerDashboard() {
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [file, setFile] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('ownerToken');

  useEffect(() => {
    if (!token) {
      navigate('/owner/login');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [navigate, token]);

    const fetchProfile = async () => {
    try {
      const res = await api.get('/api/restaurant/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Profile Error:", err.response?.data || err.message);
      if (err.code === 'ECONNABORTED') {
        alert("Server jaag raha hai (Free Tier). Baraye meharbani 1 minute baad page refresh karein.");
      } else {
        alert("Profile load nahi ho saki. Check karein ke aapka Render URL sahi hai.");
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/restaurant/orders', { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/restaurant/menu', { name: newItem.name, price: parseFloat(newItem.price) }, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false); setNewItem({ name: '', price: '' }); fetchProfile();
    } catch (error) { alert("Error adding item."); }
  };

  const handlePDFUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pehle PDF select karein");
    const formData = new FormData(); formData.append("file", file);
    try {
      const res = await api.post('/api/restaurant/upload-menu-pdf', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      alert(`Success! ${res.data.items_found} menu items found and AI trained.`);
      setFile(null); fetchProfile();
    } catch (error) { alert(error.response?.data?.detail || "Upload failed"); }
  };

  const handleLogout = () => { localStorage.removeItem('ownerToken'); navigate('/owner/login'); };

  if (!profile) return <div style={{ padding: '50px', fontSize: '20px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f9fafb', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      
      {/* 🍔 DARK RESTAURANT SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column', padding: '24px 20px', flexShrink: 0, borderRight: '1px solid #374151' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #374151' }}>
          <div style={{ background: '#f97316', padding: '10px', borderRadius: '12px' }}><Utensils size={24} color="white" /></div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{profile.name}</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Owner Panel</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div onClick={() => setActiveTab('orders')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === 'orders' ? 'rgba(249, 115, 22, 0.1)' : 'transparent', borderLeft: activeTab === 'orders' ? '4px solid #f97316' : '4px solid transparent', color: activeTab === 'orders' ? '#f97316' : '#d1d5db', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
            <ShoppingBag size={20} /><span>Live Orders</span>
          </div>
          <div onClick={() => setActiveTab('menu')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === 'menu' ? 'rgba(249, 115, 22, 0.1)' : 'transparent', borderLeft: activeTab === 'menu' ? '4px solid #f97316' : '4px solid transparent', color: activeTab === 'menu' ? '#f97316' : '#d1d5db', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
            <Utensils size={20} /><span>Manage Menu</span>
          </div>
          <div onClick={() => setActiveTab('analytics')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === 'analytics' ? 'rgba(249, 115, 22, 0.1)' : 'transparent', borderLeft: activeTab === 'analytics' ? '4px solid #f97316' : '4px solid transparent', color: activeTab === 'analytics' ? '#f97316' : '#d1d5db', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
            <DollarSign size={20} /><span>Analytics</span>
          </div>
        </nav>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <LogOut size={20} /><span>Logout</span>
        </button>
      </div>

      {/* 🍕 MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ margin: 0, color: '#111827', fontSize: '24px' }}>
            {activeTab === 'orders' && 'Live Orders'}
            {activeTab === 'menu' && 'Manage Menu'}
            {activeTab === 'analytics' && 'Analytics'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span style={{ fontSize: '14px', color: '#6b7280' }}>Status:</span>
             <span style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
               <span style={{ height: '8px', width: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span> Online
             </span>
          </div>
        </div>

        <div style={{ padding: '30px 40px', flex: 1, overflowY: 'auto' }}>
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Total Orders Today</p>
                  <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#111827' }}>{orders.length}</h2>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Pending Orders</p>
                  <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#f97316' }}>0</h2>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Revenue Today</p>
                  <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#10b981' }}>0 PKR</h2>
                </div>
              </div>

              {/* Chart */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>Weekly Sales Overview</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
                    <TrendingUp size={16} /> +15% is week
                  </div>
                </div>
                <div style={{ height: '250px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders List */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                <h3>No active orders right now.</h3>
                <p>When a customer places an order on WhatsApp, it will appear here.</p>
              </div>
            </div>
          )}

          {/* MENU TAB (Same as before, but with new UI) */}
          {activeTab === 'menu' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>Add items manually or upload your menu PDF.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <form onSubmit={handlePDFUpload} style={{ display: 'flex', gap: '5px' }}>
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px' }} />
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <Upload size={18} /> Upload PDF
                    </button>
                  </form>
                  <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <Plus size={18} /> Add Menu Item
                  </button>
                </div>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '13px' }}>
                    <tr>
                      <th style={{ padding: '16px 20px' }}>Item Name</th>
                      <th style={{ padding: '16px 20px' }}>Price (PKR)</th>
                      <th style={{ padding: '16px 20px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(profile.menu).length === 0 ? (
                      <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>No items in menu yet.</td></tr>
                    ) : (
                      Object.entries(profile.menu).map(([itemName, details], index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '500' }}>{itemName}</td>
                          <td style={{ padding: '16px 20px' }}>{details.price} PKR</td>
                          <td style={{ padding: '16px 20px', display: 'flex', gap: '10px' }}>
                            <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={18} /></button>
                            <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
             <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <DollarSign size={48} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                <h3>Analytics Coming Soon</h3>
                <p>Detailed reports will be available here.</p>
             </div>
          )}

        </div>
      </div>

      {/* 🟠 ADD MENU MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#111827' }}>Add Menu Item</h2>
              <X size={24} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleAddMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#374151' }}>Item Name</label>
                <input type="text" placeholder="e.g. Zinger Burger" required value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#374151' }}>Price (PKR)</label>
                <input type="number" placeholder="e.g. 450" required value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}