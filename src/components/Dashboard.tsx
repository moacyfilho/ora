import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Users, Car, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeRentals: 0,
    totalRevenue: 0,
    availableCars: 0,
    pendingMaintenance: 0,
    totalCars: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    const { count: rentalCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: carCount } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'available');
    const { count: maintCount } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'maintenance');
    const { count: totalCars } = await supabase.from('cars').select('*', { count: 'exact', head: true });

    const { data: revenueData } = await supabase.from('rentals').select('paid_amount');
    const totalRev = revenueData?.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0) || 0;

    setStats({
      activeRentals: rentalCount || 0,
      totalRevenue: totalRev,
      availableCars: carCount || 0,
      pendingMaintenance: maintCount || 0,
      totalCars: totalCars || 0
    });
  };

  const fetchChartData = async () => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const counts = await Promise.all(days.map(async (day) => {
      const start = startOfDay(day).toISOString();
      const end = endOfDay(day).toISOString();
      const { count } = await supabase
        .from('rentals')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start)
        .lte('created_at', end);
      return count || 0;
    }));
    setChartData(counts);
  };

  const fetchRecentActivities = async () => {
    const { data: recentRentals } = await supabase
      .from('rentals')
      .select('*, cars(model, brand), customers(full_name)')
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: recentMaint } = await supabase
      .from('maintenance_logs')
      .select('*, cars(model, brand)')
      .order('date', { ascending: false })
      .limit(3);

    const combined = [
      ...(recentRentals || []).map(r => ({
        id: r.id,
        type: 'rental',
        title: `${r.cars?.brand} ${r.cars?.model}`,
        subtitle: `Alugado para ${r.customer_name || r.customers?.full_name}`,
        date: new Date(r.created_at)
      })),
      ...(recentMaint || []).map(m => ({
        id: m.id,
        type: 'maintenance',
        title: `MANUTENÇÃO: ${m.cars?.brand} ${m.cars?.model}`,
        subtitle: m.description,
        date: new Date(m.date)
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    setActivities(combined);
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
                .stat-card { flex: 1; min-width: 240px; }
                .icon-wrapper {
                    width: 48px; height: 48px;
                    background: rgba(0, 229, 255, 0.1);
                    border-radius: 12px; display: flex;
                    align-items: center; justify-content: center;
                }
                .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
                .trend { font-size: 0.8rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 6px; }
                .trend.positive { color: var(--success); background: rgba(0, 230, 118, 0.1); }
                .stat-title { color: var(--text-dim); font-size: 0.9rem; margin-bottom: 0.5rem; }
                .stat-value { font-size: 1.8rem; font-weight: 700; }
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
        <StatCard title="Receita Total" value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={TrendingUp} trend="+8%" />
        <StatCard title="Carros Disponíveis" value={stats.availableCars} icon={Car} />
        <StatCard title="Em Manutenção" value={stats.pendingMaintenance} icon={AlertCircle} />
      </div>

      <div className="charts-mockup">
        <div className="glass-card chart-placeholder">
          <div className="card-header-with-icon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Novos Aluguéis (7 dias)</h3>
            <TrendingUp size={18} color="var(--primary)" />
          </div>
          <div className="bar-chart-container">
            {chartData.map((count, i) => {
              const max = Math.max(...chartData, 1);
              const height = (count / max) * 100;
              return (
                <div key={i} className="bar-wrapper">
                  <div className="bar" style={{ height: `${Math.max(height, 5)}%` }}>
                    {count > 0 && <span className="bar-value">{count}</span>}
                  </div>
                  <span className="bar-date">{subDays(new Date(), 6 - i).toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass-card recent-list">
          <h3>Atividade Recente</h3>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '1rem' }}>Nenhuma atividade recente.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`bullet ${activity.type === 'maintenance' ? 'maintenance' : ''}`}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activity.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{activity.subtitle}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {formatDistanceToNow(activity.date, { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
                .dashboard { display: flex; flex-direction: column; gap: 2rem; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
                .charts-mockup { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
                @media (max-width: 900px) { .charts-mockup { grid-template-columns: 1fr; } }
                
                .bar-chart-container { flex: 1; display: flex; align-items: flex-end; gap: 1.2rem; height: 200px; padding-bottom: 1rem; border-bottom: 1px solid var(--surface-border); }
                .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; height: 100%; justify-content: flex-end; }
                .bar { width: 100%; max-width: 40px; background: linear-gradient(to top, var(--primary), var(--secondary)); border-radius: 6px 6px 0 0; opacity: 0.8; transition: all 0.3s ease; position: relative; }
                .bar:hover { opacity: 1; transform: scaleX(1.1); filter: brightness(1.2); }
                .bar-value { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; font-weight: 700; color: var(--primary); }
                .bar-date { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; }

                .activity-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--surface-border); }
                .bullet { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 0.4rem; box-shadow: 0 0 10px var(--primary-glow); }
                .bullet.maintenance { background: var(--warning); box-shadow: 0 0 10px var(--warning); }
            `}</style>
    </div>
  );
};

export default Dashboard;
