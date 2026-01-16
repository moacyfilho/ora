import React, { useState } from 'react';
import { LogIn, Lock, User, AlertCircle, Car } from 'lucide-react';

interface LoginProps {
    onLogin: (password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulação de delay para efeito visual premium
        setTimeout(() => {
            if (password === 'Jordan31@') {
                onLogin(password);
            } else {
                setError(true);
                setLoading(false);
                setTimeout(() => setError(false), 3000);
            }
        }, 800);
    };

    return (
        <div className="login-container">
            <div className="login-box glass-card animate-fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <Car size={40} color="var(--primary)" />
                    </div>
                    <h1 className="gradient-text">ORA CARS</h1>
                    <p>Painel Administrativo</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-field">
                        <User className="input-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Usuário"
                            value="Ot@vio2026"
                            disabled
                        />
                    </div>

                    <div className={`input-field ${error ? 'error' : ''}`}>
                        <Lock className="input-icon" size={18} />
                        <input
                            type="password"
                            placeholder="Senha de Acesso"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="error-message animate-fade-in">
                            <AlertCircle size={16} />
                            <span>Senha incorreta. Tente novamente.</span>
                        </div>
                    )}

                    <button type="submit" className="btn-primary login-btn" disabled={loading}>
                        {loading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Entrar no Sistema</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 Ora Cars Fleet Management</p>
                </div>
            </div>

            <style>{`
        .login-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(112, 0, 255, 0.08) 0%, transparent 40%);
        }

        .login-box {
          width: 100%;
          max-width: 420px;
          padding: 3rem 2.5rem;
          text-align: center;
          border: 1px solid rgba(0, 229, 255, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 229, 255, 0.1);
        }

        .login-header {
          margin-bottom: 2.5rem;
        }

        .login-logo {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          border: 1px solid var(--surface-border);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .login-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--text-dim);
          font-size: 0.95rem;
          letter-spacing: 1px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .input-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1.2rem;
          color: var(--text-dim);
          transition: color 0.3s;
        }

        .input-field input {
          width: 100%;
          padding: 1.1rem 1.2rem 1.1rem 3.2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--surface-border);
          border-radius: 14px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
        }

        .input-field input:focus {
          border-color: var(--primary);
          background: rgba(0, 229, 255, 0.05);
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.15);
        }

        .input-field input:focus + .input-icon {
          color: var(--primary);
        }

        .input-field.error input {
          border-color: var(--error);
          background: rgba(255, 61, 113, 0.05);
        }

        .error-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--error);
          font-size: 0.85rem;
          margin-top: -0.5rem;
        }

        .login-btn {
          margin-top: 1rem;
          justify-content: center;
          padding: 1.1rem;
          font-size: 1.1rem;
          border-radius: 14px;
        }

        .login-footer {
          margin-top: 2.5rem;
          color: var(--text-dim);
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Login;
