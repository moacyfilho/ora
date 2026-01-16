import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Car, Plus, Settings2, Trash2, X, Search, User, Clock, CheckCircle } from 'lucide-react';
import { EditCarModal } from './EditCarModal';
import { differenceInDays } from 'date-fns';

const FleetManager = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    // Fetch cars with their latest active rental
    const { data } = await supabase
      .from('cars')
      .select('*, rentals(*)')
      .order('created_at', { ascending: false });

    if (data) {
      // Filter rentals to keep only the active one in JS
      const carsWithActiveRental = data.map(car => ({
        ...car,
        activeRental: (car.rentals || []).find((r: any) => r.status === 'active')
      }));
      setCars(carsWithActiveRental);
    }
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
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (!error) {
      fetchCars();
      setConfirmDeleteId(null);
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch =
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.license_plate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <div className="header-controls">
          <div className="search-field">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Marca, modelo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Filtro: Todos</option>
            <option value="available">Disponíveis</option>
            <option value="rented">Alugados</option>
            <option value="maintenance">Manutenção</option>
          </select>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Novo Carro</span>
          </button>
        </div>
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
        ) : filteredCars.length === 0 ? (
          <div className="glass-card empty-state">
            <Search size={48} color="var(--text-dim)" />
            <p>Nenhum veículo encontrado com esses filtros.</p>
            <button className="btn-secondary" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
              Limpar Filtros
            </button>
          </div>
        ) : (
          filteredCars.map((car) => (
            <div key={car.id} className={`glass-card car-card ${car.status}`}>
              <div className="car-image-container">
                <img
                  src={`https://source.unsplash.com/featured/800x600?${car.brand},${car.model},car,studio`}
                  alt={`${car.brand} ${car.model}`}
                  className="car-image unified-style"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <div className="image-overlay">
                  <StatusBadge status={car.status} />
                </div>
              </div>

              <div className="car-info">
                <div className="car-header">
                  <div>
                    <h3>{car.brand} {car.model}</h3>
                    <p className="plate">{car.license_plate} • {car.year}</p>
                  </div>
                </div>

                <div className="telematics">
                  <div className="telematic-item">
                    <span className="label">Combustível</span>
                    <div className="fuel-bar-bg">
                      <div className="fuel-bar-fill" style={{ width: '75%', background: 'var(--primary)' }}></div>
                    </div>
                  </div>
                  <div className="telematic-item">
                    <span className="label">KM Rodados</span>
                    <span className="value">12.450 km</span>
                  </div>
                </div>

                {car.status === 'rented' && car.activeRental && (
                  <div className="rental-info-tag animate-fade-in">
                    <div className="info-row">
                      <User size={14} color="var(--primary)" />
                      <span>{car.activeRental.customer_name}</span>
                    </div>
                    <div className="info-row">
                      <Clock size={14} color="var(--primary)" />
                      <span>{differenceInDays(new Date(car.activeRental.end_date), new Date())} dias p/ devolução</span>
                    </div>
                  </div>
                )}

                {car.status === 'available' && (
                  <div className="available-info-tag">
                    <CheckCircle size={14} />
                    <span>Pronto para operação</span>
                  </div>
                )}

                <div className="car-footer">
                  <div className="price">
                    <span className="label">Valor Diária</span>
                    <span className="value">R$ {car.daily_rate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="actions">
                    <div className="delete-container">
                      {confirmDeleteId === car.id ? (
                        <div className="confirm-actions animate-fade-in">
                          <button className="confirm-yes" onClick={() => handleDeleteCar(car.id)}>S</button>
                          <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>N</button>
                        </div>
                      ) : (
                        <button className="icon-btn" onClick={() => setConfirmDeleteId(car.id)} title="Excluir">
                          <Trash2 size={18} color="var(--error)" className="trash-icon" style={{ opacity: 0.6 }} />
                        </button>
                      )}
                    </div>
                    <button
                      className="icon-btn"
                      onClick={() => setEditingCar(car)}
                      title="Editar Detalhes"
                    >
                      <Settings2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EditCarModal
        isOpen={!!editingCar}
        onClose={() => setEditingCar(null)}
        onSuccess={fetchCars}
        car={editingCar}
      />

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
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--surface-border);
          position: relative;
        }
        .car-card:hover {
          transform: translateY(-10px);
          border-color: rgba(0, 229, 255, 0.4);
          box-shadow: 0 15px 30px rgba(0, 229, 255, 0.1);
        }
        .car-card.available:hover { box-shadow: 0 15px 30px rgba(0, 230, 118, 0.1); }
        .car-card.rented:hover { box-shadow: 0 15px 30px rgba(0, 229, 255, 0.1); }
        .car-card.maintenance:hover { box-shadow: 0 15px 30px rgba(255, 160, 0, 0.1); }

        .car-image-container {
          height: 180px;
          position: relative;
          overflow: hidden;
        }
        .car-image-container::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(180deg, rgba(10, 10, 20, 0) 0%, rgba(10, 10, 20, 0.4) 100%);
          pointer-events: none;
        }
        .car-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }
        .car-image.unified-style {
          filter: brightness(0.7) contrast(1.2) saturate(1.1);
          mix-blend-mode: luminosity;
          opacity: 0.9;
        }
        .car-card:hover .car-image.unified-style {
          filter: brightness(0.9) contrast(1.1) saturate(1.3);
          mix-blend-mode: normal;
          opacity: 1;
        }
        .car-card:hover .car-image {
          transform: scale(1.1);
        }
        .image-overlay {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
        }
        .car-info {
          padding: 1.5rem;
        }
        .car-header h3 { font-size: 1.3rem; margin-bottom: 0.2rem; }
        .plate {
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
          font-family: monospace;
          background: rgba(0, 229, 255, 0.05);
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }
        
        .telematics {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
          background: rgba(255,255,255,0.02);
          padding: 1rem;
          border-radius: 10px;
        }
        .telematic-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .telematic-item .label { font-size: 0.75rem; color: var(--text-dim); }
        .telematic-item .value { font-size: 0.85rem; font-weight: 600; }
        
        .fuel-bar-bg {
          width: 60px;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .fuel-bar-fill {
          height: 100%;
          border-radius: 3px;
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .rental-info-tag {
          background: rgba(0, 229, 255, 0.03);
          border: 1px solid rgba(0, 229, 255, 0.1);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
        }
        .info-row span { font-weight: 600; color: white; }
        
        .available-info-tag {
          color: var(--success);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
          background: rgba(0, 230, 118, 0.05);
          padding: 0.8rem;
          border-radius: 10px;
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
        .actions .trash-icon { transition: all 0.2s; }
        .actions .trash-icon:hover { color: var(--error) !important; opacity: 1 !important; transform: scale(1.2); }
        .icon-btn:hover { color: white; transform: scale(1.1); }
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem;
          gap: 1rem;
          text-align: center;
        }

        .header-controls {
          display: flex;
          gap: 0.8rem;
          align-items: center;
        }

        .search-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-field .search-icon {
          position: absolute;
          left: 0.8rem;
          color: var(--text-dim);
          pointer-events: none;
        }

        .search-field input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--surface-border);
          padding: 0.6rem 0.8rem 0.6rem 2.5rem;
          border-radius: 8px;
          color: white;
          width: 220px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .search-field input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .filter-select {
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          padding: 0.6rem;
          border-radius: 8px;
          color: var(--primary);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .filter-select option {
          background: #111;
          color: white;
        }

        .btn-secondary {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--surface-border);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
        }

        .delete-container {
          display: flex;
          align-items: center;
        }

        .confirm-actions {
          display: flex;
          gap: 0.3rem;
        }

        .confirm-yes, .confirm-no {
          border: none;
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
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

export default FleetManager;
