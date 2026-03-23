import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useEscalas } from '../hooks/useEscalas';
import { useProfissionais } from '../hooks/useProfissionais';
import { useSettings } from '../contexts/SettingsContext';
import { 
  CheckCircle2, 
  XCircle, 
  CalendarDays,
  Search,
  User,
  AlertCircle
} from 'lucide-react';

export default function Monitoramento() {
  const navigate = useNavigate();
  const { escalas, isLoading: loadingEscalas } = useEscalas();
  const { profissionais, isLoading: loadingProfissionais } = useProfissionais();
  const { searchTerm, setSearchTerm } = useSettings();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const mesesNomes = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];

  // Anos disponíveis (ano atual + 1 ano pra frente e 1 pra trás no mínimo, ou os anos que tem na escala)
  const anosBase = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];
  const anosEscalas = escalas.map(e => e.year);
  const anosDisponiveis = Array.from(new Set([...anosBase, ...anosEscalas])).sort((a, b) => b - a);

  // Processar dados cruzados
  const dadosMonitoramento = useMemo(() => {
    if (!profissionais) return [];

    return profissionais.map(prof => {
      // Verifica se o profissional tem escala para o mês/ano selecionado
      const temEscala = escalas.some(
        e => e.profId === prof.id && e.month === selectedMonth && e.year === selectedYear
      );

      return {
        ...prof,
        status: temEscala ? 'realizado' : 'pendente'
      };
    }).filter(prof => {
      // Aplica busca por texto se houver
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          prof.name.toLowerCase().includes(searchLower) ||
          prof.role.toLowerCase().includes(searchLower) ||
          (prof.vinculo && prof.vinculo.toLowerCase().includes(searchLower))
        );
      }
      return true;
    }).sort((a, b) => {
      // Ordena primeiro por status (pendentes primeiro, se preferir. Vamos botar pendentes primeiro)
      if (a.status !== b.status) {
        return a.status === 'pendente' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [profissionais, escalas, selectedMonth, selectedYear, searchTerm]);

  const totais = {
    total: dadosMonitoramento.length,
    realizados: dadosMonitoramento.filter(p => p.status === 'realizado').length,
    pendentes: dadosMonitoramento.filter(p => p.status === 'pendente').length
  };

  const percentualConclusao = totais.total === 0 ? 0 : Math.round((totais.realizados / totais.total) * 100);

  const isLoading = loadingEscalas || loadingProfissionais;

  const handleRowClick = (prof: any) => {
    if (prof.status === 'realizado') {
      const escala = escalas.find(
        e => e.profId === prof.id && e.month === selectedMonth && e.year === selectedYear
      );
      if (escala) {
        navigate('/lancamento', { 
          state: { 
            editEscala: escala, 
            autoSelect: true, 
            profId: prof.id, 
            month: selectedMonth, 
            year: selectedYear,
            returnUrl: '/monitoramento'
          } 
        });
      }
    }
  };

  return (
    <Layout activePath="/monitoramento">
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-8 mb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Acompanhamento</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Monitoramento de Lançamentos</h2>
        </div>
        
        {/* Filtro Temporal */}
        <div className="flex gap-3 bg-surface-low p-2 rounded-xl border border-outline-variant/10">
          <div className="flex items-center gap-2 px-3 border-r border-outline-variant/10">
            <CalendarDays size={18} className="text-primary" />
            <span className="text-[10px] font-black text-outline uppercase tracking-widest">Período</span>
          </div>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer"
          >
            {mesesNomes.map((mes, index) => (
              <option key={mes} value={index}>{mes}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer pr-2"
          >
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Progresso */}
        <div className="bg-surface-low rounded-2xl p-6 border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4 relative z-10">Conclusão Mensal</h3>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-5xl font-black tracking-tighter text-on-surface">{percentualConclusao}%</span>
            <span className="text-xs font-bold text-outline uppercase tracking-wider mb-2">da equipe</span>
          </div>
          <div className="w-full bg-surface-high h-2 mt-5 rounded-full overflow-hidden relative z-10">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${percentualConclusao}%` }}
            />
          </div>
        </div>

        {/* Card 2: Lançados */}
        <div className="bg-surface-low rounded-2xl p-6 border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Escalas Lançadas</h3>
            <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-4xl font-black tracking-tighter text-on-surface">{totais.realizados}</span>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Profissionais</span>
          </div>
        </div>

        {/* Card 3: Pendentes */}
        <div className="bg-surface-low rounded-2xl p-6 border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Pendências</h3>
            <div className="p-2 bg-error/10 text-error rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-4xl font-black tracking-tighter text-on-surface">{totais.pendentes}</span>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Profissionais</span>
          </div>
        </div>
      </div>

      {/* Tabela de Detalhamento */}
      <div className="bg-surface-low rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-on-surface">Detalhamento por Profissional</h3>
            <p className="text-xs text-outline font-medium mt-1">Status de envio da escala de {mesesNomes[selectedMonth]} de {selectedYear}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-high rounded-lg text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Lançado
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-high rounded-lg text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              Pendente
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface/50 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline w-16 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Profissional</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Vínculo / Linha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-sm font-medium text-outline">Carregando dados...</span>
                    </div>
                  </td>
                </tr>
              ) : dadosMonitoramento.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <span className="text-sm font-medium text-outline">Nenhum profissional encontrado.</span>
                  </td>
                </tr>
              ) : (
                dadosMonitoramento.map((prof) => (
                  <tr 
                    key={prof.id} 
                    onClick={() => handleRowClick(prof)}
                    className={`transition-all duration-300 ${
                      prof.status === 'realizado' 
                        ? 'cursor-pointer hover:bg-primary/5 group/row' 
                        : 'opacity-80'
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      {prof.status === 'realizado' ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30 animate-pulse-slow group-hover/row:scale-110 transition-transform" title="Escala Lançada - Clique para ver">
                          <CheckCircle2 size={20} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-error/10 text-error/60 flex items-center justify-center mx-auto border border-error/10" title="Pendente">
                          <XCircle size={18} strokeWidth={2} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-extrabold transition-colors ${prof.status === 'realizado' ? 'text-on-surface group-hover/row:text-primary' : 'text-on-surface/60'}`}>{prof.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-[0.2em]">{prof.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-on-surface/80 uppercase tracking-[0.2em]">{prof.vinculo || "---"}</span>
                        {prof.linha_cuidado && (
                          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest truncate max-w-[200px]">
                            {prof.linha_cuidado}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
