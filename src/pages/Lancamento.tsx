import { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Download, 
  AlertTriangle,
  User,
  XCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Lancamento() {
  const { categorias } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProfessional, setSelectedProfessional] = useState('');
  
  // Controle do mês
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const anoAtual = new Date().getFullYear();

  const prevMonth = () => {
    setMesAtual(prev => {
      const newMonth = prev === 0 ? 11 : prev - 1;
      updateShiftsForMonth(newMonth);
      return newMonth;
    });
  };
  
  const nextMonth = () => {
    setMesAtual(prev => {
      const newMonth = prev === 11 ? 0 : prev + 1;
      updateShiftsForMonth(newMonth);
      return newMonth;
    });
  };
  
  // Estado para o tipo de lançamento selecionado na paleta
  const [activeShiftType, setActiveShiftType] = useState<{label: string, color: string, type: string} | null>(null);

  // Função auxiliar para gerar dias vazios baseados no mês
  const generateEmptyShifts = (month: number) => {
    const daysInMonth = new Date(anoAtual, month + 1, 0).getDate();
    return Array(daysInMonth).fill(null).map((_, i) => {
      const date = new Date(anoAtual, month, i + 1);
      const day = date.getDay();
      // Apenas domingos permanecem bloqueados como 'weekend'
      // Sábados agora são tratáveis como dias comuns (null)
      return (day === 0) ? 'weekend' : null;
    });
  };

  // Estado da escala do profissional atual
  const [professionalShifts, setProfessionalShifts] = useState<(any | null)[]>(generateEmptyShifts(new Date().getMonth()));
  
  // Estado para controle de "Pintura" (Drag to Fill)
  const [isPainting, setIsPainting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Atualiza os dias vazios (finais de semana) ao mudar o mês
  const updateShiftsForMonth = (month: number) => {
    setProfessionalShifts(generateEmptyShifts(month));
  };

  const handleSave = async () => {
    if (!selectedProfessional) return;
    
    setIsSaving(true);
    
    // Simula uma chamada de API para salvar
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setIsSaving(false);
    navigate('/escala');
  };

  // Efeito para carregar dados do histórico (se houver)
  useEffect(() => {
    if (location.state && location.state.autoSelect) {
      const { profId, month } = location.state;
      if (profId) setSelectedProfessional(profId);
      if (month !== undefined) {
        setMesAtual(month);
        updateShiftsForMonth(month);
      }
      
      // Limpa o estado para não re-selecionar ao recarregar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const applyShift = (index: number) => {
    if (!activeShiftType || professionalShifts[index] === 'weekend') return;
    
    setProfessionalShifts(prev => {
      const newShifts = [...prev];
      
      // Se clicar em um dia que já tem exatamente o mesmo turno, ele "apaga" (toggle off)
      if (newShifts[index] && newShifts[index].type === activeShiftType.type) {
        newShifts[index] = null;
      } else {
        // Senão, ele pinta com o novo turno
        newShifts[index] = { 
          type: activeShiftType.type, 
          color: activeShiftType.color,
          label: activeShiftType.label 
        };
      }
      return newShifts;
    });
  };

  const handleMouseDown = (index: number) => {
    if (!activeShiftType) return;
    setIsPainting(true);
    applyShift(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isPainting && activeShiftType && professionalShifts[index] !== 'weekend') {
      setProfessionalShifts(prev => {
        const newShifts = [...prev];
        // Durante o arraste (drag), apenas pinta. Não apaga para evitar comportamento confuso.
        newShifts[index] = { 
          type: activeShiftType.type, 
          color: activeShiftType.color,
          label: activeShiftType.label 
        };
        return newShifts;
      });
    }
  };

  const handleMouseUp = () => {
    setIsPainting(false);
  };
  
  // Mock de profissionais para seleção
  const PROFISSIONAIS_MOCK = [
    { id: '1', name: 'Dra. Roberta Silva', role: 'Neurologia', initials: 'DR', vinculo: 'Estatutário' },
    { id: '2', name: 'Marcos Cavalcanti', role: 'Enfermeiro Chefe', initials: 'MC', vinculo: 'CLT' },
    { id: '3', name: 'Alice Nogueira', role: 'Anestesiologista', initials: 'AN', vinculo: 'RPA' },
    { id: '4', name: 'Julio Soares', role: 'Técnico Enfermagem', initials: 'JS', vinculo: 'CLT' },
  ];

  const currentProfessional = PROFISSIONAIS_MOCK.find(p => p.id === selectedProfessional);

  // Lógica para estruturar o calendário em semanas
  const firstDayOfMonth = new Date(anoAtual, mesAtual, 1).getDay(); // 0-6
  const daysInMonth = new Date(anoAtual, mesAtual + 1, 0).getDate();
  
  // Cria o grid completo (incluindo dias vazios no início)
  const calendarGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarGrid.push({ type: 'empty' });
  professionalShifts.forEach((shift, index) => {
    calendarGrid.push({ type: 'day', index, shift });
  });
  
  // Preenche o final da última semana
  while (calendarGrid.length % 7 !== 0) {
    calendarGrid.push({ type: 'empty' });
  }

  // Divide em semanas (chunks de 7)
  const weeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    weeks.push(calendarGrid.slice(i, i + 7));
  }

  const daysOfWeek = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  return (
    <Layout activePath="/escala">
      {/* Conductor Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Lançamento de Escala</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full xl:w-auto">
          <button 
            onClick={() => navigate('/escala')}
            className="px-6 py-3.5 bg-surface-low text-on-surface text-sm font-bold rounded-xl flex items-center justify-center gap-2 border border-outline-variant/10 hover:bg-surface-high transition-all active:scale-95 shadow-sm w-full sm:w-auto"
          >
            <XCircle size={18} />
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedProfessional || isSaving}
            className={`px-8 py-3.5 text-surface text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 w-full sm:w-auto ${
              !selectedProfessional || isSaving
                ? 'bg-outline/20 text-outline/50 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-br from-primary to-primary-container shadow-primary/20 hover:brightness-110'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <>
                <Download size={18} />
                Salvar Escala
              </>
            )}
          </button>
        </div>
      </div>

      {/* Professional Selector Section */}
      <section className="mb-8 bg-surface-low rounded-xl border border-outline-variant/5 overflow-hidden h-28">
        <div className="flex items-stretch h-full">
          {/* Seletor (Lado Esquerdo) */}
          <div className="w-full md:w-1/3 p-6 flex flex-col justify-center border-r border-outline-variant/5 bg-surface-low/50">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2">Selecionar Profissional</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
              <select 
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                className="w-full bg-surface border border-outline-variant/20 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none"
              >
                <option value="">Escolha um profissional...</option>
                {PROFISSIONAIS_MOCK.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Card de Informação (Preenchimento Perfeito) */}
          <div className="flex-1 flex items-center relative overflow-hidden bg-surface/30">
            {currentProfessional ? (
              <div className="flex items-center gap-6 px-8 w-full h-full animate-in fade-in slide-in-from-left-8 duration-500">
                {/* Background Decorativo Sutil */}
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center font-extrabold text-surface text-2xl shadow-xl shadow-primary/20 ring-4 ring-primary/10">
                  {currentProfessional.initials}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tight text-on-surface leading-none mb-1">
                    {currentProfessional.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {currentProfessional.role}
                    </span>
                    {currentProfessional.vinculo && (
                      <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary text-[10px] font-black uppercase tracking-widest italic border border-secondary/10">
                        {currentProfessional.vinculo}
                      </span>
                    )}
                    <span className="w-1 h-1 rounded-full bg-outline/30" />
                    <span className="text-outline text-xs font-medium">ID: #00{currentProfessional.id}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 px-8 text-outline/40 italic">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-outline/20 flex items-center justify-center">
                  <User size={24} />
                </div>
                <span className="text-sm font-medium tracking-wide">Aguardando seleção de profissional...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shift Palette (Action Bar) */}
      <section className={`mb-8 p-6 bg-surface-low rounded-xl border border-outline-variant/5 transition-all duration-300 ${!selectedProfessional ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Selecione o Tipo de Lançamento</h3>
          
          {/* Seletor de Mês Integrado */}
          <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 bg-surface px-4 py-2 rounded-lg border border-outline-variant/10 shadow-sm w-full sm:w-auto min-w-[220px]">
            <CalendarDays size={16} className="text-primary shrink-0 hidden sm:block" />
            <button onClick={prevMonth} className="text-outline hover:text-primary transition-colors p-2 sm:p-1 bg-surface-high sm:bg-transparent rounded-lg sm:rounded-none">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-on-surface flex-grow text-center whitespace-nowrap px-2">
              {meses[mesAtual]} / {anoAtual}
            </span>
            <button onClick={nextMonth} className="text-outline hover:text-primary transition-colors p-2 sm:p-1 bg-surface-high sm:bg-transparent rounded-lg sm:rounded-none">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Working States */}
          <PaletteButton label="TRAB DIA TODO" type="TD" color="emerald" active={activeShiftType?.type === 'TD'} onClick={() => setActiveShiftType({label: 'TRAB DIA TODO', color: 'emerald', type: 'TD'})} />
          <PaletteButton label="TRAB MANHÃ" type="TM" color="emerald" active={activeShiftType?.type === 'TM'} onClick={() => setActiveShiftType({label: 'TRAB MANHÃ', color: 'emerald', type: 'TM'})} />
          <PaletteButton label="TRAB TARDE" type="TT" color="emerald" active={activeShiftType?.type === 'TT'} onClick={() => setActiveShiftType({label: 'TRAB TARDE', color: 'emerald', type: 'TT'})} />
          
          {/* Admin States */}
          <PaletteButton label="HOME" type="HO" color="sky" active={activeShiftType?.type === 'HO'} onClick={() => setActiveShiftType({label: 'HOME', color: 'sky', type: 'HO'})} />
          <PaletteButton label="FERIADO" type="FE" color="amber" active={activeShiftType?.type === 'FE'} onClick={() => setActiveShiftType({label: 'FERIADO', color: 'amber', type: 'FE'})} />
          
          {/* Absence States */}
          <PaletteButton label="LICEN MÉDICA" type="LM" color="rose" active={activeShiftType?.type === 'LM'} onClick={() => setActiveShiftType({label: 'LICEN MÉDICA', color: 'rose', type: 'LM'})} />
          <PaletteButton label="FÉRIAS" type="FR" color="purple" active={activeShiftType?.type === 'FR'} onClick={() => setActiveShiftType({label: 'FÉRIAS', color: 'purple', type: 'FR'})} />
          <PaletteButton label="LICEN ESPECIAL" type="LE" color="indigo" active={activeShiftType?.type === 'LE'} onClick={() => setActiveShiftType({label: 'LICEN ESPECIAL', color: 'indigo', type: 'LE'})} />
          <PaletteButton label="PONTO FACULTATIVO" type="PF" color="orange" active={activeShiftType?.type === 'PF'} onClick={() => setActiveShiftType({label: 'PONTO FACULTATIVO', color: 'orange', type: 'PF'})} />
          <PaletteButton label="LICEN NÃO REMUNERADA" type="LR" color="slate" active={activeShiftType?.type === 'LR'} onClick={() => setActiveShiftType({label: 'LICEN NÃO REMUNERADA', color: 'slate', type: 'LR'})} />
        </div>
      </section>

      {/* Main Scheduling Grid (Weeks one below the other) - Premium Style */}
      <div 
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        className={`bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 ${!selectedProfessional ? 'opacity-50 grayscale pointer-events-none' : ''}`}
      >
        {/* Days of week Header - Refined */}
        <div className="grid grid-cols-7 border-b border-outline-variant/20 bg-surface-low/80 backdrop-blur-md sticky top-0 z-10">
          {daysOfWeek.map(day => (
            <div key={day} className="py-2 sm:py-4 text-center border-r border-outline-variant/10 last:border-r-0">
              <span className={`text-[9px] sm:text-[11px] font-black tracking-[0.1em] sm:tracking-[0.3em] ${day === 'DOM' || day === 'SÁB' ? 'text-error/80' : 'text-primary/70'}`}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Rows - Sharp Definitions */}
        <div className="flex flex-col min-h-[500px] bg-surface">
          {currentProfessional ? (
            weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b border-outline-variant/10 last:border-b-0">
                {week.map((cell, cellIndex) => {
                  if (cell.type === 'empty') {
                    return (
                      <div 
                        key={cellIndex} 
                        className="h-20 sm:h-28 border-r border-outline-variant/10 last:border-r-0 bg-surface-high/5 relative overflow-hidden"
                      >
                        {/* Subtle pattern for empty cells */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                      </div>
                    );
                  }
                  
                  const date = cell.index + 1;
                  const isWeekend = (cellIndex === 0 || cellIndex === 6);
                  const isSunday = cellIndex === 0;
                  const isToday = date === new Date().getDate() && mesAtual === new Date().getMonth();

                  return (
                    <div 
                      key={cellIndex}
                      className={`h-20 sm:h-28 border-r border-outline-variant/10 last:border-r-0 flex flex-col relative transition-all duration-300 hover:bg-primary/5 group/cell ${isWeekend ? 'bg-surface-low/30' : ''}`}
                    >
                      {/* Date Indicator - Modern & Premium */}
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10">
                        <div className={`flex items-center justify-center min-w-[20px] h-[20px] sm:min-w-[24px] sm:h-[24px] px-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black transition-all ${
                          isToday 
                            ? 'bg-primary text-surface shadow-lg shadow-primary/30 scale-110' 
                            : isWeekend 
                              ? 'text-error/70 bg-error/5 border border-error/10' 
                              : 'text-outline/40 bg-surface-high/20 border border-outline-variant/5 group-hover/cell:text-primary group-hover/cell:border-primary/20'
                        }`}>
                          {date.toString().padStart(2, '0')}
                        </div>
                      </div>
                      
                      {/* Shift Content - Perfect Centering */}
                      <div className="flex-1 flex items-center justify-center p-1 sm:p-2 mt-3 sm:mt-2">
                        <div className="w-full max-w-[95%] aspect-[1.6/1] sm:aspect-[1.6/1] flex items-center justify-center">
                          <ShiftCell 
                            shift={cell.shift} 
                            onMouseDown={() => handleMouseDown(cell.index)} 
                            onMouseEnter={() => handleMouseEnter(cell.index)} 
                          />
                        </div>
                      </div>

                      {/* Subtle hover indicator at bottom */}
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover/cell:scale-x-100 transition-transform duration-500 origin-left" />
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-20 sm:py-32 text-outline/40 italic px-4 text-center">
              <CalendarDays size={48} sm:size={64} className="mb-4 sm:mb-6 opacity-10" />
              <p className="text-base sm:text-lg font-light tracking-wide">Selecione um profissional para carregar o mapa de escala</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function PaletteButton({ label, type, color, active, onClick }: { label: string, type: string, color: string, active?: boolean, onClick?: () => void }) {
  const getColorClasses = () => {
    switch(color) {
      case 'emerald': return active ? 'bg-emerald-950/50 border-emerald-500/50 scale-105 shadow-md shadow-emerald-500/20' : 'bg-emerald-900/20 border-emerald-500/20 hover:border-emerald-400';
      case 'sky': return active ? 'bg-sky-950/50 border-sky-500/50 scale-105 shadow-md shadow-sky-500/20' : 'bg-sky-950/30 border-sky-500/30 hover:border-sky-400';
      case 'amber': return active ? 'bg-amber-950/50 border-amber-500/50 scale-105 shadow-md shadow-amber-500/20' : 'bg-amber-950/30 border-amber-500/30 hover:border-amber-400';
      case 'rose': return active ? 'bg-rose-950/50 border-rose-500/50 scale-105 shadow-md shadow-rose-500/20' : 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400';
      case 'purple': return active ? 'bg-purple-950/50 border-purple-500/50 scale-105 shadow-md shadow-purple-500/20' : 'bg-purple-950/30 border-purple-500/30 hover:border-purple-400';
      case 'indigo': return active ? 'bg-indigo-950/50 border-indigo-500/50 scale-105 shadow-md shadow-indigo-500/20' : 'bg-indigo-950/30 border-indigo-500/30 hover:border-indigo-400';
      case 'orange': return active ? 'bg-orange-950/50 border-orange-500/50 scale-105 shadow-md shadow-orange-500/20' : 'bg-orange-950/30 border-orange-500/30 hover:border-orange-400';
      default: return active ? 'bg-slate-800 border-slate-400 scale-105 shadow-md' : 'bg-slate-800/50 border-slate-500/30 hover:border-slate-400';
    }
  };

  const getDotColor = () => {
    switch(color) {
      case 'emerald': return 'bg-emerald-400';
      case 'sky': return 'bg-sky-400';
      case 'amber': return 'bg-amber-400';
      case 'rose': return 'bg-rose-500';
      case 'purple': return 'bg-purple-400';
      case 'indigo': return 'bg-indigo-400';
      case 'orange': return 'bg-orange-400';
      default: return 'bg-slate-400';
    }
  };

  const getTextColor = () => {
    switch(color) {
      case 'emerald': return 'text-emerald-100';
      case 'sky': return 'text-sky-100';
      case 'amber': return 'text-amber-100';
      case 'rose': return 'text-rose-100';
      case 'purple': return 'text-purple-100';
      case 'indigo': return 'text-indigo-100';
      case 'orange': return 'text-orange-100';
      default: return 'text-slate-300';
    }
  };

  return (
    <button onClick={onClick} className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${getColorClasses()}`}>
      <span className={`w-2 h-2 rounded-full ${getDotColor()}`}></span>
      <span className={`text-[10px] font-bold uppercase tracking-tight ${getTextColor()}`}>{label}</span>
    </button>
  );
}

function ShiftCell({ shift, onMouseDown, onMouseEnter }: { shift: any, onMouseDown?: () => void, onMouseEnter?: () => void, key?: number | string }) {
  if (shift === 'weekend') {
    return <div className="w-full h-full bg-surface-high/10 rounded-lg"></div>;
  }

  if (!shift) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center p-0.5" 
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
      >
        <div className="w-full h-full rounded-xl border border-outline-variant/10 bg-surface-low/50 cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-inner" />
      </div>
    );
  }

  const getColorClasses = () => {
    switch(shift.color) {
      case 'emerald': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      case 'sky': return 'bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.15)]';
      case 'purple': return 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]';
      case 'rose': return 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
      case 'indigo': return 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]';
      case 'amber': return 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'orange': return 'bg-orange-500/20 border-orange-500/40 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.15)]';
      default: return 'bg-slate-500/20 border-slate-500/40 text-slate-300';
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-0.5" 
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      <div className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:brightness-125 active:scale-95 ${getColorClasses()} ${shift.active ? 'brightness-125' : ''}`}>
        <span className="text-[10px] font-black leading-[1.1] tracking-tight uppercase text-center px-1">
          {shift.label}
        </span>
      </div>
    </div>
  );
}
