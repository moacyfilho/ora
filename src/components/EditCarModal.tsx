import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface EditCarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    car: any;
}

export const EditCarModal = ({ isOpen, onClose, onSuccess, car }: EditCarModalProps) => {
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        license_plate: '',
        year: 2024,
        daily_rate: 0,
        status: 'available'
    });

    useEffect(() => {
        if (car) {
            setFormData({
                brand: car.brand,
                model: car.model,
                license_plate: car.license_plate,
                year: car.year,
                daily_rate: car.daily_rate,
                status: car.status
            });
        }
    }, [car, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('cars')
            .update(formData)
            .eq('id', car.id);

        if (!error) {
            onSuccess();
            onClose();
        } else {
            alert('Erro ao atualizar veículo: ' + error.message);
        }
    };

    if (!isOpen || !car) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Editar Veículo</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Marca</label>
                            <input
                                required
                                value={formData.brand}
                                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Modelo</label>
                            <input
                                required
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Placa</label>
                            <input
                                required
                                value={formData.license_plate}
                                onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Ano</label>
                            <input
                                type="number"
                                required
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Diária (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.daily_rate}
                                onChange={e => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="available">Disponível</option>
                                <option value="rented">Alugado</option>
                                <option value="maintenance">Manutenção</option>
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
                    display: flex; align-items: center; justify-content: center; z-index: 2100;
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
