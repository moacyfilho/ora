import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Users, Car, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeRentals: 0,
    totalRevenue: 0,
    availableCars: 0,
    pendingMaintenance: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: rentalCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: carCount } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'available');
    const { count: maintCount } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'maintenance');

    // Calculate total revenue from rentals (sum of paid_amount)
    const { data: revenueData } = await supabase.from('rentals').select('paid_amount');
    const totalRev = revenueData?.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0) || 0;

    setStats({
      activeRentals: rentalCount || 0,
      totalRevenue: totalRev,
      availableCars: carCount || 0,
      pendingMaintenance: maintCount || 0
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="glass-card stat-card">
      <div className="stat-header">
        <div className="icon-wrapper">
          <Icon size={24} color="var(--primary)" />
        </div>
        {trend && <span className="trend positive">{trend}</span>}
      </div>
      <div className="stat-body">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
      <style>{`
        .stat-card {
          flex: 1;
          min-width: 240px;
        }
        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: rgba(0, 229, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .trend {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }
        .trend.positive {
          color: var(--success);
          background: rgba(0, 230, 118, 0.1);
        }
        .stat-title {
          color: var(--text-dim);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="welcome-header">
        <h2>Dashboard Geral</h2>
        <p>Visão geral da sua frota e desempenho comercial.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Aluguéis Ativos" value={stats.activeRentals} icon={Users} trend="+12%" />
        <StatCard title="Receita (Mês)" value={`R$ ${stats.totalRevenue.toFixed(2)}`} icon={TrendingUp} trend="+8%" />
        <StatCard title="Carros Disponíveis" value={stats.availableCars} icon={Car} />
        <StatCard title="Pendências de Manutenção" value={stats.pendingMaintenance} icon={AlertCircle} />
      </div>

      <div className="charts-mockup">
        <div className="glass-card chart-placeholder">
          <h3>Fluxo de Alugueis</h3>
          <div className="mock-bar-chart">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="bar" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
        <div className="glass-card recent-list">
          <h3>Atividade Recente</h3>
          <div className="activity-item">
            <div className="bullet"></div>
            <p><strong>Fiat Argo</strong> alugado para João Silva</p>
            <span>Há 2h</span>
          </div>
          <div className="activity-item">
            <div className="bullet maintenance"></div>
            <p><strong>REVISÃO:</strong> Toyota Corolla agendada</p>
            <span>Há 5h</span>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .welcome-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .welcome-header p {
          color: var(--text-dim);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .charts-mockup {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .charts-mockup {
            grid-template-columns: 1fr;
          }
        }
        .chart-placeholder {
          height: 300px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .mock-bar-chart {
          flex: 1;
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          padding-bottom: 1rem;
        }
        .bar {
          flex: 1;
          background: linear-gradient(to top, var(--primary), var(--secondary));
          border-radius: 8px 8px 0 0;
          opacity: 0.8;
          transition: transform 0.3s ease;
        }
        .bar:hover {
          opacity: 1;
          transform: scaleY(1.05);
        }
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 0;
          border-bottom: 1px solid var(--surface-border);
        }
        .activity-item p { font-size: 0.9rem; flex: 1; }
        .activity-item span { font-size: 0.8rem; color: var(--text-dim); }
        .bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary-glow);
        }
        .bullet.maintenance {
          background: var(--warning);
          box-shadow: 0 0 10px var(--warning);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
