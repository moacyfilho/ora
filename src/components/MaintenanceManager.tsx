import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

const MaintenanceManager = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const { data } = await supabase
            .from('maintenance_logs')
            .select('*, cars(model, brand, license_plate)')
            .order('date', { ascending: false });

        if (data) setLogs(data);
        setLoading(false);
    };

    return (
        <div className="maintenance-container">
            <div className="view-header">
                <div>
                    <h2>Gestão de Manutenções</h2>
                    <p>Histórico de revisões e manutenções preventivas/corretivas.</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>Registrar Manutenção</span>
                </button>
            </div>

            <div className="maintenance-summarystats">
                <div className="glass-card mini-stat">
                    <AlertTriangle size={20} color="var(--warning)" />
                    <div>
                        <p className="label">Próximas Revisões</p>
                        <h3>2 Veículos</h3>
                    </div>
                </div>
                <div className="glass-card mini-stat">
                    <DollarSign size={20} color="var(--primary)" />
                    <div>
                        <p className="label">Gasto Total (Mês)</p>
                        <h3>R$ 1.250,00</h3>
                    </div>
                </div>
            </div>

            <div className="glass-card table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Veículo</th>
                            <th>Descrição</th>
                            <th>Tipo</th>
                            <th>Custo</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Carregando histórico...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum registro de manutenção.</td></tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id}>
                                    <td>{new Date(log.date).toLocaleDateString()}</td>
                                    <td>
                                        <div className="car-cell">
                                            <p>{log.cars?.brand} {log.cars?.model}</p>
                                            <p className="plate">{log.cars?.license_plate}</p>
                                        </div>
                                    </td>
                                    <td>{log.description}</td>
                                    <td>
                                        <span className={`type-tag ${log.type}`}>
                                            {log.type === 'preventive' ? 'Preventiva' : 'Corretiva'}
                                        </span>
                                    </td>
                                    <td className="amount">R$ {log.cost}</td>
                                    <td>
                                        <span className="status-finished">
                                            <CheckCircle size={14} />
                                            Concluído
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
        .maintenance-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .maintenance-summarystats {
          display: flex;
          gap: 1.5rem;
        }
        .mini-stat {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem;
        }
        .mini-stat h3 { font-size: 1.2rem; }
        .mini-stat .label { font-size: 0.8rem; color: var(--text-dim); }
        
        .table-wrapper { padding: 0; overflow-x: auto; }
        .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
        .custom-table th { padding: 1.2rem; color: var(--text-dim); border-bottom: 1px solid var(--surface-border); font-size: 0.85rem; }
        .custom-table td { padding: 1.2rem; border-bottom: 1px solid var(--surface-border); }
        
        .type-tag {
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .type-tag.preventive { background: rgba(0, 229, 255, 0.1); color: var(--primary); }
        .type-tag.corrective { background: rgba(255, 160, 0, 0.1); color: var(--warning); }
        
        .amount { font-weight: 700; color: var(--error); }
        .status-finished {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--success);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .plate { font-size: 0.75rem; color: var(--primary); font-family: monospace; }
      `}</style>
        </div>
    );
};

export default MaintenanceManager;
