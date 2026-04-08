import React, { useState } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: boolean;
}

export function PasswordConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Operação", 
  description = "Para sua segurança, confirme a senha de acesso ao sistema para prosseguir com esta alteração.",
  isLoading = false,
  error = false
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-surface border border-outline-variant/20 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header com gradiente sutil */}
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface tracking-tight">{title}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Verificação de Segurança</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <p className="text-sm text-outline leading-relaxed font-medium">
            {description}
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-outline uppercase tracking-[0.2em] ml-1">Senha do Sistema</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="password" 
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de login..."
                className={`w-full bg-surface-low border rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-4 transition-all text-on-surface outline-none placeholder:text-outline/40 ${
                  error 
                    ? 'border-error focus:ring-error/10 focus:border-error' 
                    : 'border-outline-variant/20 focus:ring-primary/10 focus:border-primary'
                }`}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-error text-[10px] font-bold uppercase tracking-wider ml-1 animate-in slide-in-from-top-1">
                <AlertCircle size={12} />
                <span>Senha incorreta. Tente novamente.</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-outline hover:bg-surface-high rounded-2xl transition-all border border-outline-variant/10"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isLoading || !password}
              className={`flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isLoading || !password
                  ? 'bg-outline/20 text-outline cursor-not-allowed shadow-none' 
                  : 'bg-primary text-surface hover:bg-primary-container shadow-primary/20 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
              ) : (
                <>
                  Confirmar
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
