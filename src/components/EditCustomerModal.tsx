
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface EditCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer: any;
}

export const EditCustomerModal = ({ isOpen, onClose, onSuccess, customer }: EditCustomerModalProps) => {
    const [formData, setFormData] = useState({
        full_name: '',
        document_cpf: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                full_name: customer.full_name,
                document_cpf: customer.document_cpf,
                phone: customer.phone,
                email: customer.email || '',
                address: customer.address || ''
            });
        }
    }, [customer, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('customers')
            .update(formData)
            .eq('id', customer.id);

        if (!error) {
            onSuccess();
            onClose();
        } else {
            alert('Erro ao atualizar cliente: ' + error.message);
        }
    };

    if (!isOpen || !customer) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content animate-fade-in">
                <div className="modal-header">
                    <h3>Editar Cliente</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Nome Completo</label>
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>CPF</label>
                            <input
                                required
                                value={formData.document_cpf}
                                onChange={e => setFormData({ ...formData, document_cpf: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Telefone (WhatsApp)</label>
                            <input
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>E-mail</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="input-group full-width" style={{ gridColumn: '1 / -1' }}>
                            <label>Endereço</label>
                            <input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
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
                .modal-content { width: 100%; max-width: 500px; padding: 2rem; border: 1px solid var(--primary); }
                .modal-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
                .close-btn { background: none; border: none; color: white; cursor: pointer; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-group label { font-size: 0.8rem; color: var(--text-dim); }
                .input-group input {
                    background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border);
                    padding: 0.8rem; border-radius: 8px; color: white; outline: none;
                }
                .full-width { width: 100%; }
            `}</style>
        </div>
    );
};
