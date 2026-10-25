import { useState, useEffect } from 'react';
import { PlusCircle, Copy, CheckCircle, X } from 'lucide-react';
import api from '../api/client';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Naya State: Success Modal ke liye
  const [createdClient, setCreatedClient] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [newRestaurant, setNewRestaurant] = useState({ 
    name: '', whatsapp_number: '', address: '', phone: '', 
    owner_email: '', owner_password: '',
    whatsapp_provider: 'web2c',
    whatsapp_api_key: ''
  });

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    const res = await api.get('/api/admin/restaurants');
    setRestaurants(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/restaurants', newRestaurant);
      setIsModalOpen(false);
      
      // Success modal ke liye data save karo
      setCreatedClient({
        name: newRestaurant.name,
        email: newRestaurant.owner_email,
        password: newRestaurant.owner_password,
        link: 'https://restaurant-ai-agent-omega.vercel.app/owner/login'
      });
      setIsSuccessModalOpen(true); // Success popup kholo

      setNewRestaurant({ name: '', whatsapp_number: '', address: '', phone: '', owner_email: '', owner_password: '', whatsapp_provider: 'web2c', whatsapp_api_key: '' });
      fetchRestaurants();
    } catch (error) {
      alert(error.response?.data?.detail || "Error adding restaurant");
    }
  };

  const copyToClipboard = (email) => {
    const text = `Welcome to RestoAgent!\n\nLogin Link: https://restaurant-ai-agent-omega.vercel.app/owner/login\nEmail: ${email}\nPassword: (Jo aapne set kiya tha)`;
    navigator.clipboard.writeText(text);
    setCopiedId(email);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Client ko details bhejne ke liye text copy karna
  const copyClientDetails = () => {
    const text = `Welcome to RestoAgent! 🍽️\n\nAapka restaurant account tayyar hai.\n\nLogin Link: ${createdClient.link}\nEmail: ${createdClient.email}\nPassword: ${createdClient.password}\n\nYeh details safe rakhein.`;
    navigator.clipboard.writeText(text);
    alert("Details Copy ho gayi hain! Ab aap isko client ko WhatsApp kar sakte hain.");
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Clients (Restaurants)</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Manage your clients and their API access.</p>
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
              <th style={{ padding: '16px 20px' }}>Provider</th>
              <th style={{ padding: '16px 20px' }}>Login Email</th>
              <th style={{ padding: '16px 20px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 20px', fontWeight: '500' }}>{r.name}</td>
                <td style={{ padding: '16px 20px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', color: r.whatsapp_provider === 'twilio' ? '#ef4444' : '#3b82f6' }}>
                  {r.whatsapp_provider || 'WEB2C'}
                </td>
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

      {/* 1. Add Restaurant Modal */}
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

              <h3 style={{margin: '10px 0 0 0', fontSize: '16px', color: '#475569'}}>WhatsApp API Details</h3>
              <select 
                value={newRestaurant.whatsapp_provider} 
                onChange={(e) => setNewRestaurant({...newRestaurant, whatsapp_provider: e.target.value})} 
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="web2c">Web2C</option>
                <option value="twilio">Twilio</option>
              </select>
              <input type="text" placeholder="API Key" required value={newRestaurant.whatsapp_api_key} onChange={(e) => setNewRestaurant({...newRestaurant, whatsapp_api_key: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. NAYA: Success Modal (Client Details) */}
      {isSuccessModalOpen && createdClient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={24} /> Client Created!
              </h2>
              <X size={24} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => setIsSuccessModalOpen(false)} />
            </div>
            
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
              <b>{createdClient.name}</b> ka account ban gaya hai. Neeche di gayi details client ko bhejein:
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Login Link</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#3b82f6', wordBreak: 'break-all' }}>{createdClient.link}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Email</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a' }}>{createdClient.email}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Password</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a', fontFamily: 'monospace' }}>{createdClient.password}</p>
              </div>
            </div>

            <button onClick={copyClientDetails} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
              <Copy size={18} /> Copy All Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}