import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Car, Plus, Settings2, Trash2, X } from 'lucide-react';

const FleetManager = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    license_plate: '',
    year: new Date().getFullYear(),
    daily_rate: 0,
    status: 'available'
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (data) setCars(data);
    setLoading(false);
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('cars').insert([newCar]);
    if (!error) {
      setIsModalOpen(false);
      fetchCars();
      setNewCar({ brand: '', model: '', license_plate: '', year: new Date().getFullYear(), daily_rate: 0, status: 'available' });
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (!error) fetchCars();
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
      available: { label: 'Disponível', color: 'var(--success)', bg: 'rgba(0, 230, 118, 0.1)' },
      rented: { label: 'Alugado', color: 'var(--primary)', bg: 'rgba(0, 229, 255, 0.1)' },
      maintenance: { label: 'Manutenção', color: 'var(--warning)', bg: 'rgba(255, 160, 0, 0.1)' }
    };
    const current = styles[status] || styles.available;

    return (
      <span className="status-badge" style={{ color: current.color, backgroundColor: current.bg }}>
        {current.label}
      </span>
    );
  };

  return (
    <div className="fleet-container">
      <div className="view-header">
        <div>
          <h2>Minha Frota</h2>
          <p>Gerencie seus veículos.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Adicionar Carro</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content animate-fade-in">
            <div className="modal-header">
              <h3>Cadastrar Veículo</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCar}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Marca</label>
                  <input required placeholder="Ex: Fiat" value={newCar.brand} onChange={e => setNewCar({ ...newCar, brand: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Modelo</label>
                  <input required placeholder="Ex: Cronos" value={newCar.model} onChange={e => setNewCar({ ...newCar, model: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Placa</label>
                  <input required placeholder="Ex: ABC-1234" value={newCar.license_plate} onChange={e => setNewCar({ ...newCar, license_plate: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Ano</label>
                  <input type="number" value={newCar.year} onChange={e => setNewCar({ ...newCar, year: parseInt(e.target.value) })} />
                </div>
                <div className="input-group">
                  <label>Valor Diária (R$)</label>
                  <input type="number" step="0.01" value={newCar.daily_rate} onChange={e => setNewCar({ ...newCar, daily_rate: parseFloat(e.target.value) })} />
                </div>
              </div>
              <button type="submit" className="btn-primary full-width">Salvar Veículo</button>
            </form>
          </div>
        </div>
      )}

      <div className="cars-grid">
        {loading ? (
          <p>Carregando frota...</p>
        ) : cars.length === 0 ? (
          <div className="glass-card empty-state">
            <Car size={48} color="var(--text-dim)" />
            <p>Nenhum carro cadastrado ainda.</p>
          </div>
        ) : (
          cars.map((car) => (
            <div key={car.id} className="glass-card car-card">
              <div className="car-image-placeholder">
                <Car size={64} color="rgba(255,255,255,0.1)" />
              </div>
              <div className="car-info">
                <div className="car-header">
                  <h3>{car.brand} {car.model}</h3>
                  <StatusBadge status={car.status} />
                </div>
                <p className="plate">{car.license_plate} • {car.year}</p>
                <div className="car-footer">
                  <div className="price">
                    <span className="label">Diária</span>
                    <span className="value">R$ {car.daily_rate}</span>
                  </div>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => handleDeleteCar(car.id)} title="Excluir">
                      <Trash2 size={18} color="var(--error)" />
                    </button>
                    <button className="icon-btn"><Settings2 size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 2000;
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
        .full-width { width: 100%; justify-content: center; }

        .fleet-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .cars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .car-card {
          padding: 0;
          overflow: hidden;
        }
        .car-image-placeholder {
          height: 180px;
          background: linear-gradient(45deg, #1a1a2e, #16213e);
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--surface-border);
        }
        .car-info {
          padding: 1.5rem;
        }
        .car-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .car-header h3 { font-size: 1.25rem; }
        .plate {
          color: var(--text-dim);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .status-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .car-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--surface-border);
          padding-top: 1rem;
        }
        .price .label {
          font-size: 0.75rem;
          color: var(--text-dim);
          display: block;
        }
        .price .value {
          font-weight: 700;
          color: var(--primary);
        }
        .actions { display: flex; gap: 1rem; }
        .icon-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s;
        }
        .icon-btn:hover { color: white; }
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem;
          gap: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default FleetManager;
