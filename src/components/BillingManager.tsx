import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Download, Filter, ArrowUpRight } from 'lucide-react';

const BillingManager = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        const { data } = await supabase
            .from('payments')
            .select('*, rentals(customer_name, cars(model))')
            .order('payment_date', { ascending: false });

        if (data) {
            setPayments(data);
            const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
            setTotalRevenue(total);
        }
        setLoading(false);
    };

    const FinanceCard = ({ title, value, sub, icon: Icon, color }: any) => (
        <div className="glass-card finance-card">
            <div className="card-top">
                <div className="icon-box" style={{ background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
                    <Icon size={24} />
                </div>
                <span className="percentage">+12.5%</span>
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
                    <p>Controle de entradas, fluxo de caixa e pagamentos pendentes.</p>
                </div>
                <button className="btn-primary">
                    <Download size={18} />
                    <span>Exportar Relatório</span>
                </button>
            </div>

            <div className="finance-grid">
                <FinanceCard
                    title="Receita Bruta"
                    value={totalRevenue}
                    sub="Total de entradas no período"
                    icon={TrendingUp}
                    color="0, 229, 255"
                />
                <FinanceCard
                    title="Despesas (Manutenção)"
                    value={1250}
                    sub="Gastos com a frota"
                    icon={TrendingDown}
                    color="255, 61, 113"
                />
                <FinanceCard
                    title="Lucro Líquido"
                    value={totalRevenue - 1250}
                    sub="Saldo final disponível"
                    icon={DollarSign}
                    color="0, 230, 118"
                />
            </div>

            <div className="glass-card table-wrapper">
                <div className="table-header">
                    <h3>Transações Recentes</h3>
                    <button className="icon-btn"><Filter size={18} /></button>
                </div>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Método</th>
                            <th>Valor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Carregando transações...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma transação encontrada.</td></tr>
                        ) : (
                            payments.map((payment: any) => (
                                <tr key={payment.id}>
                                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                    <td>
                                        <p className="bold">{payment.rentals?.customer_name}</p>
                                        <p className="dim">Ref: {payment.rentals?.cars?.model}</p>
                                    </td>
                                    <td>{payment.payment_method || 'Cartão/Pix'}</td>
                                    <td>
                                        <span className="income">
                                            <ArrowUpRight size={14} />
                                            R$ {payment.amount}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status-badge paid">Pago</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
        .billing-container { display: flex; flex-direction: column; gap: 2rem; }
        .finance-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; }
        .finance-card { flex: 1; min-width: 250px; }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .percentage { font-size: 0.75rem; font-weight: 700; color: var(--success); background: rgba(0, 230, 118, 0.1); padding: 0.2rem 0.5rem; border-radius: 6px; }
        .title { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 0.4rem; }
        .value { font-size: 1.6rem; font-weight: 800; }
        .sub { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.4rem; }
        
        .table-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--surface-border); }
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th { padding: 1.2rem; text-align: left; color: var(--text-dim); font-size: 0.85rem; border-bottom: 1px solid var(--surface-border); }
        .custom-table td { padding: 1.2rem; border-bottom: 1px solid var(--surface-border); }
        .income { display: flex; align-items: center; gap: 0.4rem; color: var(--success); font-weight: 700; }
        .bold { font-weight: 600; }
        .dim { font-size: 0.8rem; color: var(--text-dim); }
        .status-badge.paid { background: rgba(0, 230, 118, 0.1); color: var(--success); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
      `}</style>
        </div>
    );
};

export default BillingManager;
