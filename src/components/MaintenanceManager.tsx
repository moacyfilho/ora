import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, DollarSign, AlertTriangle, CheckCircle, Trash2, Settings2 } from 'lucide-react';
import { NewMaintenanceModal } from './NewMaintenanceModal';
import { EditMaintenanceModal } from './EditMaintenanceModal';

const MaintenanceManager = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<any | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [summary, setSummary] = useState({ totalCost: 0, pendingRevisions: 0 });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const { data } = await supabase
            .from('maintenance_logs')
            .select('*, cars(model, brand, license_plate)')
            .order('date', { ascending: false });

        if (data) {
            setLogs(data);
            const total = data.reduce((acc, log) => acc + (log.cost || 0), 0);
            setSummary({ totalCost: total, pendingRevisions: data.length }); // Placeholder logic for pending
        }
        setLoading(false);
    };

    const handleDeleteMaintenance = async (id: string) => {
        const { error } = await supabase.from('maintenance_logs').delete().eq('id', id);
        if (!error) {
            fetchLogs();
            setConfirmDeleteId(null);
        } else {
            alert('Erro ao excluir manutenção: ' + error.message);
        }
    };

    return (
        <div className="maintenance-container">
            <div className="view-header">
                <div>
                    <h2>Gestão de Manutenções</h2>
                    <p>Histórico de revisões e manutenções preventivas/corretivas.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsNewModalOpen(true)}>
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
                        <p className="label">Gasto Total (Histórico)</p>
                        <h3>R$ {summary.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
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
                            <th>Ações</th>
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
                                    <td className="actions-cell">
                                        <div className="delete-container">
                                            {confirmDeleteId === log.id ? (
                                                <div className="confirm-actions animate-fade-in">
                                                    <button className="confirm-yes" onClick={() => handleDeleteMaintenance(log.id)}>S</button>
                                                    <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>N</button>
                                                </div>
                                            ) : (
                                                <button className="icon-btn" onClick={() => setConfirmDeleteId(log.id)} title="Excluir">
                                                    <Trash2 size={16} color="var(--error)" />
                                                </button>
                                            )}
                                        </div>
                                        <button className="icon-btn" onClick={() => setEditingLog(log)} title="Editar">
                                            <Settings2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <NewMaintenanceModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSuccess={fetchLogs}
            />

            <EditMaintenanceModal
                isOpen={!!editingLog}
                onClose={() => setEditingLog(null)}
                onSuccess={fetchLogs}
                log={editingLog}
            />

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
        
        .actions-cell {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .icon-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover { color: white; transform: scale(1.1); }
        
        .delete-container { min-width: 40px; display: flex; justify-content: center; }
        .confirm-actions { display: flex; gap: 0.3rem; }
        .confirm-yes, .confirm-no {
          border: none;
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        }
        .confirm-yes { background: var(--error); color: white; }
        .confirm-no { background: var(--surface-border); color: white; }
      `}</style>
        </div>
    );
};

export default MaintenanceManager;
