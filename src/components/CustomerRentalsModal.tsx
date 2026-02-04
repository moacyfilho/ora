
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Calendar, Car } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface CustomerRentalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
}

export const CustomerRentalsModal = ({ isOpen, onClose, customer }: CustomerRentalsModalProps) => {
    const [rentals, setRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer && isOpen) {
            fetchRentals();
        }
    }, [customer, isOpen]);

    const fetchRentals = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('rentals')
            .select(`
                *,
                cars (
                    brand,
                    model,
                    license_plate
                )
            `)
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });

        if (data) setRentals(data);
        setLoading(false);
    };

    if (!isOpen || !customer) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content animate-fade-in">
                <div className="modal-header">
                    <div>
                        <h3>Histórico de Aluguéis</h3>
                        <p className="dim">{customer.full_name}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="rentals-list-scroll">
                    {loading ? (
                        <p className="text-center dim">Carregando...</p>
                    ) : rentals.length === 0 ? (
                        <p className="text-center dim">Nenhum aluguel encontrado para este cliente.</p>
                    ) : (
                        <div className="rentals-list">
                            {rentals.map(rental => (
                                <div key={rental.id} className="rental-item-row">
                                    <div className="rental-car">
                                        <Car size={16} className="icon" />
                                        <div>
                                            <p className="bold">{rental.cars?.model || 'Carro Removido'}</p>
                                            <p className="dim">{rental.cars?.license_plate}</p>
                                        </div>
                                    </div>
                                    <div className="rental-dates">
                                        <Calendar size={16} className="icon" />
                                        <div>
                                            <p className="small">{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</p>
                                        </div>
                                    </div>
                                    <div className="rental-finance">
                                        <p className="bold">R$ {rental.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <div className={`status-badge ${rental.paid_amount >= rental.total_amount ? 'paid' : 'pending'}`}>
                                            {rental.paid_amount >= rental.total_amount ? 'Pago' : 'Pendente'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center; z-index: 2200;
                }
                .modal-content { width: 100%; max-width: 600px; padding: 2rem; border: 1px solid var(--primary); max-height: 80vh; display: flex; flex-direction: column; }
                .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .close-btn { background: none; border: none; color: white; cursor: pointer; }
                .rentals-list-scroll { overflow-y: auto; padding-right: 0.5rem; }
                .rentals-list { display: flex; flex-direction: column; gap: 1rem; }
                .rental-item-row { 
                    display: flex; align-items: center; justify-content: space-between; 
                    background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px;
                    border: 1px solid var(--surface-border);
                }
                .rental-car, .rental-dates { display: flex; align-items: center; gap: 0.8rem; }
                .icon { color: var(--primary); }
                .bold { fontWeight: 600; font-size: 0.9rem; }
                .dim { color: var(--text-dim); font-size: 0.8rem; }
                .small { font-size: 0.85rem; }
                .rental-finance { text-align: right; }
                .status-badge { 
                    display: inline-block; padding: 2px 8px; border-radius: 4px; 
                    font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-top: 4px;
                }
                .status-badge.paid { background: rgba(0, 230, 118, 0.1); color: var(--success); }
                .status-badge.pending { background: rgba(255, 160, 0, 0.1); color: #FFA000; }
                .text-center { text-align: center; margin: 2rem 0; }
            `}</style>
        </div>
    );
};
