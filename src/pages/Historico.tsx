import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Filter, 
  Download, 
  MoreVertical, 
  Calendar as CalendarIcon,
  ChevronsDown,
  Plus,
  X
} from 'lucide-react';

import { useEscalas } from '../hooks/useEscalas';

export default function Historico() {
  const navigate = useNavigate();
  const { linhasCuidado, categorias, vinculos, searchTerm, setSearchTerm } = useSettings();
  const { escalas, isLoading } = useEscalas();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    linha: '',
    categoria: '',
    vinculo: ''
  });

  const clearFilters = () => {
    setFilters({ linha: '', categoria: '', vinculo: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.linha || filters.categoria || filters.vinculo || searchTerm;

  const mesesNomes = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

  const filteredLogs = escalas.map(log => ({
    ...log,
    monthYear: `${mesesNomes[log.month] || ''} / ${log.year || new Date().getFullYear()}`,
    isOnline: true // Apenas para manter o estilo visual
  })).filter(log => {
    // Filtros de busca (texto)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        log.name.toLowerCase().includes(searchLower) ||
        log.role.toLowerCase().includes(searchLower) ||
        log.unit.toLowerCase().includes(searchLower) ||
        log.id.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtros de categoria/linha/vínculo
    if (filters.linha && !log.unit.includes(filters.linha)) return false;
    if (filters.categoria && log.role !== filters.categoria) return false;
    if (filters.vinculo && log.vinculo !== filters.vinculo) return false;
    
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
              <div className="absolute top-full right-0 mt-2 w-full sm:w-72 bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl p-5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
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
                    <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Linha de Cuidado</label>
                    <select 
                      value={filters.linha}
                      onChange={(e) => setFilters({...filters, linha: e.target.value})}
                      className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                    >
                      <option value="">Todas as linhas</option>
                      {linhasCuidado.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase mb-1.5 ml-1">Categoria</label>
                    <select 
                      value={filters.categoria}
                      onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                      className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all"
                    >
                      <option value="">Todas as categorias</option>
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
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
                      {vinculos.map(v => <option key={v} value={v}>{v}</option>)}
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
          <h3 className="text-sm font-bold text-outline uppercase tracking-widest">Atividade Recente</h3>
          <div className="h-[1px] grow bg-outline-variant/15"></div>
          <span className="text-[10px] text-outline font-medium uppercase">
            {isLoading ? 'Carregando...' : `${filteredLogs.length} ${filteredLogs.length === 1 ? 'Registro Encontrado' : 'Registros Encontrados'}`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-low rounded-2xl border border-dashed border-outline-variant/20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Buscando registros...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => (
            <LogEntry key={index} {...log} />
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

function LogEntry({ time, name, id, role, avatar, unit, monthYear, status, statusColor, isOnline, profId, month, vinculo }: any) {
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

  return (
    <div 
      onClick={handleViewScale}
      className="group relative flex flex-col md:flex-row md:items-center bg-surface-low p-4 sm:p-5 rounded-xl border border-transparent hover:border-primary/20 hover:bg-surface-high transition-all duration-300 cursor-pointer active:scale-[0.995] gap-4 md:gap-0"
    >
      {/* Top Section for Mobile / Left Section for Desktop */}
      <div className="flex items-center justify-between md:justify-start w-full md:w-auto md:flex-1">
        <div className="flex items-center gap-4">
          {/* Time Section */}
          <div className="w-14 sm:w-16 flex flex-col items-center border-r border-outline-variant/15 pr-4 sm:pr-6 shrink-0">
            <span className="text-lg sm:text-xl font-bold tracking-tighter text-on-surface">{time}</span>
            <span className="text-[9px] sm:text-[10px] text-outline font-bold uppercase">Registro</span>
          </div>
          
          {/* Name and Avatar Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <img src={avatar} alt={name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-surface-bright shadow-sm" />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-surface-low shadow-sm"></span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">{name}</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Action Icon */}
        <div className="md:hidden text-outline">
          <MoreVertical size={20} />
        </div>
      </div>
      
      {/* Middle/Bottom Section - Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-12 w-full md:w-auto md:flex-1 md:justify-end pl-18 sm:pl-20 md:pl-0 border-t border-outline-variant/5 pt-3 md:border-t-0 md:pt-0">
        
        {/* Centered and Highlighted Reference Section - Clean Style */}
        <div className="flex flex-col items-start sm:items-center justify-center md:px-6 w-full sm:w-auto md:flex-1">
          <span className="text-[9px] sm:text-[11px] text-primary/60 font-black uppercase mb-1 sm:mb-2 tracking-[0.2em] sm:tracking-[0.3em] leading-none">Referência Temporal</span>
          <div className="flex items-center gap-2 sm:gap-3 text-primary transition-all duration-500 transform group-hover:scale-[1.02] w-full sm:w-auto justify-center">
            <CalendarIcon size={16} className="opacity-90 sm:w-[18px] sm:h-[18px]" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wider sm:tracking-widest italic uppercase leading-none">{monthYear}</span>
          </div>
        </div>

        {/* Details and Actions Section */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto md:flex-1 gap-4">
          <div className="flex flex-col items-start sm:items-end min-w-[150px] sm:min-w-[200px]">
            <span className="text-[9px] sm:text-[10px] text-outline font-bold uppercase mb-1 tracking-wider sm:text-right">Categoria / Linha / Vínculo</span>
            <div className="flex flex-col items-start sm:items-end w-full">
              <span className="text-xs sm:text-sm font-bold text-on-surface leading-tight truncate max-w-full sm:max-w-[200px]">{role}</span>
              <span className="text-[10px] sm:text-[11px] text-primary font-black italic tracking-tight truncate max-w-full sm:max-w-[200px]">{unit}</span>
              {vinculo && (
                <span className="text-[9px] sm:text-[10px] text-secondary font-black uppercase tracking-widest mt-0.5">
                  {vinculo}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity p-2 text-outline hover:text-on-surface hover:bg-surface-bright rounded-lg shrink-0">
            <MoreVertical size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
