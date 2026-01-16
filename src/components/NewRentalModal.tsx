import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface NewRentalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewRentalModal = ({ isOpen, onClose, onSuccess }: NewRentalModalProps) => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [cars, setCars] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        customer_id: '',
        car_id: '',
        start_date: '',
        end_date: '',
        daily_rate: '',
        total_amount: '',
        status: 'active'
    });

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            fetchAvailableCars();
        }
    }, [isOpen]);

    const fetchCustomers = async () => {
        const { data } = await supabase
            .from('customers')
            .select('id, full_name, document_cpf')
            .order('full_name');
        if (data) setCustomers(data);
    };

    const fetchAvailableCars = async () => {
        const { data } = await supabase
            .from('cars')
            .select('*')
            .eq('status', 'available')
            .order('model');
        if (data) setCars(data);
    };

    const calculateTotal = () => {
        if (formData.start_date && formData.end_date && formData.daily_rate) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const total = days * parseFloat(formData.daily_rate);
            setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }));
        }
    };

    useEffect(() => {
        calculateTotal();
    }, [formData.start_date, formData.end_date, formData.daily_rate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedCustomer = customers.find(c => c.id === formData.customer_id);

        const rentalData = {
            customer_id: formData.customer_id,
            car_id: formData.car_id,
            customer_name: selectedCustomer?.full_name,
            customer_phone: selectedCustomer?.phone || '',
            start_date: formData.start_date,
            end_date: formData.end_date,
            total_amount: parseFloat(formData.total_amount),
            paid_amount: 0,
            status: formData.status
        };

        const { error } = await supabase.from('rentals').insert([rentalData]);

        if (!error) {
            // Atualizar status do carro para 'rented'
            await supabase.from('cars').update({ status: 'rented' }).eq('id', formData.car_id);
            onSuccess();
            onClose();
            setFormData({
                customer_id: '',
                car_id: '',
                start_date: '',
                end_date: '',
                daily_rate: '',
                total_amount: '',
                status: 'active'
            });
        } else {
            alert('Erro ao criar aluguel: ' + error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>Novo Aluguel</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group full-width">
                            <label>Cliente</label>
                            <select
                                required
                                value={formData.customer_id}
                                onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                            >
                                <option value="">Selecione um cliente</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.full_name} - {c.document_cpf}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group full-width">
                            <label>Veículo</label>
                            <select
                                required
                                value={formData.car_id}
                                onChange={e => {
                                    const car = cars.find(c => c.id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        car_id: e.target.value,
                                        daily_rate: car?.daily_rate || ''
                                    });
                                }}
                            >
                                <option value="">Selecione um veículo</option>
                                {cars.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.brand} {c.model} - {c.license_plate} (R$ {c.daily_rate}/dia)
                                    </option>
                                ))}
                            </select>
                        </div>

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
                            <label>Valor Diária (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.daily_rate}
                                onChange={e => setFormData({ ...formData, daily_rate: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>Valor Total (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.total_amount}
                                readOnly
                                style={{ background: 'rgba(0, 229, 255, 0.1)', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary full-width">Criar Aluguel</button>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }
                .modal-content {
                    width: 100%;
                    padding: 2rem;
                    border: 1px solid var(--primary);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .input-group.full-width {
                    grid-column: 1 / -1;
                }
                .input-group label {
                    font-size: 0.8rem;
                    color: var(--text-dim);
                }
                .input-group input,
                .input-group select {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--surface-border);
                    padding: 0.8rem;
                    border-radius: 8px;
                    color: white;
                    outline: none;
                }
                .input-group select option {
                    background: var(--background);
                    color: white;
                }
                .full-width {
                    width: 100%;
                }
            `}</style>
        </div>
    );
};
