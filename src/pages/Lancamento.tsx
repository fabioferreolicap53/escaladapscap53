import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfissionais } from '../hooks/useProfissionais';
import { useEscalas } from '../hooks/useEscalas';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { 
  Download, 
  AlertTriangle,
  User,
  XCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Sun,
  Sunrise,
  Sunset,
  Coffee,
  Palmtree,
  Stethoscope,
  Star,
  Clock,
  MinusCircle,
  Plus,
  Search,
  History
} from 'lucide-react';

const SHIFT_TYPES = [
  { id: 'TD', label: 'TRAB DIA TODO', icon: Sun, color: 'emerald', category: 'Trabalho' },
  { id: 'TM', label: 'TRAB MANHÃ', icon: Sunrise, color: 'emerald', category: 'Trabalho' },
  { id: 'TT', label: 'TRAB TARDE', icon: Sunset, color: 'emerald', category: 'Trabalho' },
  { id: 'FO', label: 'FOLGA', icon: Coffee, color: 'sky', category: 'Administrativo' },
  { id: 'BH', label: 'BANCO DE HORAS', icon: History, color: 'indigo', category: 'Administrativo' },
  { id: 'FE', label: 'FERIADO', icon: Star, color: 'amber', category: 'Administrativo' },
  { id: 'PF', label: 'PONTO FACULTATIVO', icon: Clock, color: 'orange', category: 'Administrativo' },
  { id: 'LM', label: 'LICEN MÉDICA', icon: Stethoscope, color: 'rose', category: 'Ausência' },
  { id: 'FR', label: 'FÉRIAS', icon: Palmtree, color: 'purple', category: 'Ausência' },
  { id: 'LE', label: 'LICEN ESPECIAL', icon: Star, color: 'indigo', category: 'Ausência' },
  { id: 'LR', label: 'NÃO REMUNERADA', icon: MinusCircle, color: 'slate', category: 'Ausência' },
];

