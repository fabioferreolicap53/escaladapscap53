import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useEscalas } from '../hooks/useEscalas';
import { useProfissionais } from '../hooks/useProfissionais';
import { useSettings } from '../contexts/SettingsContext';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { 
  Zap, 
  Clock, 
  CalendarDays,
  Search,
  User,
  AlertCircle,
  FileCheck2,
  Timer
} from 'lucide-react';

export default function Monitoramento() {
  const navigate = useNavigate();
  const { escalas, isLoading: loadingEscalas } = useEscalas();
  const { profissionais, isLoading: loadingProfissionais } = useProfissionais();
  const { searchTerm, setSearchTerm } = useSettings();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Password confirmation states
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit', data: any } | null>(null);
  const [passError, setPassError] = useState(false);

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
      const escala = escalas.find(
        e => e.profId === prof.id && e.month === selectedMonth && e.year === selectedYear
      );

      return {
        ...prof,
        status: escala ? 'realizado' : 'pendente',
        created: escala?.created
      };
    }).filter(prof => {
      // Aplica busca por texto se houver
      const searchTrimmed = (searchTerm || '').trim();
      if (searchTrimmed) {
        const searchLower = searchTrimmed.toLowerCase();
        return (
          prof.name.toLowerCase().includes(searchLower) ||
          prof.role.toLowerCase().includes(searchLower) ||
          (prof.vinculo && prof.vinculo.toLowerCase().includes(searchLower))
        );
      }
      return true;
    }).sort((a, b) => {
      // Ordena pelo momento do registro (mais recentes no topo)
      // Profissionais sem registro (pendentes) ficam por último ou ordenados por nome
      if (a.status === 'realizado' && b.status === 'realizado') {
        return new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime();
      }
      if (a.status !== b.status) {
        return a.status === 'realizado' ? -1 : 1;
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
            returnUrl: '/monitoramento',
            readOnly: true // Permite apenas visualização inicial
          } 
        });
      }
    } else if (prof.status === 'pendente') {
      // Navega para a tela de lançamento para um novo registro
      navigate('/lancamento', { 
        state: { 
          autoSelect: true, 
          profId: prof.id, 
          month: selectedMonth, 
          year: selectedYear,
          returnUrl: '/monitoramento'
        } 
      });
    }
  };

  return (
    <Layout activePath="/monitoramento">
      <style>{`
        @keyframes pulse-neon-green {
          0%, 100% { box-shadow: 0 0 5px #39FF14, 0 0 10px #39FF14; }
          50% { box-shadow: 0 0 15px #39FF14, 0 0 25px #39FF14; }
        }
        @keyframes pulse-neon-yellow {
          0%, 100% { box-shadow: 0 0 5px #FFFF00, 0 0 10px #FFFF00; }
          50% { box-shadow: 0 0 15px #FFFF00, 0 0 25px #FFFF00; }
        }
        .animate-neon-green {
          animation: pulse-neon-green 2s infinite;
        }
        .animate-neon-yellow {
          animation: pulse-neon-yellow 2s infinite;
        }
        .pending-row-hover:hover {
          background-color: rgba(255, 255, 0, 0.05);
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
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer focus:bg-surface-high"
          >
            {mesesNomes.map((mes, index) => (
              <option key={mes} value={index} className="bg-surface text-on-surface">{mes}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer pr-2 focus:bg-surface-high"
          >
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano} className="bg-surface text-on-surface">{ano}</option>
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Escalas Lançadas</h3>
            <div className="p-2 bg-[#39FF14]/10 text-[#39FF14] rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              <Zap size={20} className="animate-pulse" />
            </div>
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-4xl font-black tracking-tighter text-on-surface">{totais.realizados}</span>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Profissionais</span>
          </div>
        </div>

        {/* Card 3: Pendentes */}
        <div className="bg-surface-low rounded-2xl p-6 border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFF00]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Pendências</h3>
            <div className="p-2 bg-[#FFFF00]/10 text-[#FFFF00] rounded-lg shadow-[0_0_15px_rgba(255,255,0,0.2)]">
              <Timer size={20} className="animate-pulse" />
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-high rounded-lg text-xs font-bold text-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.2)]">
              <Zap size={14} />
              Lançado
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-high rounded-lg text-xs font-bold text-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.2)]">
              <Timer size={14} />
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
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Linha de Cuidado</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Categoria / Vínculo</th>
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
                    className={`transition-all duration-300 cursor-pointer group/row ${
                      prof.status === 'realizado' 
                        ? 'hover:bg-primary/5' 
                        : 'pending-row-hover'
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      {prof.status === 'realizado' ? (
                        <div className="w-10 h-10 rounded-xl bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center mx-auto border border-[#39FF14]/40 animate-neon-green group-hover/row:scale-110 transition-all duration-300" title="Escala Lançada - Clique para ver">
                          <Zap size={22} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#FFFF00]/10 text-[#FFFF00]/70 flex items-center justify-center mx-auto border border-[#FFFF00]/20 animate-neon-yellow group-hover/row:scale-110 transition-all duration-300" title="Pendente - Clique para lançar">
                          <Timer size={20} strokeWidth={2} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className={`text-sm font-extrabold transition-colors ${
                          prof.status === 'realizado' 
                            ? 'text-on-surface group-hover/row:text-[#39FF14]' 
                            : 'text-on-surface group-hover/row:text-[#FFFF00]'
                        }`}>{prof.name}</p>
                        {prof.created && prof.status === 'realizado' ? (
                          <span className="text-[9px] font-bold text-outline/60 uppercase tracking-tighter">
                            Lançado em {new Date(prof.created).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-[#FFFF00]/40 uppercase tracking-tighter">
                            Clique para iniciar o lançamento
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-on-surface/80 uppercase tracking-[0.2em]">{prof.linha_cuidado || "---"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-[0.2em]">{prof.role}</p>
                        <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest truncate max-w-[200px]">
                          {prof.vinculo || "---"}
                        </span>
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
