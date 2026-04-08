import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Plus, X, Loader2, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';

export default function Configuracoes() {
  const { 
    theme, toggleTheme,
    linhasCuidado, addLinha, removeLinha, isLoadingLinhas,
    categorias, addCategoria, removeCategoria, isLoadingCategorias,
    vinculos, addVinculo, removeVinculo, isLoadingVinculos
  } = useSettings();

  const [novaLinha, setNovaLinha] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoVinculo, setNovoVinculo] = useState('');

  const [isSubmittingLinha, setIsSubmittingLinha] = useState(false);
  const [isSubmittingCategoria, setIsSubmittingCategoria] = useState(false);
  const [isSubmittingVinculo, setIsSubmittingVinculo] = useState(false);

  // Password confirmation states
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'remove_linha' | 'remove_categoria' | 'remove_vinculo', id: string, name: string } | null>(null);
  const [passError, setPassError] = useState(false);

  const handleConfirmPassword = async (password: string) => {
    if (password === 'daps2022') {
      if (pendingAction) {
        if (pendingAction.type === 'remove_linha') await removeLinha(pendingAction.id);
        if (pendingAction.type === 'remove_categoria') await removeCategoria(pendingAction.id);
        if (pendingAction.type === 'remove_vinculo') await removeVinculo(pendingAction.id);
      }
      setIsPassModalOpen(false);
      setPendingAction(null);
    } else {
      setPassError(true);
    }
  };

  const requestRemove = (type: 'remove_linha' | 'remove_categoria' | 'remove_vinculo', id: string, name: string) => {
    setPendingAction({ type, id, name });
    setIsPassModalOpen(true);
    setPassError(false);
  };

  const handleAddLinha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaLinha.trim()) {
      setIsSubmittingLinha(true);
      await addLinha(novaLinha.trim());
      setNovaLinha('');
      setIsSubmittingLinha(false);
    }
  };

  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaCategoria.trim()) {
      setIsSubmittingCategoria(true);
      await addCategoria(novaCategoria.trim());
      setNovaCategoria('');
      setIsSubmittingCategoria(false);
    }
  };

  const handleAddVinculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novoVinculo.trim()) {
      setIsSubmittingVinculo(true);
      await addVinculo(novoVinculo.trim());
      setNovoVinculo('');
      setIsSubmittingVinculo(false);
    }
  };

  return (
    <Layout activePath="/configuracoes">
      <PasswordConfirmModal 
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onConfirm={handleConfirmPassword}
        error={passError}
        title="Confirmar Exclusão"
        description={`Você está prestes a remover "${pendingAction?.name}" das configurações base. Esta ação pode afetar registros existentes. Por favor, confirme sua senha.`}
      />
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Sistema</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Configurações</h2>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-low border border-outline-variant/20 rounded-xl hover:border-primary/50 transition-all active:scale-95"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} className="text-tertiary" />
              <span className="text-sm font-bold hidden sm:inline">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon size={18} className="text-primary" />
              <span className="text-sm font-bold hidden sm:inline">Modo Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Seção de Cadastros Base */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Linhas de Cuidado */}
        <div className="bg-surface/50 backdrop-blur-sm rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 group">
          <div className="p-6 border-b border-outline-variant/5 bg-surface-low/30 flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Linhas de Cuidado
            </h3>
            <span className="text-[10px] font-black text-outline uppercase tracking-widest">{linhasCuidado.length} Itens</span>
          </div>
          
          <div className="p-6 flex-grow flex flex-col">
            <form onSubmit={handleAddLinha} className="flex gap-2 mb-8">
              <input 
                type="text" 
                value={novaLinha}
                onChange={(e) => setNovaLinha(e.target.value)}
                placeholder="Nova linha..."
                className="flex-grow bg-surface-high/50 border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-outline/40"
              />
              <button 
                type="submit"
                disabled={!novaLinha.trim() || isSubmittingLinha}
                className="w-11 h-11 bg-primary text-surface rounded-xl flex items-center justify-center transition-all disabled:opacity-20 disabled:grayscale hover:brightness-110 active:scale-90 shadow-lg shadow-primary/20"
                title="Adicionar Linha de Cuidado"
              >
                {isSubmittingLinha ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
              </button>
            </form>

            <div className="flex-grow min-h-[120px]">
              {isLoadingLinhas ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary/30" /></div>
              ) : linhasCuidado.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-outline/30 italic text-xs">
                  Nenhuma linha cadastrada
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {linhasCuidado.map((linha) => (
                    <div key={linha.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high/80 border border-outline-variant/10 rounded-lg group/tag hover:border-error/30 hover:bg-error/5 transition-all duration-300">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant group-hover/tag:text-error/80 transition-colors">{linha.name}</span>
                      <button 
                        onClick={() => requestRemove('remove_linha', linha.id, linha.name)}
                        className="text-outline/40 hover:text-error transition-colors p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categorias Profissionais */}
        <div className="bg-surface/50 backdrop-blur-sm rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col transition-all hover:border-secondary/20 hover:shadow-lg hover:shadow-secondary/5 group">
          <div className="p-6 border-b border-outline-variant/5 bg-surface-low/30 flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Categorias Profissionais
            </h3>
            <span className="text-[10px] font-black text-outline uppercase tracking-widest">{categorias.length} Itens</span>
          </div>
          
          <div className="p-6 flex-grow flex flex-col">
            <form onSubmit={handleAddCategoria} className="flex gap-2 mb-8">
              <input 
                type="text" 
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Nova categoria..."
                className="flex-grow bg-surface-high/50 border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 outline-none transition-all placeholder:text-outline/40"
              />
              <button 
                type="submit"
                disabled={!novaCategoria.trim() || isSubmittingCategoria}
                className="w-11 h-11 bg-secondary text-surface rounded-xl flex items-center justify-center transition-all disabled:opacity-20 disabled:grayscale hover:brightness-110 active:scale-90 shadow-lg shadow-secondary/20"
                title="Adicionar Categoria"
              >
                {isSubmittingCategoria ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
              </button>
            </form>

            <div className="flex-grow min-h-[120px]">
              {isLoadingCategorias ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-secondary/30" /></div>
              ) : categorias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-outline/30 italic text-xs">
                  Nenhuma categoria cadastrada
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high/80 border border-outline-variant/10 rounded-lg group/tag hover:border-error/30 hover:bg-error/5 transition-all duration-300">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant group-hover/tag:text-error/80 transition-colors">{cat.name}</span>
                      <button 
                        onClick={() => requestRemove('remove_categoria', cat.id, cat.name)}
                        className="text-outline/40 hover:text-error transition-colors p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tipos de Vínculo */}
        <div className="bg-surface/50 backdrop-blur-sm rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 group">
          <div className="p-6 border-b border-outline-variant/5 bg-surface-low/30 flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Tipos de Vínculo
            </h3>
            <span className="text-[10px] font-black text-outline uppercase tracking-widest">{vinculos.length} Itens</span>
          </div>
          
          <div className="p-6 flex-grow flex flex-col">
            <form onSubmit={handleAddVinculo} className="flex gap-2 mb-8">
              <input 
                type="text" 
                value={novoVinculo}
                onChange={(e) => setNovoVinculo(e.target.value)}
                placeholder="Novo vínculo..."
                className="flex-grow bg-surface-high/50 border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-outline/40"
              />
              <button 
                type="submit"
                disabled={!novoVinculo.trim() || isSubmittingVinculo}
                className="w-11 h-11 bg-primary text-surface rounded-xl flex items-center justify-center transition-all disabled:opacity-20 disabled:grayscale hover:brightness-110 active:scale-90 shadow-lg shadow-primary/20"
                title="Adicionar Vínculo"
              >
                {isSubmittingVinculo ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
              </button>
            </form>

            <div className="flex-grow min-h-[120px]">
              {isLoadingVinculos ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary/30" /></div>
              ) : vinculos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-outline/30 italic text-xs">
                  Nenhum vínculo cadastrado
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {vinculos.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high/80 border border-outline-variant/10 rounded-lg group/tag hover:border-error/30 hover:bg-error/5 transition-all duration-300">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant group-hover/tag:text-error/80 transition-colors">{v.name}</span>
                      <button 
                        onClick={() => requestRemove('remove_vinculo', v.id, v.name)}
                        className="text-outline/40 hover:text-error transition-colors p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}