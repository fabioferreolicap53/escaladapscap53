import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  ChevronsDown,
  Plus,
  X,
  Trash2,
  AlertTriangle,
  Pencil,
  Sun,
  Sunrise,
  Sunset,
  Coffee,
  History as HistoryIcon,
  Star,
  Clock,
  Stethoscope,
  Palmtree,
  MinusCircle
} from 'lucide-react';

import { useEscalas } from '../hooks/useEscalas';
import { useProfissionais } from '../hooks/useProfissionais';

// Mapeamento criativo para etiquetas e ícones no resumo
const getShiftSummaryMeta = (label: string) => {
  const meta: Record<string, { short: string, icon: any }> = {
    'TRAB DIA TODO': { short: 'TDT', icon: Sun },
    'TRAB MANHÃ': { short: 'MAN', icon: Sunrise },
    'TRAB TARDE': { short: 'TAR', icon: Sunset },
    'FOLGA': { short: 'FOL', icon: Coffee },
    'BANCO DE HORAS': { short: 'BHO', icon: HistoryIcon },
    'FERIADO': { short: 'FER', icon: Star },
    'PONTO FACULTATIVO': { short: 'PFA', icon: Clock },
    'LICEN MÉDICA': { short: 'MED', icon: Stethoscope },
    'FÉRIAS': { short: 'FÉR', icon: Palmtree },
    'LICEN ESPECIAL': { short: 'ESP', icon: Star },
    'NÃO REMUNERADA': { short: 'NRE', icon: MinusCircle },
  };

  return meta[label] || { short: label.substring(0, 3).toUpperCase(), icon: Star };
};

