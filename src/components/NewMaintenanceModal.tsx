import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface NewMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewMaintenanceModal = ({ isOpen, onClose, onSuccess }: NewMaintenanceModalProps) => {
    const [cars, setCars] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        car_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'preventive',
        cost: 0
    });

    useEffect(() => {
        if (isOpen) {
            fetchCars();
        }
    }, [isOpen]);

    const fetchCars = async () => {
        const { data } = await supabase.from('cars').select('*').order('model');
        if (data) setCars(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase.from('maintenance_logs').insert([formData]);

        if (!error) {
            onSuccess();
            onClose();
            setFormData({
                car_id: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                type: 'preventive',
                cost: 0
            });
        } else {
            alert('Erro ao registrar manutenção: ' + error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Registrar Manutenção</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group full-width">
                            <label>Veículo</label>
                            <select
                                required
                                value={formData.car_id}
                                onChange={e => setFormData({ ...formData, car_id: e.target.value })}
                            >
                                <option value="">Selecione um veículo</option>
                                {cars.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.brand} {c.model} - {c.license_plate}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Data</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Custo (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="input-group full-width">
                            <label>Tipo</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="preventive">Preventiva</option>
                                <option value="corrective">Corretiva</option>
                            </select>
                        </div>
                        <div className="input-group full-width">
                            <label>Descrição</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ minHeight: '100px' }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary full-width">Salvar Manutenção</button>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center; z-index: 2000;
                }
                .modal-content { width: 100%; padding: 2rem; border: 1px solid var(--primary); }
                .modal-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
                .close-btn { background: none; border: none; color: white; cursor: pointer; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-group.full-width { grid-column: 1 / -1; }
                .input-group label { font-size: 0.8rem; color: var(--text-dim); }
                .input-group input, .input-group select, .input-group textarea {
                    background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border);
                    padding: 0.8rem; border-radius: 8px; color: white; outline: none;
                }
                .input-group select option { background: #111; color: white; }
                .full-width { width: 100%; }
            `}</style>
        </div>
    );
};
