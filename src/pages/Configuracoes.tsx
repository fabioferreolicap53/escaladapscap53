import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Plus, X, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Configuracoes() {
  const { 
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
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Sistema</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Configurações</h2>
        </div>
      </div>

      {/* Seção de Cadastros Base */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Linhas de Cuidado */}
        <div className="bg-surface rounded-xl border border-outline-variant/15 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface">Linhas de Cuidado</h3>
            <p className="text-sm text-outline mt-1">Gerencie os departamentos e setores do hospital.</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleAddLinha} className="flex gap-3 mb-6">
              <input 
                type="text" 
                value={novaLinha}
                onChange={(e) => setNovaLinha(e.target.value)}
                placeholder="Nova linha de cuidado..."
                className="flex-grow bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!novaLinha.trim() || isSubmittingLinha}
                className="px-4 py-2.5 bg-surface-high text-on-surface text-sm font-bold rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-bright transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm"
              >
                {isSubmittingLinha ? <Loader2 size={18} className="animate-spin text-primary" /> : <Plus size={18} className="text-primary" />}
                Adicionar
              </button>
            </form>

            {isLoadingLinhas ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary/50" /></div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {linhasCuidado.map((linha) => (
                  <div key={linha.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high border border-outline-variant/20 rounded-full group hover:border-error/30 transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{linha.name}</span>
                    <button 
                      onClick={() => removeLinha(linha.id)}
                      className="text-outline hover:text-error transition-colors p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categorias Profissionais */}
        <div className="bg-surface rounded-xl border border-outline-variant/15 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface">Categorias Profissionais</h3>
            <p className="text-sm text-outline mt-1">Gerencie os cargos disponíveis para os profissionais.</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleAddCategoria} className="flex gap-3 mb-6">
              <input 
                type="text" 
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Nova categoria profissional..."
                className="flex-grow bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!novaCategoria.trim() || isSubmittingCategoria}
                className="px-4 py-2.5 bg-surface-high text-on-surface text-sm font-bold rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-bright transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm"
              >
                {isSubmittingCategoria ? <Loader2 size={18} className="animate-spin text-primary" /> : <Plus size={18} className="text-primary" />}
                Adicionar
              </button>
            </form>

            {isLoadingCategorias ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary/50" /></div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high border border-outline-variant/20 rounded-full group hover:border-error/30 transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{cat.name}</span>
                    <button 
                      onClick={() => removeCategoria(cat.id)}
                      className="text-outline hover:text-error transition-colors p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tipos de Vínculo */}
        <div className="bg-surface rounded-xl border border-outline-variant/15 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface">Tipos de Vínculo</h3>
            <p className="text-sm text-outline mt-1">Gerencie as formas de contratação dos profissionais.</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleAddVinculo} className="flex gap-3 mb-6">
              <input 
                type="text" 
                value={novoVinculo}
                onChange={(e) => setNovoVinculo(e.target.value)}
                placeholder="Novo tipo de vínculo..."
                className="flex-grow bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!novoVinculo.trim() || isSubmittingVinculo}
                className="px-4 py-2.5 bg-surface-high text-on-surface text-sm font-bold rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-bright transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm"
              >
                {isSubmittingVinculo ? <Loader2 size={18} className="animate-spin text-primary" /> : <Plus size={18} className="text-primary" />}
                Adicionar
              </button>
            </form>

            {isLoadingVinculos ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary/50" /></div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vinculos.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high border border-outline-variant/20 rounded-full group hover:border-error/30 transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{v.name}</span>
                    <button 
                      onClick={() => removeVinculo(v.id)}
                      className="text-outline hover:text-error transition-colors p-0.5"
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
    </Layout>
  );
}