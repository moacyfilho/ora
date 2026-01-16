import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Plus, Search, Mail, Phone, FileText, Image as ImageIcon, ExternalLink, X } from 'lucide-react';

const CustomerManager = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: '',
    document_cpf: '',
    phone: '',
    email: '',
    address: ''
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('full_name', { ascending: true });

    if (data) setCustomers(data);
    setLoading(false);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('customers').insert([newCustomer]);
    if (!error) {
      setIsModalOpen(false);
      fetchCustomers();
      setNewCustomer({ full_name: '', document_cpf: '', phone: '', email: '', address: '' });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const result = await supabase.from('customers').delete().eq('id', id);

    if (result.error) {
      console.error('Erro ao excluir:', result.error);
      alert(`Não foi possível excluir o cliente: ${result.error.message}\n\nProvavelmente este cliente possui contratos ou aluguéis registrados.`);
    } else {
      fetchCustomers();
      setConfirmDeleteId(null);
    }
  };

  const handleFileUpload = async (customerId: string, type: 'cnh' | 'residence', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${customerId}_${type}_${Math.random()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ora-documents')
      .upload(filePath, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('ora-documents').getPublicUrl(filePath);
      const column = type === 'cnh' ? 'cnh_image_url' : 'residence_proof_url';
      await supabase.from('customers').update({ [column]: publicUrl }).eq('id', customerId);
      fetchCustomers();
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document_cpf.includes(searchTerm)
  );

  return (
    <div className="customers-container">
      <div className="view-header">
        <div>
          <h2>Cadastro de Clientes</h2>
          <p>Gerencie dados, CNH e comprovantes de residência.</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content animate-fade-in">
            <div className="modal-header">
              <h3>Novo Cliente</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCustomer}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Nome Completo</label>
                  <input required value={newCustomer.full_name} onChange={e => setNewCustomer({ ...newCustomer, full_name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>CPF</label>
                  <input required value={newCustomer.document_cpf} onChange={e => setNewCustomer({ ...newCustomer, document_cpf: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Telefone</label>
                  <input required value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>E-mail</label>
                  <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                </div>
                <div className="input-group full-width" style={{ gridColumn: '1 / -1' }}>
                  <label>Endereço</label>
                  <input value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary full-width">Salvar Cliente</button>
            </form>
          </div>
        </div>
      )}

      <div className="customers-grid">
        {loading ? (
          <p>Carregando clientes...</p>
        ) : filteredCustomers.length === 0 ? (
          <div className="glass-card empty-state">
            <Users size={48} color="var(--text-dim)" />
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="glass-card customer-card animate-fade-in">
              <div className="customer-main">
                <div className="avatar-large">{customer.full_name.substring(0, 2).toUpperCase()}</div>
                <div className="customer-info">
                  <h3>{customer.full_name}</h3>
                  <p className="cpf">CPF: {customer.document_cpf}</p>
                </div>
              </div>

              <div className="contact-info">
                <div className="info-item">
                  <Phone size={14} />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="info-item">
                    <Mail size={14} />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>

              <div className="documents-section">
                <p className="section-title">Documentos Anexados</p>
                <div className="doc-badges">
                  <div className={`doc-status ${customer.cnh_image_url ? 'ready' : 'missing'}`}>
                    <label className="upload-trigger">
                      <FileText size={14} />
                      <span>{customer.cnh_image_url ? 'Alterar CNH' : 'Enviar CNH'}</span>
                      <input type="file" accept="image/*" hidden onChange={e => handleFileUpload(customer.id, 'cnh', e)} />
                    </label>
                    {customer.cnh_image_url && (
                      <a href={customer.cnh_image_url} target="_blank" rel="noopener noreferrer" className="view-btn">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <div className={`doc-status ${customer.residence_proof_url ? 'ready' : 'missing'}`}>
                    <label className="upload-trigger">
                      <ImageIcon size={14} />
                      <span>{customer.residence_proof_url ? 'Alterar Res.' : 'Enviar Res.'}</span>
                      <input type="file" accept="image/*" hidden onChange={e => handleFileUpload(customer.id, 'residence', e)} />
                    </label>
                    {customer.residence_proof_url && (
                      <a href={customer.residence_proof_url} target="_blank" rel="noopener noreferrer" className="view-btn">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-actions">
                {confirmDeleteId === customer.id ? (
                  <div className="confirm-buttons animate-fade-in">
                    <p className="confirm-text">Excluir mesmo?</p>
                    <div className="btn-row">
                      <button className="btn-error-small" onClick={() => handleDeleteCustomer(customer.id)}>Sim</button>
                      <button className="btn-secondary-small" onClick={() => setConfirmDeleteId(null)}>Não</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="btn-secondary" onClick={() => setConfirmDeleteId(customer.id)}>Excluir</button>
                    <button className="btn-primary-small">Ver Contratos</button>
                  </>
                )}
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

        .customers-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .search-bar {
          position: relative;
          min-width: 300px;
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
        .customers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .customer-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .customer-main {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .avatar-large {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          color: #000;
        }
        .customer-info h3 { font-size: 1.1rem; }
        .cpf { font-size: 0.85rem; color: var(--text-dim); margin-top: 0.2rem; }
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--surface-border);
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-dim);
        }
        .section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.8rem;
          letter-spacing: 0.5px;
        }
        .doc-badges {
          display: flex;
          gap: 0.8rem;
        }
        .doc-status {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          transition: 0.2s;
        }
        .upload-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          flex: 1;
        }
        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 6px;
          color: white;
          margin-left: 0.5rem;
        }
        .view-btn:hover { background: rgba(255,255,255,0.2); }
        .doc-status.ready {
          background: rgba(0, 230, 118, 0.1);
          color: var(--success);
          border: 1px solid rgba(0, 230, 118, 0.2);
        }
        .doc-status.missing {
          background: rgba(255, 61, 113, 0.05);
          color: var(--error);
          border: 1px dashed rgba(255, 61, 113, 0.3);
          opacity: 0.7;
        }
        .card-actions {
          display: flex;
          gap: 0.8rem;
          margin-top: 0.5rem;
        }
        .card-actions button {
          flex: 1;
          font-size: 0.85rem;
          padding: 0.6rem;
        }
        .confirm-buttons {
          width: 100%;
          text-align: center;
          background: rgba(255, 61, 113, 0.1);
          padding: 0.8rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 61, 113, 0.2);
        }
        .confirm-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--error);
          margin-bottom: 0.5rem;
        }
        .btn-row {
          display: flex;
          gap: 0.5rem;
        }
        .btn-error-small {
          flex: 1;
          background: var(--error);
          border: none;
          color: white;
          padding: 0.4rem;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-secondary-small {
          flex: 1;
          background: rgba(255,255,255,0.1);
          border: 1px solid var(--surface-border);
          color: white;
          padding: 0.4rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary-small {
          background: var(--primary);
          border: none;
          color: #000;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CustomerManager;