export default function Lancamento() {
  const { categorias } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const { profissionais } = useProfissionais();
  const { addEscala, updateEscala, escalas } = useEscalas();
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [isProfSelectOpen, setIsProfSelectOpen] = useState(false);
  const [searchProf, setSearchProf] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string>('/escala');
  
  // Password confirmation states
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passError, setPassError] = useState(false);
  
  // Modo de visualização / edição
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Controle do mês
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  // Anos disponíveis para seleção
  const anosDisponiveis = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const base = [currentYear - 1, currentYear, currentYear + 1];
    const fromEscalas = escalas.map(e => e.year);
    return Array.from(new Set([...base, ...fromEscalas])).sort((a, b) => b - a);
  }, [escalas]);

  const prevMonth = () => {
    setMesAtual(prev => {
      if (prev === 0) {
        setAnoAtual(a => a - 1);
        updateShiftsForMonth(11, anoAtual - 1);
        return 11;
      }
      updateShiftsForMonth(prev - 1, anoAtual);
      return prev - 1;
    });
  };
  
  const nextMonth = () => {
    setMesAtual(prev => {
      if (prev === 11) {
        setAnoAtual(a => a + 1);
        updateShiftsForMonth(0, anoAtual + 1);
        return 0;
      }
      updateShiftsForMonth(prev + 1, anoAtual);
      return prev + 1;
    });
  };
  
  // Estado para o tipo de lançamento selecionado na paleta
  const [activeShiftType, setActiveShiftType] = useState<{label: string, color: string, type: string} | null>(null);

  // Função auxiliar para gerar dias vazios baseados no mês
  const generateEmptyShifts = (month: number, year: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array(daysInMonth).fill(null).map((_, i) => {
      const date = new Date(year, month, i + 1);
      const day = date.getDay();
      // Apenas domingos permanecem bloqueados como 'weekend'
      // Sábados agora são tratáveis como dias comuns (null)
      return (day === 0) ? 'weekend' : null;
    });
  };

  // Estado da escala do profissional atual
  const [professionalShifts, setProfessionalShifts] = useState<(any | null)[]>(generateEmptyShifts(new Date().getMonth(), new Date().getFullYear()));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Estado para controle de "Pintura" (Drag to Fill)
  const [isPainting, setIsPainting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Estados para controle de sensibilidade touch
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);
  const touchStartTime = useRef<number>(0);

  // Atualiza os dias vazios (finais de semana) ao mudar o mês
  const updateShiftsForMonth = (month: number, year: number) => {
    setProfessionalShifts(generateEmptyShifts(month, year));
    setSaveError(null);
  };

  useEffect(() => {
    if (isProfSelectOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isProfSelectOpen) {
      setSearchProf('');
    }
  }, [isProfSelectOpen]);

  const handleSave = async () => {
    if (!selectedProfessional) return;
    
    // Verifica se já existe escala para este profissional neste mês/ano
    const escalaExistente = escalas.find(e => 
      e.profId === selectedProfessional && 
      e.month === mesAtual && 
      e.year === anoAtual
    );

    // Se for edição, pede senha
    if (escalaExistente) {
      setIsPassModalOpen(true);
      setPassError(false);
      return;
    }

    // Se for novo, salva direto
    performSave(null);
  };

  const performSave = async (escalaId: string | null) => {
    setIsSaving(true);
    setSaveError(null);
    
    const prof = profissionais.find(p => p.id === selectedProfessional);
    if (prof) {
      try {
        const payload = {
          profId: prof.id,
          name: prof.name,
          avatar: prof.avatar || '',
          role: prof.role || '',
          month: mesAtual,
          year: anoAtual,
          status: 'PUBLICADO',
          statusColor: 'bg-primary/10 text-primary border border-primary/20',
          vinculo: prof.vinculo || '',
          time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', hour12: false}),
          shifts: JSON.stringify(professionalShifts) // Salva os turnos pintados como JSON string
        };

        if (escalaId) {
          // Se já existe, atualiza
          await updateEscala(escalaId, payload);
          setShowSuccessAlert("Escala atualizada com sucesso!");
        } else {
          // Se não existe, cria nova
          await addEscala(payload);
          setShowSuccessAlert("Escala salva com sucesso!");
        }

        // Aguarda um pouco para mostrar o alerta e depois redireciona
        setTimeout(() => {
          setShowSuccessAlert(null);
          navigate(returnUrl);
        }, 1500);
      } catch (error) {
        console.error("Erro ao salvar escala:", error);
        setSaveError("Erro ao salvar no banco de dados.");
      }
    }
    
    setIsSaving(false);
  };

  const handleConfirmPassword = (password: string) => {
    if (password === 'daps2022') {
      if (isReadOnly) {
        setIsReadOnly(false);
      } else {
        const escalaExistente = escalas.find(e => 
          e.profId === selectedProfessional && 
          e.month === mesAtual && 
          e.year === anoAtual
        );
        if (escalaExistente) {
          performSave(escalaExistente.id);
        }
      }
      setIsPassModalOpen(false);
    } else {
      setPassError(true);
    }
  };

  // Efeito para carregar dados do histórico (se houver)
  useEffect(() => {
    if (location.state && location.state.autoSelect) {
      const { profId, month, year, returnUrl: passedReturnUrl, readOnly } = location.state;
      if (profId) setSelectedProfessional(profId);
      
      if (month !== undefined) {
        setMesAtual(month);
      }
      if (year !== undefined) {
        setAnoAtual(year);
      }
      
      if (passedReturnUrl) {
        setReturnUrl(passedReturnUrl);
      }

      if (readOnly !== undefined) {
        setIsReadOnly(readOnly);
      }
      
      // Limpa o estado no history do browser para não re-selecionar ao dar reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Efeito para carregar a escala salva do PocketBase quando seleciona um profissional ou muda o mês/ano
  useEffect(() => {
    if (selectedProfessional) {
      // Busca se já existe uma escala para este profissional neste mês/ano
      const escalaExistente = escalas.find(e => 
        e.profId === selectedProfessional && 
        e.month === mesAtual && 
        e.year === anoAtual
      );

      if (escalaExistente && escalaExistente.shifts) {
        try {
          const parsedShifts = JSON.parse(escalaExistente.shifts);
          // Validação básica para garantir que o array tem o tamanho do mês atual
          if (Array.isArray(parsedShifts) && parsedShifts.length === new Date(anoAtual, mesAtual + 1, 0).getDate()) {
            setProfessionalShifts(parsedShifts);
          } else {
            setProfessionalShifts(generateEmptyShifts(mesAtual, anoAtual));
          }
        } catch (e) {
          console.error("Erro ao fazer parse dos turnos:", e);
          setProfessionalShifts(generateEmptyShifts(mesAtual, anoAtual));
        }
      } else {
        setProfessionalShifts(generateEmptyShifts(mesAtual, anoAtual));
      }
    } else {
      // Se não tem profissional, garante que o grid está no mês certo e vazio
      setProfessionalShifts(generateEmptyShifts(mesAtual, anoAtual));
    }
  }, [selectedProfessional, mesAtual, anoAtual, escalas]);

  const applyShift = (index: number) => {
    if (professionalShifts[index] === 'weekend' || isReadOnly) return;
    
    setProfessionalShifts(prev => {
      const newShifts = [...prev];
      
      // Se já existe um lançamento no dia clicado, ele SEMPRE apaga (toggle off)
      if (newShifts[index]) {
        newShifts[index] = null;
      } else if (activeShiftType) {
        // Se o dia está vazio e existe um tipo selecionado, ele pinta
        newShifts[index] = { 
          type: activeShiftType.type, 
          color: activeShiftType.color,
          label: activeShiftType.label 
        };
      }
      return newShifts;
    });
  };

  const handleMouseDown = (index: number, e: React.PointerEvent) => {
    if (isReadOnly) return;
    
    // Se for um evento de toque (pointerType === 'touch'), registramos a posição e o tempo
    // para diferenciar um toque intencional de um deslize (scroll)
    if (e.pointerType === 'touch') {
      touchStartPos.current = { x: e.clientX, y: e.clientY };
      touchStartTime.current = Date.now();
      return; // No toque, não aplicamos o shift imediatamente no pointerDown
    }

    // Comportamento normal para mouse
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsPainting(true);
    applyShift(index);
  };

  const handlePointerUp = (index: number, e: React.PointerEvent) => {
    if (isReadOnly) return;
    setIsPainting(false);

    // Lógica para finalizar o toque em dispositivos mobile/tablet
    if (e.pointerType === 'touch' && touchStartPos.current) {
      const xDiff = Math.abs(e.clientX - touchStartPos.current.x);
      const yDiff = Math.abs(e.clientY - touchStartPos.current.y);
      const timeDiff = Date.now() - touchStartTime.current;

      // Se o movimento foi pequeno (menos de 10px) e rápido (menos de 300ms)
      // consideramos um clique intencional e não um scroll
      if (xDiff < 10 && yDiff < 10 && timeDiff < 300) {
        applyShift(index);
      }
      
      touchStartPos.current = null;
    }
  };

  const handleMouseEnter = (index: number, e: React.PointerEvent) => {
    if (isPainting && activeShiftType && professionalShifts[index] !== 'weekend' && !isReadOnly) {
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
    touchStartPos.current = null;
  };
  
  // Ordenar e filtrar profissionais
  const filteredAndSortedProfissionais = useMemo(() => {
    if (!profissionais) return [];
    
    return [...profissionais]
      .filter(p => 
        (p.name || '').toLowerCase().includes(searchProf.toLowerCase()) ||
        (p.role || '').toLowerCase().includes(searchProf.toLowerCase()) ||
        (p.vinculo || '').toLowerCase().includes(searchProf.toLowerCase()) ||
        (p.linha_cuidado || '').toLowerCase().includes(searchProf.toLowerCase())
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [profissionais, searchProf]);

  const currentProfessional = profissionais.find(p => p.id === selectedProfessional);

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
    <Layout activePath="/escala" hideFooterOnMobile={true}>
      <PasswordConfirmModal 
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onConfirm={handleConfirmPassword}
        error={passError}
        title={isReadOnly ? "Habilitar Edição" : "Confirmar Edição"}
        description={
          isReadOnly 
            ? "Esta escala está em modo de visualização. Para realizar alterações, por favor confirme sua senha de acesso."
            : "Esta escala já foi lançada anteriormente. Para salvar as novas alterações, por favor confirme sua senha de acesso."
        }
      />
      {/* Conductor Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Lançamento de Escala</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full xl:w-auto items-center">
          {saveError && (
            <span className="text-error text-xs font-bold bg-error/10 px-3 py-1.5 rounded-lg animate-pulse">
              {saveError}
            </span>
          )}
          <button 
            onClick={() => navigate(returnUrl)}
            className="px-6 py-3.5 bg-surface-low text-on-surface text-sm font-bold rounded-xl flex items-center justify-center gap-2 border border-outline-variant/10 hover:bg-surface-high transition-all active:scale-95 shadow-sm w-full sm:w-auto"
          >
            <XCircle size={18} />
            Cancelar
          </button>
          <button 
            onClick={isReadOnly ? () => setIsPassModalOpen(true) : handleSave}
            disabled={(!selectedProfessional && !isReadOnly) || isSaving}
            className={`px-8 py-3.5 text-surface text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 w-full sm:w-auto ${
              (!selectedProfessional && !isReadOnly) || isSaving
                ? 'bg-outline/20 text-outline/50 cursor-not-allowed shadow-none'
                : isReadOnly 
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                  : 'bg-gradient-to-br from-primary to-primary-container shadow-primary/20 hover:brightness-110'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                Salvando...
              </span>
            ) : isReadOnly ? (
              <>
                <CheckCircle2 size={18} />
                Habilitar Edição
              </>
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
      <section className="mb-8 bg-surface-low rounded-xl border border-outline-variant/5 min-h-[112px]">
        <div className="flex flex-col md:flex-row items-stretch min-h-[112px]">
          {/* Seletor (Lado Esquerdo) - Modern Custom Dropdown */}
          <div className="w-full md:w-1/3 p-6 flex flex-col justify-center border-r border-outline-variant/5 bg-surface-low/50 relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2">Selecionar Profissional</label>
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsProfSelectOpen(!isProfSelectOpen)}
                className={`w-full flex items-center gap-3 bg-surface border rounded-xl px-4 py-4 text-sm transition-all duration-300 group cursor-pointer ${
                  isProfSelectOpen 
                    ? 'border-primary ring-4 ring-primary/10 shadow-lg' 
                    : 'border-outline-variant/20 hover:border-primary/40 hover:bg-surface-high shadow-sm'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${selectedProfessional ? 'bg-primary/10 text-primary' : 'bg-surface-high text-outline'}`}>
                  <User size={18} />
                </div>
                <span className={`flex-grow text-left truncate font-bold ${selectedProfessional ? 'text-on-surface' : 'text-outline/60'}`}>
                  {selectedProfessional 
                    ? profissionais.find(p => p.id === selectedProfessional)?.name 
                    : "Escolha um profissional..."}
                </span>
                <ChevronLeft 
                  size={18} 
                  className={`text-outline transition-transform duration-300 ${isProfSelectOpen ? 'rotate-90' : '-rotate-90'}`} 
                />
              </div>

              {/* Dropdown Menu */}
              {isProfSelectOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl flex flex-col">
                  {/* Search Field inside Dropdown */}
                  <div className="p-3 border-b border-outline-variant/10 bg-surface/50">
                    <div className="relative group">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar profissional..."
                        value={searchProf}
                        onChange={(e) => setSearchProf(e.target.value)}
                        className="w-full bg-surface-low border border-outline-variant/10 rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {filteredAndSortedProfissionais.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center text-outline/30">
                          <User size={20} />
                        </div>
                        <p className="text-xs text-outline font-bold uppercase tracking-widest italic">Nenhum profissional encontrado</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredAndSortedProfissionais.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedProfessional(p.id);
                              setIsProfSelectOpen(false);
                            }}
                            className={`w-full flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl transition-all ${
                              selectedProfessional === p.id 
                                ? 'bg-primary text-surface' 
                                : 'hover:bg-primary/5 text-on-surface'
                            }`}
                          >
                            <span className="text-sm font-black tracking-tight uppercase">{p.name}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedProfessional === p.id ? 'text-surface/70' : 'text-outline'}`}>
                              {p.role} • {p.vinculo} {p.linha_cuidado ? `• ${p.linha_cuidado}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Card de Informação (Preenchimento Perfeito) */}
          <div className="flex-1 flex flex-col md:flex-row items-center relative overflow-hidden bg-surface/30 rounded-b-xl md:rounded-bl-none md:rounded-r-xl">
            {currentProfessional ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-6 md:px-8 w-full h-full animate-in fade-in slide-in-from-left-8 duration-500">
                {/* Background Decorativo Sutil */}
                <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-l from-primary/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center font-black text-surface text-2xl shadow-xl shadow-primary/20 ring-4 ring-primary/10 relative z-10 shrink-0">
                    {currentProfessional.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="relative z-10 flex flex-col">
                    <h4 className="text-xl font-black text-on-surface tracking-tight leading-tight line-clamp-1">{currentProfessional.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        {currentProfessional.role}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-secondary-container/10 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/10">
                        {currentProfessional.vinculo}
                      </span>
                      {currentProfessional.linha_cuidado && (
                        <span className="px-2 py-0.5 rounded bg-surface-high text-outline text-[10px] font-black uppercase tracking-widest border border-outline-variant/10">
                          {currentProfessional.linha_cuidado}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Seletor de Período Integrado no Card */}
                <div className="mt-4 md:mt-0 md:ml-auto flex flex-col justify-center w-full md:w-auto md:min-w-[240px] md:mr-4 relative z-10">
                  <label className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2 ml-1">Período</label>
                  <div className="flex items-center gap-2 bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 shadow-sm transition-all hover:border-primary/40 hover:bg-surface-high">
                    <button onClick={prevMonth} className="p-1 text-outline hover:text-primary transition-all active:scale-90">
                      <ChevronLeft size={18} />
                    </button>
                    <div className="flex-grow flex items-center justify-center gap-2 px-1">
                      <CalendarDays size={16} className="text-primary/70" />
                      <div className="flex items-center gap-1.5">
                        <select 
                          value={mesAtual}
                          onChange={(e) => {
                            const newMonth = Number(e.target.value);
                            setMesAtual(newMonth);
                            updateShiftsForMonth(newMonth, anoAtual);
                          }}
                          className="bg-transparent text-sm font-bold text-on-surface uppercase tracking-wide outline-none cursor-pointer hover:text-primary transition-colors appearance-none text-center"
                        >
                          {meses.map((mes, index) => (
                            <option key={mes} value={index} className="bg-surface text-on-surface">{mes.toUpperCase()}</option>
                          ))}
                        </select>
                        <span className="text-outline/30 font-bold">/</span>
                        <select 
                          value={anoAtual}
                          onChange={(e) => {
                            const newYear = Number(e.target.value);
                            setAnoAtual(newYear);
                            updateShiftsForMonth(mesAtual, newYear);
                          }}
                          className="bg-transparent text-sm font-bold text-on-surface uppercase tracking-wide outline-none cursor-pointer hover:text-primary transition-colors appearance-none text-center"
                        >
                          {anosDisponiveis.map(ano => (
                            <option key={ano} value={ano} className="bg-surface text-on-surface">{ano}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button onClick={nextMonth} className="p-1 text-outline hover:text-primary transition-all active:scale-90">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-4 px-8 text-outline/40 italic text-sm">
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-outline-variant/20 flex items-center justify-center">
                  <User size={20} />
                </div>
                <span>Aguardando seleção de profissional...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shift Palette (Action Bar) - Modern Redesign */}
      <section className={`mb-8 p-6 bg-surface-low/50 backdrop-blur-sm rounded-2xl border border-outline-variant/10 transition-all duration-500 ${(!selectedProfessional || isReadOnly) ? 'opacity-50 grayscale pointer-events-none' : ''} ${isReadOnly ? 'translate-y-2' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-1">Seletor de Lançamento</h3>
            <p className="text-[10px] text-outline font-bold uppercase tracking-widest opacity-60">Escolha um turno para pintar no calendário</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5">
          {SHIFT_TYPES.map((shift) => (
            <button
              key={shift.id}
              onClick={() => setActiveShiftType({label: shift.label, color: shift.color, type: shift.id})}
              className={`group flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden active:scale-95 ${
                activeShiftType?.type === shift.id
                  ? `bg-${shift.color}-500/10 border-${shift.color}-500 shadow-lg shadow-${shift.color}-500/20`
                  : 'bg-surface border-transparent hover:border-outline-variant/30 hover:bg-surface-high shadow-sm'
              }`}
            >
              {/* Active Indicator Bar */}
              {activeShiftType?.type === shift.id && (
                <div className={`absolute top-0 left-0 w-full h-1 bg-${shift.color}-500`} />
              )}
              
              <div className={`mb-2 p-2 rounded-xl transition-all duration-300 ${
                activeShiftType?.type === shift.id
                  ? `bg-${shift.color}-500 text-surface scale-110 shadow-md shadow-${shift.color}-500/40`
                  : `bg-${shift.color}-500/10 text-${shift.color}-500 group-hover:scale-110`
              }`}>
                <shift.icon size={20} strokeWidth={2.5} />
              </div>
              
              <span className={`text-[9px] font-black text-center leading-tight uppercase tracking-tighter transition-colors ${
                activeShiftType?.type === shift.id ? 'text-on-surface' : 'text-outline group-hover:text-on-surface'
              }`}>
                {shift.label}
              </span>
              
              {/* Category Badge - Only visible when not active or on hover */}
              <div className="mt-1.5 px-1.5 py-0.5 rounded bg-surface-low/50 border border-outline-variant/5">
                <span className="text-[7px] font-bold text-outline/40 uppercase tracking-widest">{shift.category}</span>
              </div>
            </button>
          ))}
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
            <div key={day} className="py-4 sm:py-6 text-center border-r border-outline-variant/10 last:border-r-0 bg-surface-high/20">
              <span className={`text-[11px] sm:text-[13px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase ${day === 'DOM' || day === 'SÁB' ? 'text-on-surface' : 'text-primary'}`}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Indicador Flutuante de Período para Mobile/Tablet (Print-friendly) */}
        {currentProfessional && (
          <div className="md:hidden fixed bottom-6 right-4 z-50 pointer-events-none opacity-90">
            <div className="bg-surface-high/90 backdrop-blur-md border border-outline-variant/30 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-background/50">
              <CalendarDays size={14} className="text-primary" />
              <span className="text-xs font-black tracking-widest uppercase text-on-surface">
                {meses[mesAtual].substring(0,3)}/{anoAtual}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col bg-surface relative">
          
          {currentProfessional ? (
            weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b border-outline-variant/10 last:border-b-0 min-h-[120px]">
                {week.map((cell, cellIndex) => {
                  const day = cell.type === 'day' ? cell.index + 1 : null;
                  const isToday = day === new Date().getDate() && mesAtual === new Date().getMonth() && anoAtual === new Date().getFullYear();
                  const isWeekend = (cellIndex === 0 || cellIndex === 6);

                  return (
                    <div key={cellIndex} className={`relative flex flex-col group/day border-r border-outline-variant/10 last:border-r-0 ${!day ? 'bg-surface-high/10' : 'bg-surface'}`}>
                      {/* Day Number Badge */}
                      {day && (
                        <div className="absolute top-2 left-2 z-20">
                          <span className={`flex items-center justify-center w-7 h-7 text-[11px] font-black rounded-lg transition-all duration-300 ${
                            isToday 
                              ? 'bg-primary text-surface shadow-lg shadow-primary/30 scale-110' 
                              : isWeekend 
                                ? 'text-error/70 bg-error/5 border border-error/10' 
                                : 'text-outline/40 group-hover/day:text-primary group-hover/day:bg-primary/5'
                          }`}>
                            {String(day).padStart(2, '0')}
                          </span>
                        </div>
                      )}

                      {/* Shift Content Area */}
                      <div className="flex-grow flex flex-col pt-10">
                        {day && (
                          <ShiftCell 
                            shift={cell.shift}
                            onPointerDown={(e) => handleMouseDown(cell.index, e)}
                            onPointerUp={(e) => handlePointerUp(cell.index, e)}
                            onPointerEnter={(e) => handleMouseEnter(cell.index, e)}
                            isReadOnly={isReadOnly}
                          />
                        )}
                      </div>
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

      {showSuccessAlert && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-full duration-300">
          <div className="bg-surface border border-primary/20 rounded-xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px]">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-grow">
              <p className="text-sm font-bold text-on-surface">{showSuccessAlert}</p>
              <p className="text-[10px] text-outline font-medium">O histórico foi atualizado.</p>
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

function ShiftCell({ shift, onPointerDown, onPointerUp, onPointerEnter, isReadOnly }: { shift: any, onPointerDown?: (e: React.PointerEvent) => void, onPointerUp?: (e: React.PointerEvent) => void, onPointerEnter?: (e: React.PointerEvent) => void, isReadOnly: boolean }) {
  if (shift === 'weekend') {
    return (
      <div className="flex-grow bg-surface-high/30 border-r border-outline-variant/5 last:border-r-0" />
    );
  }

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-500/20 border-emerald-500/40 text-on-surface shadow-[inset_0_0_12px_rgba(16,185,129,0.1)]';
      case 'sky': return 'bg-sky-500/20 border-sky-500/40 text-on-surface shadow-[inset_0_0_12px_rgba(14,165,233,0.1)]';
      case 'amber': return 'bg-amber-500/20 border-amber-500/40 text-on-surface shadow-[inset_0_0_12px_rgba(245,158,11,0.1)]';
      case 'rose': return 'bg-rose-500/20 border-rose-500/40 text-on-surface shadow-[inset_0_0_12px_rgba(244,63,94,0.1)]';
      case 'purple': return 'bg-purple-500/20 border-purple-500/40 text-on-surface shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]';
      case 'indigo': return 'bg-indigo-500/20 border-indigo-500/40 text-on-surface shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]';
      case 'orange': return 'bg-orange-500/20 border-orange-500/40 text-on-surface shadow-[inset_0_0_12px_rgba(249,115,22,0.1)]';
      default: return 'bg-slate-500/20 border-slate-500/40 text-on-surface';
    }
  };

  return (
    <div 
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      className={`flex-grow border-r border-outline-variant/10 last:border-r-0 transition-all duration-200 relative group/cell min-h-[100px] ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${shift ? getColorClasses(shift.color) : isReadOnly ? '' : 'hover:bg-primary/5'}`}
    >
      {shift && (
        <div className="absolute inset-1.5 flex flex-col items-center justify-center text-center p-1 rounded-xl border border-current/20 backdrop-blur-[2px] animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
          <span className="text-[10px] font-black leading-tight uppercase tracking-tighter drop-shadow-sm">
            {shift.label}
          </span>
          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
        </div>
      )}
      {!shift && !isReadOnly && (
        <div className="absolute inset-0 opacity-0 group-hover/cell:opacity-100 flex items-center justify-center transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Plus size={14} className="text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
