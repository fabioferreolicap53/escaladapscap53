import { useState, useRef, useEffect } from 'react';
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

export default function Profissionais() {
  const { linhasCuidado, categorias, vinculos, searchTerm, setSearchTerm } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showExcluirConfirm, setShowExcluirConfirm] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    linha: '',
    categoria: '',
    vinculo: ''
  });
  const [editingProfissionalId, setEditingProfissionalId] = useState<string | null>(null);
  const [novoProfissional, setNovoProfissional] = useState({
    name: '',
    depts: [] as string[],
    role: '',
    hours: '',
    vinculo: ''
  });

  const [profissionais, setProfissionais] = useState(() => {
    const saved = localStorage.getItem('escala_profissionais');
    if (saved) return JSON.parse(saved);
    return [
      {
        name: "Dr. Ricardo Menezes",
        id: "#4492-B",
        avatar: "https://ui-avatars.com/api/?name=Ricardo+Menezes&background=0D8ABC&color=fff",
        dept: "UTI Adulto",
        role: "Médico Intensivista",
        status: "Ativo",
        statusColor: "primary",
        hours: "40h / Semanal",
        vinculo: "Estatutário"
      },
      {
        name: "Enf. Cláudia Barros",
        id: "#8103-C",
        avatar: "https://ui-avatars.com/api/?name=Claudia+Barros&background=4f46e5&color=fff",
        dept: "Emergência",
        role: "Enfermeira Chefe",
        status: "Em Férias",
        statusColor: "tertiary",
        hours: "36h / Semanal",
        vinculo: "CLT"
      },
      {
        name: "Dr. Sérgio Magalhães",
        id: "#2290-A",
        avatar: "https://ui-avatars.com/api/?name=Sergio+Magalhaes&background=7c3aed&color=fff",
        dept: "Centro Cirúrgico",
        role: "Cirurgião Geral",
        status: "Licença",
        statusColor: "error",
        hours: "24h / Semanal",
        vinculo: "RPA"
      },
      {
        name: "Dra. Letícia Costa",
        id: "#5512-P",
        avatar: "https://ui-avatars.com/api/?name=Leticia+Costa&background=059669&color=fff",
        dept: "Pediatria",
        role: "Pediatra",
        status: "Ativo",
        statusColor: "primary",
        hours: "40h / Semanal",
        vinculo: "Estatutário"
      }
    ];
  });

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('escala_profissionais', JSON.stringify(profissionais));
  }, [profissionais]);

  const handleSalvarProfissional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoProfissional.name || !novoProfissional.role) return;

    if (editingProfissionalId) {
      // Lógica de Edição
      setProfissionais(prev => prev.map(p => {
        if (p.id === editingProfissionalId) {
          return {
            ...p,
            name: novoProfissional.name,
            dept: novoProfissional.depts.length > 0 ? novoProfissional.depts.join(', ') : "Clínica Geral",
            role: novoProfissional.role,
            hours: novoProfissional.hours || "40h / Semanal",
            vinculo: novoProfissional.vinculo || "CLT"
          };
        }
        return p;
      }));
    } else {
      // Lógica de Criação
      const novo = {
        name: novoProfissional.name,
        id: `#${Math.floor(1000 + Math.random() * 9000)}-N`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(novoProfissional.name)}&background=random&color=fff`,
        dept: novoProfissional.depts.length > 0 ? novoProfissional.depts.join(', ') : "Clínica Geral",
        role: novoProfissional.role,
        status: "Ativo",
        statusColor: "primary",
        hours: novoProfissional.hours || "40h / Semanal",
        vinculo: novoProfissional.vinculo || "CLT"
      };
      setProfissionais([novo, ...profissionais]);
    }
    
    fecharModal();
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditingProfissionalId(null);
    setNovoProfissional({ name: '', depts: [], role: '', hours: '', vinculo: '' });
  };

  const handleEditClick = (prof: any) => {
    setEditingProfissionalId(prof.id);
    setNovoProfissional({
      name: prof.name,
      depts: prof.dept.split(', ').filter((d: string) => d !== ''),
      role: prof.role,
      hours: prof.hours,
      vinculo: prof.vinculo || ''
    });
    setIsModalOpen(true);
  };

  const handleExcluirProfissional = (id: string) => {
    const profExcluido = profissionais.find(p => p.id === id);
    setProfissionais(prev => prev.filter(p => p.id !== id));
    setShowExcluirConfirm(null);
    setShowSuccessAlert(`Profissional ${profExcluido?.name} excluído com sucesso!`);
    
    // Esconde o alerta de sucesso após 3 segundos
    setTimeout(() => {
      setShowSuccessAlert(null);
    }, 3000);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return;

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      const idxNome = headers.indexOf('profissional');
      const idxCarga = headers.indexOf('carga horária');
      const idxLinha = headers.indexOf('linha de cuidado');
      const idxVinculo = headers.indexOf('tipo de vínculo');

      if (idxNome === -1 || idxCarga === -1 || idxLinha === -1) {
        alert('Cabeçalhos do CSV devem conter: profissional, carga horária, linha de cuidado');
        return;
      }

      const novosProfissionais = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          name: values[idxNome],
          id: `#${Math.floor(1000 + Math.random() * 9000)}-CSV`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(values[idxNome])}&background=random&color=fff`,
          dept: values[idxLinha],
          role: "Profissional da Saúde", // Padrão caso não venha no CSV
          status: "Ativo",
          statusColor: "primary",
          hours: values[idxCarga].includes('h') ? values[idxCarga] : `${values[idxCarga]}h / Semanal`,
          vinculo: idxVinculo !== -1 ? values[idxVinculo] : "CLT"
        };
      }).filter(p => p.name);

      setProfissionais(prev => [...novosProfissionais, ...prev]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const toggleLinhaDeCuidado = (linha: string) => {
    setNovoProfissional(prev => ({
      ...prev,
      depts: prev.depts.includes(linha) 
        ? prev.depts.filter(l => l !== linha)
        : [...prev.depts, linha]
    }));
  };

  const filteredProfissionais = profissionais.filter(prof => {
    // Filtro de Status (Abas)
    if (activeFilter !== 'Todos' && prof.status !== activeFilter) return false;
    
    // Filtros Avançados
    if (filters.linha && !prof.dept.includes(filters.linha)) return false;
    if (filters.categoria && prof.role !== filters.categoria) return false;
    if (filters.vinculo && prof.vinculo !== filters.vinculo) return false;

    // Busca por Texto
    if (searchTerm && 
        !prof.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !prof.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const clearFilters = () => {
    setFilters({ linha: '', categoria: '', vinculo: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.linha || filters.categoria || filters.vinculo || searchTerm;

  const counts = {
    Todos: profissionais.length,
    Ativo: profissionais.filter(p => p.status === 'Ativo').length,
    'Em Férias': profissionais.filter(p => p.status === 'Em Férias').length,
    Licença: profissionais.filter(p => p.status === 'Licença').length,
  };

  return (
    <Layout activePath="/profissionais">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-8 mb-10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Gestão de Equipe</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Profissionais Cadastrados</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 sm:px-6 py-2.5 bg-surface-low text-on-surface text-sm font-bold rounded-lg flex items-center justify-center gap-2 border border-outline-variant/10 hover:bg-surface-high transition-all active:scale-95 shadow-sm w-full sm:w-auto"
          >
            <Upload size={18} />
            Importar CSV
          </button>
          <button 
            onClick={() => {
              setEditingProfissionalId(null);
              setNovoProfissional({ name: '', depts: [], role: '', hours: '', vinculo: '' });
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
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8 flex flex-wrap gap-2 p-1.5 bg-surface-low rounded-xl border border-outline-variant/10">
          {['Todos', 'Ativo', 'Em Férias', 'Licença'].map(tab => {
            const displayTab = tab === 'Ativo' ? 'Ativos' : tab;
            const count = counts[tab as keyof typeof counts] || 0;
            return (
              <button 
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 sm:px-6 py-2 rounded-lg text-xs font-bold transition-all flex-grow sm:flex-grow-0 ${activeFilter === tab ? 'bg-surface text-primary shadow-sm border border-outline-variant/10' : 'text-outline hover:text-on-surface hover:bg-surface-high/50'}`}
              >
                {displayTab} ({count})
              </button>
            );
          })}
        </div>
        
        <div className="col-span-12 lg:col-span-4 flex gap-3 relative">
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
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Linha(s) de Cuidado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Vínculo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Carga Horária</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredProfissionais.map((prof, idx) => (
                <TableRow 
                  key={prof.id}
                  prof={prof}
                  onEdit={() => handleEditClick(prof)}
                  onDelete={() => setShowExcluirConfirm(prof.id)}
                />
              ))}
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
                  placeholder="Ex: Dr. João Silva"
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
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-3">Linha(s) de Cuidado</label>
                  <div className="flex flex-wrap gap-2">
                    {linhasCuidado.map((linha) => (
                      <button
                        key={linha}
                        type="button"
                        onClick={() => toggleLinhaDeCuidado(linha)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                          novoProfissional.depts.includes(linha)
                            ? 'bg-primary text-surface border-primary shadow-md shadow-primary/20 scale-105'
                            : 'bg-surface-high text-outline border-outline-variant/30 hover:border-primary/50'
                        }`}
                      >
                        {linha}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Carga Horária</label>
                <select 
                  value={novoProfissional.hours}
                  onChange={(e) => setNovoProfissional({...novoProfissional, hours: e.target.value})}
                  className="w-full bg-surface-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Selecione...</option>
                  <option value="20h / Semanal">20h / Semanal</option>
                  <option value="24h / Semanal">24h / Semanal</option>
                  <option value="36h / Semanal">36h / Semanal</option>
                  <option value="40h / Semanal">40h / Semanal</option>
                </select>
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
                    <option key={v} value={v}>{v}</option>
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
              <h3 className="text-xl font-bold text-on-surface mb-2">Confirmar Exclusão?</h3>
              <p className="text-sm text-outline leading-relaxed">
                Você está prestes a excluir <strong>{profissionais.find(p => p.id === showExcluirConfirm)?.name}</strong>. 
                Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex border-t border-outline-variant/10">
              <button 
                onClick={() => setShowExcluirConfirm(null)}
                className="flex-1 px-6 py-4 text-sm font-bold text-outline hover:bg-surface-high transition-colors border-r border-outline-variant/10"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleExcluirProfissional(showExcluirConfirm)}
                className="flex-1 px-6 py-4 text-sm font-bold text-error hover:bg-error/5 transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function TableRow({ prof, onEdit, onDelete }: { prof: any, onEdit: () => void, onDelete: () => void }) {
  const { name, id, avatar, dept, role, hours, vinculo } = prof;
  return (
    <tr 
      onClick={onEdit}
      className="group hover:bg-surface-high transition-colors cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={avatar} alt={name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-low bg-green-500 shadow-sm"></div>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{name}</p>
            <p className="text-[10px] text-outline">ID: {id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-on-surface-variant font-bold">{role}</p>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {dept.split(', ').map((d: string, i: number) => (
            <span key={i} className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter italic whitespace-nowrap border border-primary/5">
              {d}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/10">
          {vinculo || "CLT"}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-on-surface-variant font-medium">{hours}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Editar Profissional"
            className="text-outline hover:text-primary transition-colors p-2 hover:bg-surface-bright rounded-lg active:scale-90"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Excluir Profissional"
            className="text-outline hover:text-error transition-colors p-2 hover:bg-surface-bright rounded-lg active:scale-90"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
