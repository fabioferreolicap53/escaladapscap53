import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { Layout } from '../components/Layout';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Filter, 
  Download, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  X,
  Upload,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

import { useProfissionais } from '../hooks/useProfissionais';

export default function Profissionais() {
  const { categorias, vinculos, linhasCuidado, searchTerm, setSearchTerm } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExcluirConfirm, setShowExcluirConfirm] = useState<string | null>(null);
  const [confirmacaoExclusaoPasso, setConfirmacaoExclusaoPasso] = useState<number>(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    categoria: '',
    vinculo: ''
  });
  const [editingProfissionalId, setEditingProfissionalId] = useState<string | null>(null);
  const [novoProfissional, setNovoProfissional] = useState({
    name: '',
    role: '',
    vinculo: '',
    linha_cuidado: ''
  });

  const { profissionais, isLoading, addProfissional, updateProfissional, deleteProfissional } = useProfissionais();

  const handleSalvarProfissional = async (e: FormEvent) => {
    e.preventDefault();
    if (!novoProfissional.name || !novoProfissional.role) return;

    if (editingProfissionalId) {
      // Lógica de Edição via PocketBase
      await updateProfissional(editingProfissionalId, {
        name: novoProfissional.name,
        role: novoProfissional.role,
        vinculo: novoProfissional.vinculo || "CLT",
        linha_cuidado: novoProfissional.linha_cuidado || ""
      });
    } else {
      // Lógica de Criação via PocketBase
      await addProfissional({
        name: novoProfissional.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(novoProfissional.name)}&background=random&color=fff`,
        role: novoProfissional.role,
        vinculo: novoProfissional.vinculo || "CLT",
        linha_cuidado: novoProfissional.linha_cuidado || ""
      });
    }
    
    fecharModal();
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditingProfissionalId(null);
    setNovoProfissional({ name: '', role: '', vinculo: '', linha_cuidado: '' });
  };

  const handleEditClick = (prof: any) => {
    setEditingProfissionalId(prof.id);
    setNovoProfissional({
      name: prof.name,
      role: prof.role,
      vinculo: prof.vinculo || '',
      linha_cuidado: prof.linha_cuidado || ''
    });
    setIsModalOpen(true);
  };

  const handleExcluirProfissional = async (id: string) => {
    // Se ainda não confirmou a primeira vez (passo 0), avança para o passo 1
    if (confirmacaoExclusaoPasso === 0) {
      setConfirmacaoExclusaoPasso(1);
      return;
    }

    // Se já confirmou a primeira vez (passo 1), realiza a exclusão
    const profExcluido = profissionais.find(p => p.id === id);
    if (profExcluido) {
      await deleteProfissional(id);
      setShowExcluirConfirm(null);
      setConfirmacaoExclusaoPasso(0); // Reseta o passo
      setShowSuccessAlert(`Profissional ${profExcluido.name} excluído com sucesso!`);
      
      // Esconde o alerta de sucesso após 3 segundos
      setTimeout(() => {
        setShowSuccessAlert(null);
      }, 3000);
    }
  };

  const filteredProfissionais = (profissionais || []).filter(prof => {
    // Filtros Avançados
    if (filters.categoria && prof.role !== filters.categoria) return false;
    if (filters.vinculo && prof.vinculo !== filters.vinculo) return false;

    // Busca por Texto
    if (searchTerm && 
        !prof.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !prof.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const clearFilters = () => {
    setFilters({ categoria: '', vinculo: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.categoria || filters.vinculo || searchTerm;

  return (
    <Layout activePath="/profissionais">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-8 mb-10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Gestão de Equipe</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Profissionais Cadastrados</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => {
              setEditingProfissionalId(null);
              setNovoProfissional({ name: '', role: '', vinculo: '', linha_cuidado: '' });
              setIsModalOpen(true);
            }}
            className="px-4 sm:px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-surface text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 transition-all active:scale-95 w-full sm:w-auto"
          >
            <UserPlus size={18} />
            Novo Profissional
          </button>
        </div>
      </div>

      {/* Dashboard / Filters Section */}
      <div className="flex justify-end gap-6 mb-8">
        <div className="w-full md:w-1/3 flex gap-3 relative">
          <div 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-grow bg-surface-low rounded-xl px-4 py-3 sm:py-0 flex items-center justify-center sm:justify-start gap-3 transition-all cursor-pointer border ${
              hasActiveFilters 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-outline-variant/10 text-outline hover:bg-surface-high hover:border-outline-variant/30'
            }`}
          >
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {hasActiveFilters ? 'Filtros Ativos' : 'Filtragem Avançada'}
            </span>
          </div>

          {showFilters && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowFilters(false)} 
              />
              <div className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl p-5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Filtros</h4>
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-bold text-outline hover:text-error transition-colors uppercase tracking-tighter"
                  >
                    Limpar Tudo
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Categoria</label>
                    <select 
                      value={filters.categoria}
                      onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                      className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                    >
                      <option value="">Todas as categorias</option>
                      {categorias.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Vínculo</label>
                    <select 
                      value={filters.vinculo}
                      onChange={(e) => setFilters({...filters, vinculo: e.target.value})}
                      className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                    >
                      <option value="">Todos os vínculos</option>
                      {vinculos.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <button className="w-12 h-full bg-surface-low rounded-xl flex items-center justify-center text-outline hover:text-primary border border-outline-variant/10 hover:border-outline-variant/30 transition-all active:scale-90">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface-low rounded-xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface/50 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Profissional</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Categoria Profissional</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Vínculo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Linha de Cuidado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                      <p className="text-on-surface-variant font-medium">Buscando profissionais...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProfissionais.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-surface-high flex items-center justify-center mb-4">
                        <AlertTriangle size={24} className="text-outline/40" />
                      </div>
                      <p className="text-on-surface-variant font-medium">Nenhum profissional encontrado.</p>
                      <p className="text-xs text-outline mt-1">Tente ajustar os filtros ou adicione um novo.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProfissionais.map((prof) => (
                  <TableRow 
                    key={prof.id}
                    prof={prof}
                    onEdit={() => handleEditClick(prof)}
                    onDelete={() => setShowExcluirConfirm(prof.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-4 bg-surface/30 border-t border-outline-variant/10 flex justify-between items-center">
          <span className="text-xs text-outline">Mostrando <span className="text-on-surface font-bold">1-10</span> de <span className="text-on-surface font-bold">124</span> profissionais</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center text-outline hover:bg-surface hover:text-on-surface">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded bg-primary-container text-primary text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center text-outline hover:bg-surface hover:text-on-surface text-xs font-bold">2</button>
            <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center text-outline hover:bg-surface hover:text-on-surface text-xs font-bold">3</button>
            <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center text-outline hover:bg-surface hover:text-on-surface">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Novo Profissional */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <div>
                <h3 className="text-xl font-bold text-on-surface">
                  {editingProfissionalId ? 'Editar Profissional' : 'Novo Profissional'}
                </h3>
                <p className="text-xs text-outline mt-1">
                  {editingProfissionalId ? 'Atualize os dados do membro da equipe' : 'Preencha os dados do novo membro da equipe'}
                </p>
              </div>
              <button 
                onClick={fecharModal}
                className="text-outline hover:text-error transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSalvarProfissional} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  value={novoProfissional.name}
                  onChange={(e) => setNovoProfissional({...novoProfissional, name: e.target.value})}
                  className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Categoria Profissional *</label>
                  <select 
                    required
                    value={novoProfissional.role}
                    onChange={(e) => setNovoProfissional({...novoProfissional, role: e.target.value})}
                    className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Tipo de Vínculo</label>
                <select 
                  value={novoProfissional.vinculo}
                  onChange={(e) => setNovoProfissional({...novoProfissional, vinculo: e.target.value})}
                  className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Selecione...</option>
                  {vinculos.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Linha de Cuidado</label>
                <select 
                  value={novoProfissional.linha_cuidado}
                  onChange={(e) => setNovoProfissional({...novoProfissional, linha_cuidado: e.target.value})}
                  className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Selecione...</option>
                  {linhasCuidado.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={fecharModal}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-outline hover:bg-surface-high transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-surface rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {editingProfissionalId ? 'Salvar Alterações' : 'Salvar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerta de Sucesso */}
      {showSuccessAlert && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-full duration-300">
          <div className="bg-surface border border-primary/20 rounded-xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px]">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-grow">
              <p className="text-sm font-bold text-on-surface">{showSuccessAlert}</p>
              <p className="text-[10px] text-outline font-medium">A base de dados foi atualizada.</p>
            </div>
            <button onClick={() => setShowSuccessAlert(null)} className="text-outline hover:text-on-surface p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      {showExcluirConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/90 backdrop-blur-md p-4">
          <div className="bg-surface rounded-2xl w-full max-w-sm border border-error/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center text-error mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                {confirmacaoExclusaoPasso === 0 ? 'Confirmar Exclusão?' : 'Tem Certeza Absoluta?'}
              </h3>
              <p className="text-sm text-outline leading-relaxed">
                {confirmacaoExclusaoPasso === 0 
                  ? <>Você está prestes a excluir <strong>{profissionais.find(p => p.id === showExcluirConfirm)?.name}</strong>. Esta ação não poderá ser desfeita.</>
                  : <><strong>Esta é a segunda e última confirmação.</strong> Os dados serão removidos permanentemente.</>
                }
              </p>
            </div>
            <div className="flex border-t border-outline-variant/10">
              <button 
                onClick={() => {
                  setShowExcluirConfirm(null);
                  setConfirmacaoExclusaoPasso(0);
                }}
                className="flex-1 px-6 py-4 text-sm font-bold text-outline hover:bg-surface-high transition-colors border-r border-outline-variant/10"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleExcluirProfissional(showExcluirConfirm)}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${confirmacaoExclusaoPasso === 0 ? 'text-error hover:bg-error/5' : 'bg-error text-surface hover:brightness-110'}`}
              >
                {confirmacaoExclusaoPasso === 0 ? 'Sim, Excluir' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function TableRow({ prof, onEdit, onDelete }: { prof: any, onEdit: () => void, onDelete: () => void }) {
  const { name, id, role, vinculo, linha_cuidado } = prof;
  return (
    <tr 
      onClick={onEdit}
      className="group hover:bg-surface-high transition-colors cursor-pointer"
    >
      <td className="px-6 py-6">
        <div className="flex flex-col">
          <p className="text-xl font-black text-on-surface group-hover:text-primary transition-colors leading-tight tracking-tight">{name}</p>
          <p className="text-[11px] text-outline mt-1 font-medium opacity-70">ID: {id}</p>
        </div>
      </td>
      <td className="px-6 py-6">
        <p className="text-base text-on-surface-variant font-bold tracking-tight">{role}</p>
      </td>
      <td className="px-6 py-6">
        <span className="px-4 py-1.5 rounded-full bg-secondary-container/10 text-secondary text-[11px] font-black uppercase tracking-[0.15em] border border-secondary/20 shadow-sm">
          {vinculo || "CLT"}
        </span>
      </td>
      <td className="px-6 py-6">
        <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em] bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 shadow-sm">
          {linha_cuidado || "---"}
        </span>
      </td>
      <td className="px-6 py-6 text-right">
        <div className="flex justify-end gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Editar Profissional"
            className="text-outline hover:text-primary transition-all p-2.5 hover:bg-primary/10 rounded-xl active:scale-90"
          >
            <Edit2 size={22} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Excluir Profissional"
            className="text-outline hover:text-error transition-all p-2.5 hover:bg-error/10 rounded-xl active:scale-90"
          >
            <Trash2 size={22} />
          </button>
        </div>
      </td>
    </tr>
  );
}
