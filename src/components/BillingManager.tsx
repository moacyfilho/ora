import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    MessageSquare,
    CheckCircle2,
    Clock,
    CreditCard,
    Search,
    X,
    MessageCircle
} from 'lucide-react';

const BillingManager = () => {
    const [pendingRentals, setPendingRentals] = useState<any[]>([]);
    const [completedPayments, setCompletedPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        expected: 0,
        received: 0,
        pending: 0
    });
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [selectedRental, setSelectedRental] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Pix');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch Pending Rentals
        const { data: rentals } = await supabase
            .from('rentals')
            .select('*, cars(brand, model)')
            .order('created_at', { ascending: false });

        if (rentals) {
            const pending = rentals.filter((r: any) => r.paid_amount < r.total_amount);
            setPendingRentals(pending);

            const expectedTotal = rentals.reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0);
            const receivedTotal = rentals.reduce((acc: number, curr: any) => acc + (curr.paid_amount || 0), 0);

            setStats({
                expected: expectedTotal,
                received: receivedTotal,
                pending: expectedTotal - receivedTotal
            });
        }

        // Fetch Completed Transactions (History)
        const { data: history } = await supabase
            .from('payments')
            .select('*, rentals(customer_name, cars(model))')
            .order('payment_date', { ascending: false });

        if (history) setCompletedPayments(history);

        setLoading(false);
    };

    const handleWhatsApp = (rental: any) => {
        const remaining = (rental.total_amount - rental.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        const message = `Olá ${rental.customer_name}! Vimos que você possui um saldo pendente de R$ ${remaining} referente ao seu aluguel do ${rental.cars?.model}. Como podemos facilitar o pagamento para você?`;
        const url = `https://wa.me/${rental.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const openDetails = (rental: any) => {
        setSelectedRental(rental);
        setDetailsModalOpen(true);
    };

    const registerPayment = async () => {
        if (!selectedRental || !paymentAmount) return;

        const amount = parseFloat(paymentAmount);
        const newPaidAmount = (selectedRental.paid_amount || 0) + amount;

        // 1. Update Rental Table
        const { error: rentalError } = await supabase
            .from('rentals')
            .update({ paid_amount: newPaidAmount })
            .eq('id', selectedRental.id);

        if (rentalError) {
            alert('Erro ao atualizar aluguel: ' + rentalError.message);
            return;
        }

        // 2. Insert into Payments Table
        await supabase.from('payments').insert([{
            rental_id: selectedRental.id,
            amount: amount,
            payment_method: paymentMethod,
            payment_date: new Date().toISOString()
        }]);

        setPaymentModalOpen(false);
        setPaymentAmount('');
        setSelectedRental(null);
        fetchData();
    };

    const FinanceCard = ({ title, value, sub, icon: Icon, color }: any) => (
        <div className="glass-card finance-card">
            <div className="card-top">
                <div className="icon-box" style={{ background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="card-bottom">
                <p className="title">{title}</p>
                <h2 className="value">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <p className="sub">{sub}</p>
            </div>
        </div>
    );

    return (
        <div className="billing-container">
            <div className="view-header">
                <div>
                    <h2>Financeiro & Cobrança</h2>
                    <p>Controle de entradas, cobranças ativas e histórico.</p>
                </div>
                <div className="tab-switcher glass-card">
                    <button
                        className={activeTab === 'pending' ? 'active' : ''}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pendentes
                    </button>
                    <button
                        className={activeTab === 'completed' ? 'active' : ''}
                        onClick={() => setActiveTab('completed')}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            <div className="finance-grid">
                <FinanceCard
                    title="Total Recebido"
                    value={stats.received}
                    sub="Valores já confirmados"
                    icon={TrendingUp}
                    color="0, 230, 118"
                />
                <FinanceCard
                    title="A Receber"
                    value={stats.pending}
                    sub="Contratos em aberto"
                    icon={Clock}
                    color="255, 160, 0"
                />
                <FinanceCard
                    title="Expectativa Total"
                    value={stats.expected}
                    sub="Previsão de faturamento"
                    icon={DollarSign}
                    color="0, 229, 255"
                />
            </div>

            <div className="glass-card main-table-card">
                <div className="table-header">
                    <h3>{activeTab === 'pending' ? 'Cobranças Ativas' : 'Histórico de Transações'}</h3>
                    <div className="table-actions">
                        <div className="search-box">
                            <Search size={16} />
                            <input type="text" placeholder="Buscar cliente..." />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="custom-table">
                        {activeTab === 'pending' ? (
                            <>
                                <thead>
                                    <tr>
                                        <th>Contrato / Data</th>
                                        <th>Cliente</th>
                                        <th>Progresso Pagamento</th>
                                        <th>Saldo Devedor</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="empty-row">Carregando dados financeiro...</td></tr>
                                    ) : pendingRentals.length === 0 ? (
                                        <tr><td colSpan={5} className="empty-row">Nenhuma cobrança pendente.</td></tr>
                                    ) : (
                                        pendingRentals.map(rental => {
                                            const progress = (rental.paid_amount / rental.total_amount) * 100;
                                            const debt = rental.total_amount - rental.paid_amount;
                                            return (
                                                <tr key={rental.id} className="animate-fade-in">
                                                    <td>
                                                        <p className="bold">#{rental.id.slice(0, 8)}</p>
                                                        <p className="dim">{new Date(rental.start_date).toLocaleDateString()}</p>
                                                    </td>
                                                    <td>
                                                        <p className="bold">{rental.customer_name}</p>
                                                        <p className="dim">{rental.cars?.brand} {rental.cars?.model}</p>
                                                    </td>
                                                    <td>
                                                        <div className="progress-container">
                                                            <div className="progress-bar-bg">
                                                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                                            </div>
                                                            <span>R$ {rental.paid_amount.toLocaleString('pt-BR')} / R$ {rental.total_amount.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="debt-value">R$ {debt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></td>
                                                    <td>
                                                        <div className="action-btns">
                                                            <button
                                                                className="btn-action pay"
                                                                title="Baixar Pagamento"
                                                                onClick={() => { setSelectedRental(rental); setPaymentModalOpen(true); }}
                                                            >
                                                                <CreditCard size={18} />
                                                            </button>
                                                            <button
                                                                className="btn-action wa"
                                                                title="WhatsApp"
                                                                onClick={() => handleWhatsApp(rental)}
                                                            >
                                                                <MessageCircle size={18} />
                                                            </button>
                                                            <button
                                                                className="btn-action cob"
                                                                title="Ver Detalhes do Contrato"
                                                                onClick={() => openDetails(rental)}
                                                            >
                                                                <MessageSquare size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Cliente / Referência</th>
                                        <th>Método</th>
                                        <th>Valor</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="empty-row">Carregando histórico...</td></tr>
                                    ) : completedPayments.length === 0 ? (
                                        <tr><td colSpan={5} className="empty-row">Histórico vazio.</td></tr>
                                    ) : (
                                        completedPayments.map(payment => (
                                            <tr key={payment.id}>
                                                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                <td>
                                                    <p className="bold">{payment.rentals?.customer_name}</p>
                                                    <p className="dim">{payment.rentals?.cars?.model}</p>
                                                </td>
                                                <td>{payment.payment_method}</td>
                                                <td>
                                                    <span className="received-value">
                                                        <ArrowUpRight size={14} />
                                                        R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td><span className="status-pill success">Confirmado</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            </div>

            {/* Modal de Baixar Pagamento */}
            {paymentModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-fade-in">
                        <div className="modal-header">
                            <h3>Baixar Pagamento</h3>
                            <button className="close-btn" onClick={() => setPaymentModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="payment-info">
                            <p className="dim">Cliente</p>
                            <p className="bold">{selectedRental?.customer_name}</p>
                            <p className="dim mt">Saldo Devedor: <span className="error">R$ {(selectedRental?.total_amount - selectedRental?.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                        </div>

                        <div className="pay-form">
                            <div className="input-group">
                                <label>Valor do Pagamento (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="input-group">
                                <label>Método</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <option value="Pix">Pix</option>
                                    <option value="Dinheiro">Dinheiro</option>
                                    <option value="Cartão Débito">Cartão Débito</option>
                                    <option value="Cartão Crédito">Cartão Crédito</option>
                                    <option value="Transferência">Transferência</option>
                                </select>
                            </div>
                            <button className="btn-primary full-width mt-large" onClick={registerPayment}>
                                <CheckCircle2 size={18} />
                                <span>Confirmar Recebimento</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes */}
            {detailsModalOpen && selectedRental && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-fade-in">
                        <div className="modal-header">
                            <h3>Detalhes do Contrato</h3>
                            <button className="close-btn" onClick={() => setDetailsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="payment-info">
                            <p className="dim">Cliente</p>
                            <p className="bold">{selectedRental.customer_name}</p>
                            <p className="dim mt">Veículo</p>
                            <p className="bold">{selectedRental.cars?.brand} {selectedRental.cars?.model}</p>

                            <div className="detail-row mt">
                                <div>
                                    <p className="dim">Início</p>
                                    <p>{new Date(selectedRental.start_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="dim">Término</p>
                                    <p>{new Date(selectedRental.end_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="detail-row mt">
                                <div>
                                    <p className="dim">Valor Total</p>
                                    <p className="bold">R$ {selectedRental.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="dim">Pago</p>
                                    <p className="success bold">R$ {selectedRental.paid_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div className="mt-large">
                                <p className="dim">Saldo Restante</p>
                                <p className="error bold" style={{ fontSize: '1.2rem' }}>
                                    R$ {(selectedRental.total_amount - selectedRental.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .billing-container { display: flex; flex-direction: column; gap: 2rem; }
                .view-header { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
                .tab-switcher { display: flex; padding: 0.4rem; border-radius: 12px; gap: 0.4rem; }
                .tab-switcher button { 
                    padding: 0.6rem 1.2rem; border: none; background: transparent; 
                    color: var(--text-dim); border-radius: 8px; cursor: pointer; 
                    font-weight: 600; transition: all 0.2s;
                }
                .tab-switcher button.active { background: var(--primary); color: #000; box-shadow: 0 4px 12px var(--primary-glow); }
                
                .finance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .finance-card { padding: 1.5rem; }
                .card-top { margin-bottom: 1rem; }
                .icon-box { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
                .title { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 0.5rem; }
                .value { font-size: 1.8rem; font-weight: 800; }
                .sub { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.5rem; }

                .main-table-card { padding: 0; overflow: hidden; }
                .table-header { padding: 1.5rem; border-bottom: 1px solid var(--surface-border); display: flex; justify-content: space-between; align-items: center; }
                .search-box { position: relative; display: flex; align-items: center; }
                .search-box input { 
                    background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border);
                    padding: 0.6rem 0.8rem 0.6rem 2.2rem; border-radius: 10px; color: white; outline: none;
                }
                .search-box svg { position: absolute; left: 0.8rem; color: var(--text-dim); }

                .table-responsive { overflow-x: auto; }
                .custom-table { width: 100%; border-collapse: collapse; }
                .custom-table th { padding: 1.2rem; text-align: left; font-size: 0.8rem; color: var(--text-dim); border-bottom: 1px solid var(--surface-border); }
                .custom-table td { padding: 1.2rem; border-bottom: 1px solid var(--surface-border); }
                .bold { font-weight: 600; font-size: 0.95rem; }
                .dim { font-size: 0.8rem; color: var(--text-dim); }
                .mt { margin-top: 0.5rem; }
                .mt-large { margin-top: 2rem; }
                .error { color: var(--error); font-weight: 700; }

                .progress-container { display: flex; flex-direction: column; gap: 0.4rem; min-width: 150px; }
                .progress-bar-bg { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: var(--success); border-radius: 3px; box-shadow: 0 0 10px rgba(0,230,118,0.3); }
                .progress-container span { font-size: 0.7rem; color: var(--text-dim); }

                .debt-value { color: var(--error); font-weight: 700; font-size: 1rem; }
                .received-value { display: flex; align-items: center; gap: 0.4rem; color: var(--success); font-weight: 700; }
                
                .action-btns { display: flex; gap: 0.6rem; }
                .btn-action { 
                    width: 36px; height: 36px; border-radius: 10px; display: flex; 
                    align-items: center; justify-content: center; border: none; cursor: pointer; transition: 0.2s;
                    background: rgba(255,255,255,0.05); color: var(--text-dim);
                }
                .btn-action:hover { transform: translateY(-2px); color: white; }
                .btn-action.pay:hover { background: var(--primary); color: #000; box-shadow: 0 4px 12px var(--primary-glow); }
                .btn-action.wa:hover { background: #25D366; color: white; box-shadow: 0 4px 12px rgba(37,211,102,0.3); }
                .btn-action.cob:hover { background: rgba(255,255,255,0.1); }

                .status-pill { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .status-pill.success { background: rgba(0,230,118,0.1); color: var(--success); border: 1px solid rgba(0,230,118,0.2); }

                .empty-row { text-align: center; padding: 3rem; color: var(--text-dim); }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { width: 100%; max-width: 450px; padding: 2.5rem; }
                .payment-info { background: rgba(255,255,255,0.02); padding: 1.2rem; border-radius: 14px; margin-bottom: 2rem; border: 1px solid var(--surface-border); }
                .pay-form { display: flex; flex-direction: column; gap: 1.2rem; }
                .input-group label { font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.5rem; display: block; }
                .input-group input, .input-group select { 
                    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border);
                    padding: 1rem; border-radius: 12px; color: white; outline: none; font-size: 1rem;
                }
                .input-group input:focus { border-color: var(--primary); box-shadow: 0 0 15px var(--primary-glow); }
                .Detail-row { display: flex; justify-content: space-between; gap: 1rem; }
                .success { color: var(--success); }
                .mt-large { margin-top: 1rem; }
            `}</style>
        </div>
    );
};

export default BillingManager;
