import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Save, Bell, Shield, Palette, Plus, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Configuracoes() {
  const { 
    linhasCuidado, addLinha, removeLinha, 
    categorias, addCategoria, removeCategoria,
    vinculos, addVinculo, removeVinculo
  } = useSettings();

  const [novaLinha, setNovaLinha] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoVinculo, setNovoVinculo] = useState('');

  const handleAddLinha = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaLinha.trim()) {
      addLinha(novaLinha.trim());
      setNovaLinha('');
    }
  };

  const handleAddCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaCategoria.trim()) {
      addCategoria(novaCategoria.trim());
      setNovaCategoria('');
    }
  };

  const handleAddVinculo = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoVinculo.trim()) {
      addVinculo(novoVinculo.trim());
      setNovoVinculo('');
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
                disabled={!novaLinha.trim()}
                className="px-4 py-2.5 bg-surface-high text-on-surface text-sm font-bold rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-bright transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm"
              >
                <Plus size={18} className="text-primary" />
                Adicionar
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {linhasCuidado.map((linha) => (
                <div key={linha} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high border border-outline-variant/20 rounded-full group hover:border-error/30 transition-colors">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{linha}</span>
                  <button 
                    onClick={() => removeLinha(linha)}
                    className="text-outline hover:text-error transition-colors p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
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
                disabled={!novaCategoria.trim()}
                className="px-4 py-2.5 bg-surface-high text-on-surface text-sm font-bold rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-bright transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm"
              >
                <Plus size={18} className="text-primary" />
                Adicionar
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high border border-outline-variant/20 rounded-full group hover:border-error/30 transition-colors">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{cat}</span>
                  <button 
                    onClick={() => removeCategoria(cat)}
                    className="text-outline hover:text-error transition-colors p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
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
                disabled={!novoVinculo.trim()}
                className="px-4 py-2.5 bg-surface-high text-on-surface text-sm font-bold rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-bright transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm"
              >
                <Plus size={18} className="text-primary" />
                Adicionar
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {vinculos.map((v) => (
                <div key={v} className="flex items-center gap-2 px-3 py-1.5 bg-surface-high border border-outline-variant/20 rounded-full group hover:border-error/30 transition-colors">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{v}</span>
                  <button 
                    onClick={() => removeVinculo(v)}
                    className="text-outline hover:text-error transition-colors p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}