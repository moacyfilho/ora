import { useState } from 'react';
import {
  Car,
  LayoutDashboard,
  CalendarRange,
  Wrench,
  Users,
  CreditCard,
  Menu,
  X,
  Plus
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import FleetManager from './components/FleetManager.tsx';
import Rentals from './components/Rentals.tsx';
import CustomerManager from './components/CustomerManager.tsx';
import MaintenanceManager from './components/MaintenanceManager.tsx';
import BillingManager from './components/BillingManager.tsx';
import { NewRentalModal } from './components/NewRentalModal.tsx';

type View = 'dashboard' | 'fleet' | 'rentals' | 'customers' | 'maintenance' | 'billing';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewRentalModalOpen, setIsNewRentalModalOpen] = useState(false);

  const NavItem = ({ name, icon: Icon, id }: { name: string, icon: any, id: View }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`sidebar-item ${activeView === id ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{name}</span>
    </button>
  );

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Car size={32} color="var(--primary)" />
            <h1 className="gradient-text">ORA CARS</h1>
          </div>
          <button className="mobile-toggle" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavItem id="dashboard" name="Dashboard" icon={LayoutDashboard} />
          <NavItem id="fleet" name="Frota" icon={Car} />
          <NavItem id="customers" name="Clientes" icon={Users} />
          <NavItem id="rentals" name="Aluguéis" icon={CalendarRange} />
          <NavItem id="maintenance" name="Manutenção" icon={Wrench} />
          <NavItem id="billing" name="Cobrança" icon={CreditCard} />
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">AD</div>
            <div className="info">
              <p className="name">Administrador</p>
              <p className="role">Pro Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setIsNewRentalModalOpen(true)}>
              <Plus size={18} />
              <span>Novo Aluguel</span>
            </button>
          </div>
        </header>

        <section className="content-area animate-fade-in">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'fleet' && <FleetManager />}
          {activeView === 'customers' && <CustomerManager />}
          {activeView === 'rentals' && <Rentals />}
          {activeView === 'maintenance' && <MaintenanceManager />}
          {activeView === 'billing' && <BillingManager />}
        </section>
      </main>

      <NewRentalModal
        isOpen={isNewRentalModalOpen}
        onClose={() => setIsNewRentalModalOpen(false)}
        onSuccess={() => {
          setIsNewRentalModalOpen(false);
          setActiveView('rentals');
        }}
      />

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          background: rgba(10, 10, 25, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--surface-border);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          padding: 2.5rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-item {
          background: transparent;
          border: none;
          color: var(--text-dim);
          padding: 1rem 1.2rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .sidebar-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-item.active {
          background: rgba(0, 229, 255, 0.1);
          color: var(--primary);
          box-shadow: inset 4px 0 0 var(--primary);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--surface-border);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #000;
        }

        .info .name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .info .role {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .top-header {
          height: 80px;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(5, 5, 16, 0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .content-area {
          padding: 2rem;
          flex: 1;
        }

        .mobile-toggle, .menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .mobile-toggle, .menu-btn {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
