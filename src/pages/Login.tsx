import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    // Simular delay para feedback visual premium
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(email, password);
    
    if (success) {
      navigate('/monitoramento');
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos de fundo premium */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-outline-variant/20 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.2)] p-8 sm:p-12 relative z-10">
        
        {/* Header do Login */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20">
            <Lock size={28} className="text-surface" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight mb-2">ESCALA DAPS</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/80">Acesso Restrito</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>Credenciais inválidas. Verifique e tente novamente.</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">E-mail de Acesso</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="daps.cap53@gmail.com"
                className="w-full bg-surface-low border border-outline-variant/20 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-low border border-outline-variant/20 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-8 ${
              isLoading 
                ? 'bg-outline/20 text-outline cursor-wait' 
                : 'bg-primary text-surface hover:bg-primary-container shadow-lg shadow-primary/20 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Sistema
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé do Login */}
        <div className="mt-10 text-center">
          <p className="text-[10px] text-outline/60 uppercase tracking-[0.2em] font-medium">
            Uso exclusivo da gestão CAP5.3
          </p>
        </div>
      </div>
    </div>
  );
}