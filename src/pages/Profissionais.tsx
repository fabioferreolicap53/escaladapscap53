import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { Layout } from '../components/Layout';
import { useSettings } from '../contexts/SettingsContext';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
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
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import { useProfissionais } from '../hooks/useProfissionais';

export default function Profissionais() {
  const { categorias, vinculos, linhasCuidado, searchTerm, setSearchTerm } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinhaDropdownOpen, setIsLinhaDropdownOpen] = useState(false);
  const [searchLinha, setSearchLinha] = useState('');
  const linhaDropdownRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExcluirConfirm, setShowExcluirConfirm] = useState<string | null>(null);
  const [confirmacaoExclusaoPasso, setConfirmacaoExclusaoPasso] = useState<number>(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);

  // Password confirmation states
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', data: any } | null>(null);
  const [passError, setPassError] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });
  const [filters, setFilters] = useState({
    categoria: '',
    vinculo: '',
    linha_cuidado: ''
  });
  const [editingProfissionalId, setEditingProfissionalId] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [novoProfissional, setNovoProfissional] = useState({
    name: '',
    role: '',
    vinculo: '',
    linha_cuidado: ''
  });

  const { profissionais, isLoading, addProfissional, updateProfissional, deleteProfissional } = useProfissionais();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (linhaDropdownRef.current && !linhaDropdownRef.current.contains(event.target as Node)) {
        setIsLinhaDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setIsReadOnly(false);
    setIsLinhaDropdownOpen(false);
    setSearchLinha('');
    setEditingProfissionalId(null);
    setNovoProfissional({ name: '', role: '', vinculo: '', linha_cuidado: '' });
  };

  const toggleLinhaCuidado = (linha: string) => {
    const currentLinhas = novoProfissional.linha_cuidado ? novoProfissional.linha_cuidado.split(', ') : [];
    let newLinhas;
    
    if (currentLinhas.includes(linha)) {
      newLinhas = currentLinhas.filter(l => l !== linha);
    } else {
      newLinhas = [...currentLinhas, linha];
    }
    
    setNovoProfissional({
      ...novoProfissional,
      linha_cuidado: newLinhas.join(', ')
    });
  };

  const filteredLinhasCuidado = linhasCuidado.filter(l => 
    l.name.toLowerCase().includes(searchLinha.toLowerCase())
  );

  const handleRowClick = (prof: any) => {
    setEditingProfissionalId(prof.id);
    setNovoProfissional({
      name: prof.name,
      role: prof.role,
      vinculo: prof.vinculo || '',
      linha_cuidado: prof.linha_cuidado || ''
    });
    setIsReadOnly(true); // Modo visualização por padrão no clique da linha
    setIsModalOpen(true);
  };

  const handleEditClick = (prof: any) => {
    setPendingAction({ type: 'edit', data: prof });
    setIsPassModalOpen(true);
    setPassError(false);
  };

  const handleExcluirProfissional = async (id: string) => {
    setPendingAction({ type: 'delete', data: id });
    setIsPassModalOpen(true);
    setPassError(false);
  };

  const handleConfirmPassword = async (password: string) => {
    if (password === 'daps2022') {
      if (pendingAction?.type === 'edit') {
        const prof = pendingAction.data;
        setEditingProfissionalId(prof.id);
        setNovoProfissional({
          name: prof.name,
          role: prof.role,
          vinculo: prof.vinculo || '',
          linha_cuidado: prof.linha_cuidado || ''
        });
        setIsReadOnly(false); // Libera edição
        setIsModalOpen(true);
      } else if (pendingAction?.type === 'delete') {
        const id = pendingAction.data;
        const profExcluido = profissionais.find(p => p.id === id);
        if (profExcluido) {
          await deleteProfissional(id);
          setShowExcluirConfirm(null);
          setConfirmacaoExclusaoPasso(0);
          setShowSuccessAlert(`Profissional ${profExcluido.name} excluído com sucesso!`);
          setTimeout(() => setShowSuccessAlert(null), 3000);
        }
      }
      setIsPassModalOpen(false);
      setPendingAction(null);
    } else {
      setPassError(true);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProfissionais = (profissionais || []).filter(prof => {
    // Filtros Avançados
    if (filters.categoria && prof.role !== filters.categoria) return false;
    if (filters.vinculo && prof.vinculo !== filters.vinculo) return false;
    if (filters.linha_cuidado) {
      const linhasProf = prof.linha_cuidado ? prof.linha_cuidado.split(', ') : [];
      if (!linhasProf.includes(filters.linha_cuidado)) return false;
    }

    // Busca por Texto
    const searchTrimmed = (searchTerm || '').trim();
    if (searchTrimmed && 
        !prof.name.toLowerCase().includes(searchTrimmed.toLowerCase()) && 
        !prof.id.toLowerCase().includes(searchTrimmed.toLowerCase())) return false;
    
    return true;
  });

  const clearFilters = () => {
    setFilters({ categoria: '', vinculo: '', linha_cuidado: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.categoria || filters.vinculo || filters.linha_cuidado || searchTerm;

  const sortedProfissionais = [...filteredProfissionais].sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Layout activePath="/profissionais">
      <PasswordConfirmModal 
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onConfirm={handleConfirmPassword}
        error={passError}
        title={pendingAction?.type === 'delete' ? "Confirmar Exclusão" : "Confirmar Edição"}
        description={
          pendingAction?.type === 'delete' 
            ? "Você está prestes a excluir permanentemente este profissional. Por favor, confirme sua senha."
            : "Para editar os dados deste profissional, por favor confirme sua senha de acesso."
        }
      />
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-8 mb-10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Gestão de Equipe</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Profissionais Cadastrados</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Filtros reposicionados aqui */}
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 border transition-all w-full sm:w-auto ${
                hasActiveFilters 
                  ? 'bg-primary/10 text-primary border-primary/30' 
                  : 'bg-surface-high text-on-surface border-outline-variant/15 hover:bg-surface-bright'
              }`}
            >
              <Filter size={18} />
              {hasActiveFilters ? 'Filtros Ativos' : 'Filtros'}
            </button>

            {showFilters && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilters(false)} 
                />
                <div className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl p-5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Filtragem Avançada</h4>
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

                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Linha de Cuidado</label>
                      <select 
                        value={filters.linha_cuidado}
                        onChange={(e) => setFilters({...filters, linha_cuidado: e.target.value})}
                        className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                      >
                        <option value="">Todas as linhas</option>
                        {linhasCuidado.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

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

      {/* Dashboard / Filters Section - REMOVIDO DAQUI */}

      {/* Table Container */}
      <div className="bg-surface-low rounded-xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface/50 border-b border-outline-variant/10">
                <th 
                  className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline cursor-pointer hover:text-primary transition-colors group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Profissional
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortConfig.key === 'name' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} />}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline cursor-pointer hover:text-primary transition-colors group"
                  onClick={() => handleSort('linha_cuidado')}
                >
                  <div className="flex items-center gap-2">
                    Linha de Cuidado
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortConfig.key === 'linha_cuidado' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} />}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline cursor-pointer hover:text-primary transition-colors group"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Categoria Profissional
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortConfig.key === 'role' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} />}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline cursor-pointer hover:text-primary transition-colors group"
                  onClick={() => handleSort('vinculo')}
                >
                  <div className="flex items-center gap-2">
                    Vínculo
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortConfig.key === 'vinculo' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} />}
                    </span>
                  </div>
                </th>
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
              ) : sortedProfissionais.length === 0 ? (
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
                sortedProfissionais.map((prof) => (
                  <TableRow 
                    key={prof.id}
                    prof={prof}
                    onRowClick={() => handleRowClick(prof)}
                    onEdit={() => handleEditClick(prof)}
                    onDelete={() => handleExcluirProfissional(prof.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-4 bg-surface/30 border-t border-outline-variant/10 flex justify-between items-center">
          <span className="text-xs text-outline">
            Mostrando <span className="text-on-surface font-bold">{filteredProfissionais.length}</span> {filteredProfissionais.length === 1 ? 'profissional' : 'profissionais'}
          </span>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded bg-primary-container text-primary text-xs font-bold">1</button>
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
                  {isReadOnly ? 'Dados do Profissional' : (editingProfissionalId ? 'Editar Profissional' : 'Novo Profissional')}
                </h3>
                <p className="text-xs text-outline mt-1">
                  {isReadOnly ? 'Visualizando informações do membro da equipe' : (editingProfissionalId ? 'Atualize os dados do membro da equipe' : 'Preencha os dados do novo membro da equipe')}
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
              <div className={isReadOnly ? 'opacity-60 grayscale pointer-events-none' : ''}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    disabled={isReadOnly}
                    value={novoProfissional.name}
                    onChange={(e) => setNovoProfissional({...novoProfissional, name: e.target.value})}
                    className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Categoria Profissional *</label>
                    <select 
                      required
                      disabled={isReadOnly}
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

                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Tipo de Vínculo</label>
                  <select 
                    disabled={isReadOnly}
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

                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Linha de Cuidado</label>
                  <div className="relative" ref={linhaDropdownRef}>
                    <button 
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => setIsLinhaDropdownOpen(!isLinhaDropdownOpen)}
                      className={`w-full flex items-center justify-between bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all ${isLinhaDropdownOpen ? 'border-primary ring-2 ring-primary/20' : ''}`}
                    >
                      <span className={`truncate ${novoProfissional.linha_cuidado ? 'text-on-surface' : 'text-outline/60'}`}>
                        {novoProfissional.linha_cuidado 
                          ? (novoProfissional.linha_cuidado.split(', ').length > 2 
                              ? `${novoProfissional.linha_cuidado.split(', ').length} selecionadas` 
                              : novoProfissional.linha_cuidado)
                          : "Selecione uma ou mais..."}
                      </span>
                      <ChevronLeft 
                        size={16} 
                        className={`text-outline transition-transform duration-300 ${isLinhaDropdownOpen ? 'rotate-90' : '-rotate-90'}`} 
                      />
                    </button>

                    {isLinhaDropdownOpen && (
                      <div className="absolute bottom-full left-0 w-full mb-2 bg-surface border border-outline-variant/20 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="p-2 border-b border-outline-variant/10 flex items-center gap-2">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              placeholder="Buscar linha..."
                              value={searchLinha}
                              onChange={(e) => setSearchLinha(e.target.value)}
                              className="w-full bg-surface-low border border-outline-variant/10 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all pr-8"
                              autoFocus
                            />
                            {searchLinha && (
                              <button 
                                onClick={() => setSearchLinha('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-error p-0.5"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                          {novoProfissional.linha_cuidado && (
                            <button
                              type="button"
                              onClick={() => setNovoProfissional({...novoProfissional, linha_cuidado: ''})}
                              className="px-2 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all flex items-center justify-center shrink-0"
                              title="Limpar todas as seleções"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                        <div className="max-h-[180px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                          {filteredLinhasCuidado.length > 0 ? (
                            filteredLinhasCuidado.map(l => {
                              const isSelected = novoProfissional.linha_cuidado.split(', ').includes(l.name);
                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => toggleLinhaCuidado(l.name)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                                    isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-high text-on-surface'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-primary border-primary' : 'border-outline-variant/30'
                                  }`}>
                                    {isSelected && <CheckCircle2 size={12} className="text-surface" />}
                                  </div>
                                  <span className={`text-xs font-bold ${isSelected ? 'font-black' : 'font-medium'}`}>{l.name}</span>
                                </button>
                              );
                            })
                          ) : (
                            <div className="py-4 text-center">
                              <p className="text-[10px] text-outline uppercase font-bold">Nenhuma linha encontrada</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={fecharModal}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-outline hover:bg-surface-high transition-colors"
                >
                  {isReadOnly ? 'Fechar' : 'Cancelar'}
                </button>
                {isReadOnly ? (
                  <button 
                    type="button"
                    onClick={() => {
                      setPendingAction({ type: 'edit', data: profissionais.find(p => p.id === editingProfissionalId) });
                      setIsPassModalOpen(true);
                      setPassError(false);
                    }}
                    className="px-5 py-2.5 bg-amber-500 text-surface rounded-lg text-sm font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Habilitar Edição
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-surface rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {editingProfissionalId ? 'Salvar Alterações' : 'Salvar Profissional'}
                  </button>
                )}
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
    </Layout>
  );
}

function TableRow({ prof, onRowClick, onEdit, onDelete }: { prof: any, onRowClick: () => void, onEdit: () => void, onDelete: () => void }) {
  const { name, id, role, vinculo, linha_cuidado } = prof;
  return (
    <tr 
      onClick={onRowClick}
      className="group hover:bg-surface-high transition-colors cursor-pointer"
    >
      <td className="px-6 py-6">
        <div className="flex flex-col">
          <p className="text-xl font-black text-on-surface group-hover:text-primary transition-colors leading-tight tracking-tight">{name}</p>
        </div>
      </td>
      <td className="px-6 py-6">
        <span className="text-[12px] font-black text-on-surface/90 uppercase tracking-[0.2em]">
          {linha_cuidado || "---"}
        </span>
      </td>
      <td className="px-6 py-6">
        <p className="text-[12px] font-black text-on-surface/90 uppercase tracking-[0.2em]">{role}</p>
      </td>
      <td className="px-6 py-6">
        <span className="text-[12px] font-black text-on-surface/90 uppercase tracking-[0.2em]">
          {vinculo || "---"}
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
