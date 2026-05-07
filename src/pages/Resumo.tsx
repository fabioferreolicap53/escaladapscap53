import React, { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { useEscalas } from '../hooks/useEscalas';
import { useProfissionais } from '../hooks/useProfissionais';
import { CalendarDays, Sun, Sunrise, Sunset, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Resumo() {
  const { escalas, isLoading: loadingEscalas } = useEscalas();
  const { profissionais, isLoading: loadingProfissionais } = useProfissionais();

  const today = new Date();
  const currentDay = today.getDate();
  const realCurrentMonth = today.getMonth();
  const realCurrentYear = today.getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(realCurrentMonth);
  const [selectedYear, setSelectedYear] = useState(realCurrentYear);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const mesesNomes = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const anosDisponiveis = useMemo(() => {
    const years = escalas ? escalas.map(e => e.year).filter(Boolean) : [];
    const uniqueYears = Array.from(new Set([...years, realCurrentYear])).sort((a, b) => b - a);
    return uniqueYears.length > 0 ? uniqueYears : [realCurrentYear];
  }, [escalas, realCurrentYear]);

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Helper. Convert shift JSON to array.
  const parseShifts = (shiftsJson: string) => {
    try {
      return JSON.parse(shiftsJson || '[]');
    } catch {
      return [];
    }
  };

  // Is shift a "Trabalho" shift?
  const isWork = (shift: any) => {
    if (!shift || typeof shift !== 'object') return false;
    return shift.label && shift.label.startsWith('TRAB');
  };

  // Get icon for shift
  const getShiftIcon = (label: string) => {
    if (label === 'TRAB DIA TODO') return <Sun size={14} className="text-amber-500" />;
    if (label === 'TRAB MANHÃ') return <Sunrise size={14} className="text-amber-400" />;
    if (label === 'TRAB TARDE') return <Sunset size={14} className="text-orange-500" />;
    return <Sun size={14} />;
  };

  const data = useMemo(() => {
    if (!profissionais || !escalas) return { today: [], otherDays: [] };

    // Filter current month scales
    const currentEscalas = escalas.filter(e => e.month === selectedMonth && e.year === selectedYear);

    const todayWorkers: any[] = [];
    const otherDaysMap: Record<number, any[]> = {};

    // Determine what "today" means for this view.
    // If viewing the actual current month/year, "today" is currentDay.
    // If viewing a past/future month, there is no "today" in that context, or we can just show all days in "otherDays".
    const isCurrentMonthView = selectedMonth === realCurrentMonth && selectedYear === realCurrentYear;

    for (let d = 1; d <= daysInMonth; d++) {
      if (!isCurrentMonthView || d !== currentDay) {
        otherDaysMap[d] = [];
      }
    }

    currentEscalas.forEach(escala => {
      const prof = profissionais.find(p => p.id === escala.profId);
      if (!prof) return;

      const shifts = parseShifts(escala.shifts);

      // Check today (index currentDay - 1) only if viewing current month
      if (isCurrentMonthView) {
        const todayShift = shifts[currentDay - 1];
        if (isWork(todayShift)) {
          todayWorkers.push({ prof, shift: todayShift });
        }
      }

      // Check other days
      for (let d = 1; d <= daysInMonth; d++) {
        if (isCurrentMonthView && d === currentDay) continue;
        const shift = shifts[d - 1];
        if (isWork(shift)) {
          otherDaysMap[d].push({ prof, shift });
        }
      }
    });

    // Sort today workers by name
    todayWorkers.sort((a, b) => a.prof.name.localeCompare(b.prof.name));

    // Convert other days map to array
    const otherDays = Object.keys(otherDaysMap)
      .map(Number)
      .map(day => {
        const workers = otherDaysMap[day].sort((a, b) => a.prof.name.localeCompare(b.prof.name));
        const date = new Date(selectedYear, selectedMonth, day);
        const weekDay = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
        return { day, weekDay, workers };
      })
      .filter(d => d.workers.length > 0) // Only days with workers
      .sort((a, b) => a.day - b.day);

    return { today: todayWorkers, otherDays };
  }, [escalas, profissionais, selectedMonth, selectedYear, currentDay, daysInMonth, realCurrentMonth, realCurrentYear]);

  const isLoading = loadingEscalas || loadingProfissionais;
  const isCurrentMonthView = selectedMonth === realCurrentMonth && selectedYear === realCurrentYear;

  return (
    <Layout activePath="/resumo" hideFooterOnMobile={true} hideSearch={true}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col h-full overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-on-surface flex items-center gap-3">
              <CalendarDays className="text-primary" size={32} />
              RESUMO MENSAL
            </h1>
            <p className="text-outline mt-1 font-medium">
              Visão geral de profissionais em serviço.
            </p>
          </div>

          <div className="flex flex-col justify-center min-w-[240px]">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2 ml-1">Período</label>
            <div className="flex items-center gap-2 bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 shadow-sm transition-all hover:border-primary/40 hover:bg-surface-high">
              <button onClick={prevMonth} className="p-1 text-outline hover:text-primary transition-all active:scale-90">
                <ChevronLeft size={18} />
              </button>
              <div className="flex-grow flex items-center justify-center gap-2 px-1">
                <CalendarDays size={16} className="text-primary/70" />
                <div className="flex items-center gap-1.5">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-transparent text-sm font-bold text-on-surface uppercase tracking-wide outline-none cursor-pointer hover:text-primary transition-colors appearance-none text-center"
                  >
                    {mesesNomes.map((mes, index) => (
                      <option key={mes} value={index} className="bg-surface text-on-surface">{mes}</option>
                    ))}
                  </select>
                  <span className="text-outline/30 font-bold">/</span>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
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
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Hoje */}
            {isCurrentMonthView && (
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 shadow-lg shadow-primary/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-black text-primary tracking-tight">HOJE</h2>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {data.today.length} PROF{data.today.length !== 1 ? 'S' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
                      {today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                      {today.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase()}
                    </span>
                  </div>

                  {data.today.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm font-bold text-primary/60 uppercase">Nenhum profissional escalado</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 relative z-10">
                      {data.today.map((item, idx) => (
                        <div key={idx} className="bg-surface border border-outline-variant/20 rounded-xl p-3 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 bg-surface-high rounded-lg flex items-center justify-center text-outline shrink-0">
                              <User size={16} />
                            </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-bold text-on-surface leading-tight break-words">{item.prof.name}</span>
                            <span className="text-[10px] uppercase font-bold text-outline mt-0.5">{item.prof.role}</span>
                          </div>
                          </div>
                          <div className="flex items-center gap-1 bg-surface-high px-2 py-1 rounded-md shrink-0">
                            {getShiftIcon(item.shift.label)}
                            <span className="text-[10px] font-black uppercase">{item.shift.label.replace('TRAB ', '')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Outros Dias */}
            <div className={`${isCurrentMonthView ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col gap-4`}>
              <div className="bg-surface border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-on-surface tracking-tight mb-1">OUTROS DIAS</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-outline mb-6">
                  {mesesNomes[selectedMonth]} / {selectedYear}
                </p>

                {data.otherDays.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-outline-variant/20 rounded-xl">
                    <p className="text-sm font-bold text-outline uppercase">Sem registros para outros dias</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.otherDays.map(({ day, weekDay, workers }) => (
                      <div key={day} className="border border-outline-variant/10 rounded-xl p-4 bg-surface-low flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                          <div className="bg-primary text-surface font-black text-sm w-7 h-7 rounded-lg flex items-center justify-center">
                            {day}
                          </div>
                          <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest bg-primary/5 px-1.5 py-0.5 rounded">
                            {weekDay}
                          </span>
                          <div className="grow" />
                          <span className="text-xs font-bold uppercase tracking-widest text-outline">
                            {workers.length} prof{workers.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {workers.map((w: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-2">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold text-on-surface leading-tight break-words">
                                {w.prof.name}
                              </span>
                              <span className="text-[9px] font-bold uppercase text-outline mt-0.5">
                                {w.prof.role}
                              </span>
                            </div>
                              <div className="flex items-center gap-1 shrink-0 opacity-80" title={w.shift.label}>
                                {getShiftIcon(w.shift.label)}
                                <span className="text-[9px] font-black uppercase text-outline">{w.shift.label.replace('TRAB ', '').substring(0, 3)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}