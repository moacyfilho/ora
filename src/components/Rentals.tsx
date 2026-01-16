import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MoreVertical, CheckCircle, Clock, FileText, Trash2 } from 'lucide-react';
import { generateRentalContract } from '../utils/contractGenerator';
import { EditRentalModal } from './EditRentalModal';

const Rentals = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingRental, setEditingRental] = useState<any | null>(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('*, cars(model, brand, license_plate), customers(full_name, document_cpf, phone)')
      .order('created_at', { ascending: false });

    if (data) setRentals(data);
    setLoading(false);
  };

  const handleDeleteRental = async (id: string) => {
    const { error } = await supabase.from('rentals').delete().eq('id', id);
    if (!error) {
      fetchRentals();
      setConfirmDeleteId(null);
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div className="rentals-container">
      <div className="view-header">
        <div>
          <h2>Controle de Aluguéis</h2>
          <p>Histórico completo e contratos ativos.</p>
        </div>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar por cliente ou carro..." />
        </div>
      </div>

      <div className="glass-card table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Veículo</th>
              <th>Período</th>
              <th>Status</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Carregando registros...</td></tr>
            ) : rentals.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum aluguel registrado.</td></tr>
            ) : (
              rentals.map((rental) => (
                <tr key={rental.id}>
                  <td>
                    <div className="customer-cell">
                      <p className="name">{rental.customer_name}</p>
                      <p className="phone">{rental.customer_phone}</p>
                    </div>
                  </td>
                  <td>
                    <div className="car-cell">
                      <p>{rental.cars.brand} {rental.cars.model}</p>
                      <p className="plate">{rental.cars.license_plate}</p>
                    </div>
                  </td>
                  <td>
                    <div className="period-cell">
                      <p>{new Date(rental.start_date).toLocaleDateString()}</p>
                      <p className="to">até {new Date(rental.end_date).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`status-tag ${rental.status}`}>
                      {rental.status === 'active' ? <Clock size={12} /> : <CheckCircle size={12} />}
                      {rental.status === 'active' ? 'Ativo' : 'Concluído'}
                    </span>
                  </td>
                  <td>
                    <p className="amount">R$ {rental.total_amount}</p>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-contract"
                      title="Gerar Contrato PDF"
                      onClick={() => generateRentalContract(rental)}
                    >
                      <FileText size={18} />
                      <span>Contrato</span>
                    </button>

                    <button
                      className="btn-edit"
                      title="Editar Aluguel"
                      onClick={() => setEditingRental(rental)}
                    >
                      <MoreVertical size={18} />
                      <span>Editar</span>
                    </button>

                    <div className="delete-container">
                      {confirmDeleteId === rental.id ? (
                        <div className="confirm-actions animate-fade-in">
                          <button className="confirm-yes" onClick={() => handleDeleteRental(rental.id)}>S</button>
                          <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>N</button>
                        </div>
                      ) : (
                        <button
                          className="btn-delete"
                          title="Excluir Aluguel"
                          onClick={() => setConfirmDeleteId(rental.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditRentalModal
        isOpen={!!editingRental}
        onClose={() => setEditingRental(null)}
        onSuccess={fetchRentals}
        rental={editingRental}
      />

      <style>{`
        .rentals-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .search-bar input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--surface-border);
          padding: 0.8rem 1rem 0.8rem 3rem;
          border-radius: 12px;
          color: white;
          outline: none;
        }
        .search-bar input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px var(--primary-glow);
        }
        .table-wrapper {
          padding: 0;
          overflow-x: auto;
        }
        .custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .custom-table th {
          padding: 1.2rem;
          color: var(--text-dim);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          border-bottom: 1px solid var(--surface-border);
        }
        .custom-table td {
          padding: 1.2rem;
          border-bottom: 1px solid var(--surface-border);
        }
        .customer-cell .name { font-weight: 600; }
        .customer-cell .phone { font-size: 0.8rem; color: var(--text-dim); }
        .car-cell .plate { font-size: 0.75rem; color: var(--primary); }
        .period-cell .to { font-size: 0.8rem; color: var(--text-dim); }
        .status-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-tag.active {
          color: var(--primary);
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.2);
        }
        .status-tag.completed {
          color: var(--success);
          background: rgba(0, 230, 118, 0.1);
          border: 1px solid rgba(0, 230, 118, 0.2);
        }
        .amount { font-weight: 700; color: var(--primary); }
        .actions-cell {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .btn-contract {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: var(--primary);
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-contract:hover {
          background: var(--primary);
          color: #000;
          box-shadow: 0 0 10px var(--primary-glow);
        }
        .btn-delete {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 61, 113, 0.1);
          border: 1px solid rgba(255, 61, 113, 0.2);
          color: var(--error);
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-delete:hover {
          background: var(--error);
          color: white;
        }
        .btn-edit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--surface-border);
          color: white;
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-edit:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
        }
        .delete-container {
          min-width: 44px;
          display: flex;
          justify-content: center;
        }
        .confirm-actions {
          display: flex;
          gap: 0.3rem;
        }
        .confirm-yes, .confirm-no {
          border: none;
          border-radius: 4px;
          padding: 0.3rem 0.6rem;
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

export default Rentals;
