import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface EditRentalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    rental: any;
}

export const EditRentalModal = ({ isOpen, onClose, onSuccess, rental }: EditRentalModalProps) => {
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        total_amount: '',
        deposit_amount: '',
        status: 'active',
        daily_rate: 0
    });

    useEffect(() => {
        if (rental) {
            setFormData({
                start_date: rental.start_date.split('T')[0],
                end_date: rental.end_date.split('T')[0],
                total_amount: rental.total_amount.toString(),
                deposit_amount: rental.deposit_amount ? rental.deposit_amount.toString() : '',
                status: rental.status,
                daily_rate: rental.cars?.daily_rate || rental.daily_rate || 0
            });
            // Fetch car daily rate if not in rental or rental.cars
            if (!rental.cars?.daily_rate && !rental.daily_rate && rental.car_id) {
                fetchCarDailyRate(rental.car_id);
            }
        }
    }, [rental, isOpen]);

    const fetchCarDailyRate = async (carId: string) => {
        const { data } = await supabase.from('cars').select('daily_rate').eq('id', carId).single();
        if (data) {
            setFormData(prev => ({ ...prev, daily_rate: data.daily_rate }));
        }
    };

    useEffect(() => {
        if (formData.start_date && formData.end_date && formData.daily_rate) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Ensure at least 1 day
            const days = diffDays === 0 ? 1 : diffDays;

            const newTotal = (days * formData.daily_rate).toFixed(2);
            setFormData(prev => ({ ...prev, total_amount: newTotal }));
        }
    }, [formData.start_date, formData.end_date, formData.daily_rate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('rentals')
            .update({
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_amount: parseFloat(formData.total_amount),
                deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : 0,
                status: formData.status
            })
            .eq('id', rental.id);

        if (!error) {
            onSuccess();
            onClose();
        } else {
            alert('Erro ao atualizar aluguel: ' + error.message);
        }
    };

    if (!isOpen || !rental) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Editar Contrato</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                        Cliente: <strong>{rental.customer_name}</strong>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                        Veículo: <strong>{rental.cars?.brand} {rental.cars?.model}</strong>
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Data Início</label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                onClick={(e) => (e.target as any).showPicker?.()}
                            />
                        </div>

                        <div className="input-group">
                            <label>Data Término</label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                onClick={(e) => (e.target as any).showPicker?.()}
                            />
                        </div>

                        <div className="input-group">
                            <label>Valor Total (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.total_amount}
                                onChange={e => setFormData({ ...formData, total_amount: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>Valor de Caução (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.deposit_amount}
                                onChange={e => setFormData({ ...formData, deposit_amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="input-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Ativo</option>
                                <option value="completed">Concluído</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary full-width">Salvar Alterações</button>
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
                .input-group label { font-size: 0.8rem; color: var(--text-dim); }
                .input-group input, .input-group select {
                    background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border);
                    padding: 0.8rem; border-radius: 8px; color: white; outline: none;
                }
                .input-group select option { background: #111; color: white; }
                .full-width { width: 100%; }
            `}</style>
        </div>
    );
};
