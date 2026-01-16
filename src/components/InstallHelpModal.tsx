import { X, Share, MoreVertical, PlusSquare } from 'lucide-react';

interface InstallHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

export function InstallHelpModal({ isOpen, onClose, platform }: InstallHelpModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 2000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Instalar App</h2>

                {platform === 'ios' && (
                    <div className="install-steps">
                        <p>No <strong>iPhone/iPad</strong>, a instalação é manual:</p>
                        <ol style={{ textAlign: 'left', margin: '1.5rem 0', paddingLeft: '1.5rem', listStyle: 'none' }}>
                            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                1. Toque no botão <strong>Compartilhar</strong> <Share size={20} style={{ color: '#007AFF' }} />
                            </li>
                            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={20} />
                            </li>
                            <li>3. Confirme clicando em <strong>Adicionar</strong>.</li>
                        </ol>
                    </div>
                )}

                {platform === 'android' && (
                    <div className="install-steps">
                        <p>No <strong>Android</strong> (se não abriu automático):</p>
                        <ol style={{ textAlign: 'left', margin: '1.5rem 0', paddingLeft: '1.5rem', listStyle: 'none' }}>
                            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                1. Toque nos <strong>3 pontinhos</strong> do navegador <MoreVertical size={20} />
                            </li>
                            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                2. Selecione <strong>"Instalar aplicativo"</strong> ou "Adicionar à tela inicial".
                            </li>
                        </ol>
                    </div>
                )}

                {(platform === 'desktop' || platform === 'unknown') && (
                    <p>Procure o ícone de instalação na barra de endereço do seu navegador (geralmente um ícone de computador ou +).</p>
                )}

                <button className="btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '1rem' }}>
                    Entendido
                </button>
            </div>
        </div>
    );
}