export default function Historico() {
  const navigate = useNavigate();
  const { categorias, vinculos, linhasCuidado, searchTerm, setSearchTerm } = useSettings();
  const { escalas, isLoading, deleteEscala } = useEscalas();
  const { profissionais } = useProfissionais();
  const [showFilters, setShowFilters] = useState(false);
  const [showExcluirConfirm, setShowExcluirConfirm] = useState<string | null>(null);
  const [confirmacaoExclusaoPasso, setConfirmacaoExclusaoPasso] = useState<number>(0);
  
  // Password confirmation states
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', data: any } | null>(null);
  const [passError, setPassError] = useState(false);

  const [filters, setFilters] = useState({
    profId: '',
    categoria: '',
    vinculo: '',
    linha_cuidado: '',
    mes: '',
    ano: ''
  });

  const handleExcluirEscala = async (id: string) => {
    setPendingAction({ type: 'delete', data: id });
    setIsPassModalOpen(true);
    setPassError(false);
  };

  const handleEditarEscala = (data: { profId: string, month: number, year: number }) => {
    setPendingAction({ type: 'edit', data });
    setIsPassModalOpen(true);
    setPassError(false);
  };

  const handleConfirmPassword = async (password: string) => {
    if (password === 'daps2022') {
      if (pendingAction?.type === 'delete') {
        await deleteEscala(pendingAction.data);
      } else if (pendingAction?.type === 'edit') {
        const { profId, month, year } = pendingAction.data;
        navigate('/lancamento', { 
          state: { 
            profId, 
            month,
            year,
            autoSelect: true,
            returnUrl: '/escala',
            readOnly: false // Força modo edição
          } 
        });
      }
      setIsPassModalOpen(false);
      setPendingAction(null);
    } else {
      setPassError(true);
    }
  };

  const clearFilters = () => {
    setFilters({ profId: '', categoria: '', vinculo: '', linha_cuidado: '', mes: '', ano: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.profId || filters.categoria || filters.vinculo || filters.linha_cuidado || filters.mes || filters.ano || searchTerm;

  const mesesNomes = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

  const anosDisponiveis = Array.from(new Set(escalas.map(log => Number(log.year) || new Date().getFullYear())))
    .filter(Boolean)
    .sort((a, b) => b - a);

  const filteredLogs = escalas.map(log => {
    const prof = profissionais.find(p => p.id === log.profId);
    return {
      ...log,
      vinculo: prof?.vinculo || log.vinculo || '',
      linha_cuidado: prof?.linha_cuidado || '',
      monthYear: `${mesesNomes[log.month] || ''} / ${log.year || new Date().getFullYear()}`,
      isOnline: true // Apenas para manter o estilo visual
    };
  }).filter(log => {
    // Filtros de busca (texto)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        log.name.toLowerCase().includes(searchLower) ||
        log.role.toLowerCase().includes(searchLower) ||
        log.id.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtros de categoria/vínculo/linha de cuidado
    if (filters.profId && log.profId !== filters.profId) return false;
    if (filters.categoria && log.role !== filters.categoria) return false;
    if (filters.vinculo && log.vinculo !== filters.vinculo) return false;
    if (filters.linha_cuidado && log.linha_cuidado !== filters.linha_cuidado) return false;

    // Filtro de referência temporal
    if (filters.mes !== '' && log.month !== parseInt(filters.mes)) return false;
    if (filters.ano !== '' && log.year !== parseInt(filters.ano)) return false;
    
    return true;
  });

  return (
    <Layout activePath="/escala">
      <PasswordConfirmModal 
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onConfirm={handleConfirmPassword}
        error={passError}
        title={pendingAction?.type === 'delete' ? "Confirmar Exclusão" : "Confirmar Edição"}
        description={
          pendingAction?.type === 'delete' 
            ? "Você está prestes a excluir permanentemente este registro de escala. Por favor, confirme sua senha."
            : "Este registro já foi lançado. Para alterá-lo, por favor confirme sua senha de acesso."
        }
      />
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-8 mb-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2">Histórico de Lançamentos</h2>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">Acompanhe o fluxo de atividades e alterações na escala. Use o filtro inteligente para identificar padrões de cobertura.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 relative">
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
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Filtragem Inteligente</h4>
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-bold text-outline hover:text-error transition-colors uppercase tracking-tighter"
                  >
                    Limpar
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Profissional</label>
                    <select 
                      value={filters.profId}
                      onChange={(e) => setFilters({...filters, profId: e.target.value})}
                      className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                    >
                      <option value="">Todos os profissionais</option>
                      {profissionais
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                      }
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Mês</label>
                      <select 
                        value={filters.mes}
                        onChange={(e) => setFilters({...filters, mes: e.target.value})}
                        className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                      >
                        <option value="">Todos</option>
                        {mesesNomes.map((mes, index) => (
                          <option key={mes} value={index}>{mes}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Ano</label>
                      <select 
                        value={filters.ano}
                        onChange={(e) => setFilters({...filters, ano: e.target.value})}
                        className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                      >
                        <option value="">Todos</option>
                        {anosDisponiveis.map(ano => (
                          <option key={ano} value={ano}>{ano}</option>
                        ))}
                      </select>
                    </div>
                  </div>

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

          <button 
            onClick={() => navigate('/lancamento')}
            className="px-4 sm:px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-surface text-sm font-bold rounded-lg shadow-lg shadow-primary/10 hover:brightness-110 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Main Stacked List (The Feed) */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[10px] text-primary font-black uppercase tracking-widest">
            {isLoading ? 'Carregando...' : `${filteredLogs.length} ${filteredLogs.length === 1 ? 'Registro Encontrado' : 'Registros Encontrados'}`}
          </span>
          <div className="h-[1px] grow bg-outline-variant/15"></div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-low rounded-2xl border border-dashed border-outline-variant/20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Buscando registros...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <LogEntry 
              key={log.id} 
              {...log} 
              onDelete={(id: string) => handleExcluirEscala(id)}
              onEdit={(data: any) => handleEditarEscala(data)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-low rounded-2xl border border-dashed border-outline-variant/20">
            <Filter size={48} className="text-outline/20 mb-4" />
            <p className="text-on-surface-variant font-medium">Nenhum registro encontrado para os filtros selecionados.</p>
            <button onClick={clearFilters} className="mt-2 text-primary text-sm font-bold hover:underline">Limpar filtros</button>
          </div>
        )}

        {/* Loading / Pagination Indicator */}
        {filteredLogs.length > 0 && (
          <div className="flex justify-center py-6">
            <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-container transition-colors flex items-center gap-2">
              Carregar mais registros
              <ChevronsDown size={16} />
            </button>
          </div>
        )}
      </div>

    </Layout>
  );
}

function LogEntry({ id, time, name, role, avatar, monthYear, status, statusColor, isOnline, profId, month, year, vinculo, linha_cuidado, shifts, onDelete, onEdit }: any) {
  const navigate = useNavigate();

  const handleRowClick = () => {
    // Clique na linha permite visualização sem senha
    navigate('/lancamento', { 
      state: { 
        profId, 
        month,
        year,
        autoSelect: true,
        returnUrl: '/escala',
        readOnly: true // Modo visualização
      } 
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit({ profId, month, year });
  };

  // Contagem de turnos
  let shiftCounts: Record<string, { label: string, count: number, color: string }> = {};
  try {
    const parsedShifts = JSON.parse(shifts || '[]');
    parsedShifts.forEach((shift: any) => {
      if (shift && typeof shift === 'object' && shift.label) {
        if (!shiftCounts[shift.label]) {
          shiftCounts[shift.label] = { label: shift.label, count: 0, color: shift.color };
        }
        shiftCounts[shift.label].count++;
      }
    });
  } catch (e) {
    console.error("Erro ao parsear shifts no LogEntry", e);
  }
  const shiftSummary = Object.values(shiftCounts).sort((a, b) => b.count - a.count);

  const getDotColor = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
      case 'sky': return 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]';
      case 'amber': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
      case 'rose': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
      case 'purple': return 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]';
      case 'indigo': return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]';
      case 'orange': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
      default: return 'bg-slate-400';
    }
  };

  const getBadgeBg = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'sky': return 'bg-sky-500/10 border-sky-500/20';
      case 'amber': return 'bg-amber-500/10 border-amber-500/20';
      case 'rose': return 'bg-rose-500/10 border-rose-500/20';
      case 'purple': return 'bg-purple-500/10 border-purple-500/20';
      case 'indigo': return 'bg-indigo-500/10 border-indigo-500/20';
      case 'orange': return 'bg-orange-500/10 border-orange-500/20';
      default: return 'bg-surface-high border-outline-variant/10';
    }
  };

  const formatTime24h = (timeStr: string) => {
    if (!timeStr) return '--:--';
    // Se já estiver no formato HH:mm e não contiver AM/PM
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    
    try {
      // Tenta converter de qualquer formato para 24h
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }
      
      if (modifier && modifier.toUpperCase() === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch (e) {
      return timeStr; // Fallback para o original se falhar
    }
  };

  return (
    <div 
      className="group relative flex flex-col md:flex-row md:items-center bg-surface-low p-4 sm:p-5 rounded-2xl border border-outline-variant/5 hover:border-primary/30 hover:bg-surface-high transition-all duration-500 cursor-pointer active:scale-[0.995] gap-4 md:gap-0 shadow-sm hover:shadow-md"
      onClick={handleRowClick}
    >
      {/* 1. Professional Section (Left) */}
      <div 
        className="flex items-center justify-between md:justify-start w-full md:w-[22%] shrink-0"
      >
        <div className="flex items-center gap-4">
          {/* Time Section */}
          <div className="w-14 sm:w-16 flex flex-col items-center border-r border-outline-variant/15 pr-4 sm:pr-6 shrink-0">
            <span className="text-lg sm:text-xl font-bold tracking-tighter text-on-surface">{formatTime24h(time)}</span>
            <span className="text-[9px] sm:text-[10px] text-outline font-bold uppercase">Registro</span>
          </div>
          
          {/* Name Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl font-extrabold text-on-surface group-hover:text-primary transition-colors truncate uppercase tracking-tight">{name}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 2. Resumo de Turnos (Center-Left) */}
      {shiftSummary.length > 0 && (
        <div 
          className="flex flex-wrap gap-2 w-full md:w-[23%] justify-start md:justify-center border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0 md:px-4"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {shiftSummary.map(summary => {
              const meta = getShiftSummaryMeta(summary.label);
              const Icon = meta.icon;
              return (
                <div 
                  key={summary.label} 
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-300 hover:scale-105 ${getBadgeBg(summary.color)}`}
                  title={`${summary.count} dias de ${summary.label}`}
                >
                  <Icon size={12} className={getDotColor(summary.color).replace('bg-', 'text-').split(' ')[0]} />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-on-surface">{summary.count}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-outline/80">{meta.short}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Referência Temporal (Center-Right) */}
      <div 
        className="flex flex-col items-start md:items-center justify-center w-full md:w-[25%] md:px-6 border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0"
      >
        <span className="text-[9px] text-primary/60 font-black uppercase mb-1.5 tracking-[0.25em] leading-none text-center w-full">Referência Temporal</span>
        <div className="flex items-center gap-2 sm:gap-3 text-primary transition-all duration-500 transform group-hover:scale-[1.02] w-full justify-start md:justify-center">
          <CalendarIcon size={16} className="opacity-90 sm:w-[18px] sm:h-[18px]" />
          <span className="text-xs sm:text-sm font-black tracking-widest italic uppercase leading-none">{monthYear}</span>
        </div>
      </div>

      {/* 4. Details Section (Right) */}
      <div className="flex items-center justify-between md:justify-center w-full md:w-[22%] border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0 shrink-0 md:px-4">
        <div 
          className="flex flex-col items-start md:items-center w-full"
        >
          <span className="text-[9px] text-outline font-black uppercase mb-1.5 tracking-[0.2em] w-full text-left md:text-center">Linha / Categoria</span>
          <div className="flex flex-col items-start md:items-center w-full gap-1">
            {linha_cuidado && (
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em] mb-0.5 w-full text-left md:text-center truncate">
                LINHA: {linha_cuidado}
              </span>
            )}
            <span className="text-[10px] font-black text-on-surface leading-none uppercase tracking-[0.15em] w-full text-left md:text-center truncate">{role}</span>
            {vinculo && (
              <span className="text-[10px] font-black text-outline uppercase tracking-[0.15em] leading-none w-full text-left md:text-center truncate">
                VÍNCULO: {vinculo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Actions Section (Extreme Right) */}
      <div className="flex items-center justify-end w-full md:w-[8%] border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0 shrink-0">
        <div className="flex gap-1">
          <button 
            onClick={handleEditClick}
            className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="Editar lançamento"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-all"
            title="Excluir lançamento"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
