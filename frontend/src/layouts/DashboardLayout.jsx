import { useNavigate, Outlet, useLocation } from 'react-router-dom';
// Moon aur Sun import kiye
import { LogOut, LayoutDashboard, Store, Users, Activity, Bell, Search, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Restaurants', path: '/admin/restaurants', icon: <Store size={20} /> },
    { name: 'Team Members', path: '/admin/team', icon: <Users size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', margin: 0, padding: 0, overflow: 'hidden' }}>
      
      {/* 🔴 SIDEBAR */}
      <div style={{ width: '260px', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', color: 'white', display: 'flex', flexDirection: 'column', padding: '24px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '10px', borderRadius: '12px' }}>
            <Activity size={24} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>RestoAgent</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.name} 
                onClick={() => navigate(item.path)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
                  background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent', 
                  borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent', 
                  color: isActive ? '#60a5fa' : '#94a3b8', 
                  fontWeight: isActive ? 'bold' : 'normal', 
                  borderRadius: '8px', cursor: 'pointer', transition: '0.2s'
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            );
          })}
        </nav>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* 🟢 MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', width: '300px' }}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search..." style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Dark Mode Toggle Button */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            
            <Bell size={22} color="#64748b" />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>A</div>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '30px 40px', flex: 1, overflowY: 'auto' }}>
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}