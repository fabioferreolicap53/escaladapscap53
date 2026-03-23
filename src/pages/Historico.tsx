import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  ChevronsDown,
  Plus,
  X,
  Trash2,
  AlertTriangle,
  Pencil
} from 'lucide-react';

import { useEscalas } from '../hooks/useEscalas';
import { useProfissionais } from '../hooks/useProfissionais';

export default function Historico() {
  const navigate = useNavigate();
  const { categorias, vinculos, linhasCuidado, searchTerm, setSearchTerm } = useSettings();
  const { escalas, isLoading, deleteEscala } = useEscalas();
  const { profissionais } = useProfissionais();
  const [showFilters, setShowFilters] = useState(false);
  const [showExcluirConfirm, setShowExcluirConfirm] = useState<string | null>(null);
  const [confirmacaoExclusaoPasso, setConfirmacaoExclusaoPasso] = useState<number>(0);
  const [filters, setFilters] = useState({
    categoria: '',
    vinculo: '',
    linha_cuidado: '',
    mes: '',
    ano: ''
  });

  const handleExcluirEscala = async (id: string) => {
    if (confirmacaoExclusaoPasso === 0) {
      setConfirmacaoExclusaoPasso(1);
      return;
    }

    await deleteEscala(id);
    setShowExcluirConfirm(null);
    setConfirmacaoExclusaoPasso(0);
  };

  const clearFilters = () => {
    setFilters({ categoria: '', vinculo: '', linha_cuidado: '', mes: '', ano: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.categoria || filters.vinculo || filters.linha_cuidado || filters.mes || filters.ano || searchTerm;

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
              onDelete={(id: string) => {
                setShowExcluirConfirm(id);
                setConfirmacaoExclusaoPasso(0);
              }}
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

      {/* Confirmação de Exclusão de Escala */}
      {showExcluirConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/90 backdrop-blur-md p-4">
          <div className="bg-surface rounded-2xl w-full max-w-sm border border-error/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center text-error mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                {confirmacaoExclusaoPasso === 0 ? 'Excluir Lançamento?' : 'Confirmar Remoção Permanente?'}
              </h3>
              <p className="text-sm text-outline leading-relaxed">
                {confirmacaoExclusaoPasso === 0 
                  ? <>Você deseja remover o registro de escala de <strong>{escalas.find(e => e.id === showExcluirConfirm)?.name}</strong>?</>
                  : <><strong>Atenção:</strong> Esta ação excluirá permanentemente este lançamento do histórico.</>
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
                onClick={() => handleExcluirEscala(showExcluirConfirm)}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${confirmacaoExclusaoPasso === 0 ? 'text-error hover:bg-error/5' : 'bg-error text-surface hover:brightness-110'}`}
              >
                {confirmacaoExclusaoPasso === 0 ? 'Remover' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function LogEntry({ id, time, name, role, avatar, monthYear, status, statusColor, isOnline, profId, month, vinculo, linha_cuidado, shifts, onDelete }: any) {
  const navigate = useNavigate();

  const handleViewScale = () => {
    navigate('/lancamento', { 
      state: { 
        profId, 
        month,
        autoSelect: true 
      } 
    });
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
      className="group relative flex flex-col md:flex-row md:items-center bg-surface-low p-4 sm:p-5 rounded-2xl border border-outline-variant/5 hover:border-primary/30 hover:bg-surface-high transition-all duration-500 cursor-pointer active:scale-[0.995] gap-4 md:gap-8 shadow-sm hover:shadow-md md:justify-between"
    >
      {/* 1. Professional Section (Left) */}
      <div 
        onClick={handleViewScale}
        className="flex items-center justify-between md:justify-start w-full md:w-[25%] lg:w-[20%] shrink-0"
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
              <span className="text-lg sm:text-xl font-extrabold text-on-surface group-hover:text-primary transition-colors truncate">{name}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 2. Resumo de Turnos (Center-Left) */}
      {shiftSummary.length > 0 && (
        <div 
          onClick={handleViewScale}
          className="flex flex-wrap gap-2 w-full md:w-auto md:flex-1 justify-start md:justify-center border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0"
        >
          {shiftSummary.map(summary => (
            <div 
              key={summary.label} 
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-300 hover:scale-105 ${getBadgeBg(summary.color)}`}
              title={`${summary.count} dias de ${summary.label}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(summary.color)}`} />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-on-surface">{summary.count}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-outline/80">{summary.label.substring(0, 3)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Referência Temporal (Center-Right) */}
      <div 
        onClick={handleViewScale}
        className="flex flex-col items-start md:items-center justify-center w-full md:w-auto md:px-6 border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0"
      >
        <span className="text-[9px] sm:text-[11px] text-primary/60 font-black uppercase mb-1 sm:mb-2 tracking-[0.2em] sm:tracking-[0.3em] leading-none">Referência Temporal</span>
        <div className="flex items-center gap-2 sm:gap-3 text-primary transition-all duration-500 transform group-hover:scale-[1.02] w-full sm:w-auto justify-start md:justify-center">
          <CalendarIcon size={16} className="opacity-90 sm:w-[18px] sm:h-[18px]" />
          <span className="text-xs sm:text-sm font-extrabold tracking-wider sm:tracking-widest italic uppercase leading-none">{monthYear}</span>
        </div>
      </div>

      {/* 4. Details and Actions Section (Right) */}
      <div className="flex items-center justify-between md:justify-end w-full md:w-[25%] lg:w-[20%] gap-4 border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0 shrink-0">
        <div 
          onClick={handleViewScale}
          className="flex flex-col items-start md:items-end min-w-[150px] md:min-w-0 flex-grow"
        >
          <span className="text-[9px] sm:text-[10px] text-outline font-bold uppercase mb-1 tracking-wider md:text-right">Categoria / Detalhes</span>
          <div className="flex flex-col items-start md:items-end w-full">
            <span className="text-xs sm:text-sm font-bold text-on-surface leading-tight truncate max-w-full md:max-w-[180px] mb-0.5">{role}</span>
            {vinculo && (
              <span className="text-[9px] sm:text-[10px] text-secondary font-black uppercase tracking-[0.1em] mt-1 leading-none">
                VÍNCULO: {vinculo}
              </span>
            )}
            {linha_cuidado && (
              <span className="text-[9px] sm:text-[10px] text-primary/80 font-black uppercase tracking-[0.1em] mt-1 leading-none">
                LINHA: {linha_cuidado}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-1 shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewScale();
            }}
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
