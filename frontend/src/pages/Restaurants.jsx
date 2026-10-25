import { useState, useEffect } from 'react';
import { PlusCircle, Copy, CheckCircle } from 'lucide-react';
import api from '../api/client';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const [newRestaurant, setNewRestaurant] = useState({ 
    name: '', whatsapp_number: '', address: '', phone: '', owner_email: '', owner_password: '' 
  });

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    const res = await api.get('/api/admin/restaurants');
    setRestaurants(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/restaurants', newRestaurant);
      setIsModalOpen(false);
      setNewRestaurant({ name: '', whatsapp_number: '', address: '', phone: '', owner_email: '', owner_password: '' });
      fetchRestaurants();
      alert("Client created successfully! You can now copy their login link.");
    } catch (error) {
      alert(error.response?.data?.detail || "Error adding restaurant");
    }
  };

  const copyToClipboard = (email) => {
    // Hum client ko direct login page ka link aur email denge
    const text = `Welcome to RestoAgent!\n\nLogin Link: http://localhost:5173/owner/login\nEmail: ${email}\nPassword: (Jo aapne set kiya tha)`;
    navigator.clipboard.writeText(text);
    setCopiedId(email);
    setTimeout(() => setCopiedId(null), 2000); // 2 second baad icon wapas normal
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Clients (Restaurants)</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Manage your clients and their login access.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <PlusCircle size={18} /> Add New Client
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
            <tr>
              <th style={{ padding: '16px 20px' }}>Restaurant</th>
              <th style={{ padding: '16px 20px' }}>WhatsApp</th>
              <th style={{ padding: '16px 20px' }}>Login Email</th>
              <th style={{ padding: '16px 20px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 20px', fontWeight: '500' }}>{r.name}</td>
                <td style={{ padding: '16px 20px' }}>{r.whatsapp_number}</td>
                <td style={{ padding: '16px 20px', color: '#3b82f6', fontWeight: '500' }}>{r.owner_email || 'N/A'}</td>
                <td style={{ padding: '16px 20px' }}>
                  <button 
                    onClick={() => copyToClipboard(r.owner_email)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: copiedId === r.owner_email ? '#dcfce3' : '#f1f5f9', color: copiedId === r.owner_email ? '#166534' : '#475569', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                  >
                    {copiedId === r.owner_email ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy Login Link</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Add Restaurant & Owner</h2>
            
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{margin: '10px 0 0 0', fontSize: '16px', color: '#475569'}}>Restaurant Details</h3>
              <input type="text" placeholder="Restaurant Name" required value={newRestaurant.name} onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="WhatsApp Number" required value={newRestaurant.whatsapp_number} onChange={(e) => setNewRestaurant({...newRestaurant, whatsapp_number: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Address" value={newRestaurant.address} onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              
              <h3 style={{margin: '10px 0 0 0', fontSize: '16px', color: '#475569'}}>Owner Login Details</h3>
              <input type="email" placeholder="Owner Email" required value={newRestaurant.owner_email} onChange={(e) => setNewRestaurant({...newRestaurant, owner_email: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Set Password" required value={newRestaurant.owner_password} onChange={(e) => setNewRestaurant({...newRestaurant, owner_password: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}