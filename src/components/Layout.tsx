import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  CalendarDays, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle,
  ShieldCheck,
  X,
  Menu,
  LogOut,
  UserCircle2,
  PieChart,
  ClipboardList
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activePath?: string;
  hideFooterOnMobile?: boolean;
}

export function Layout({ children, activePath = '/', hideFooterOnMobile = false }: LayoutProps) {
  const { searchTerm, setSearchTerm } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background text-on-surface font-sans selection:bg-primary/30 antialiased overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/15 bg-surface flex flex-col p-4 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="mb-8 px-2 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-primary">ESCALA DAPS/CAP5.3</h1>
          </div>
          <button 
            className="lg:hidden text-outline hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-2 grow">
          <NavItem icon={<PieChart size={20} />} label="Monitoramento" active={activePath === '/monitoramento'} path="/monitoramento" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<ClipboardList size={20} />} label="Resumo" active={activePath === '/resumo'} path="/resumo" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<CalendarDays size={20} />} label="Escala" active={activePath === '/escala'} path="/escala" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<Users size={20} />} label="Profissionais" active={activePath === '/profissionais'} path="/profissionais" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<Settings size={20} />} label="Configurações" active={activePath === '/configuracoes'} path="/configuracoes" onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="mt-auto p-4 bg-surface-low rounded-xl flex items-center justify-between border border-outline-variant/10 group hover:border-outline-variant/30 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <UserCircle2 size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate">Gestor DAPS</span>
              <span className="text-[10px] text-outline uppercase tracking-wider">Administrador</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors shrink-0"
            title="Sair do sistema"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen relative overflow-hidden lg:ml-64 w-full">
        {/* Topbar - Harmonized with Footer */}
        <header className="absolute top-0 right-0 w-full h-12 z-30 bg-background/90 backdrop-blur-md flex justify-between items-center px-4 lg:px-8 border-b border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-4 grow max-w-xl">
            <button 
              className="lg:hidden text-outline hover:text-primary transition-colors p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative w-full group hidden sm:block">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-primary' : 'text-outline group-focus-within:text-primary'}`} size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar profissional, escala..." 
                className="w-full bg-surface-low border border-outline-variant/10 rounded-full pl-9 pr-9 py-1.5 text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-outline/50 text-on-surface outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-error transition-colors bg-surface-high rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-40">GESTÃO DE PROFISSIONAIS</span>
          </div>
        </header>

        {/* Mobile Search Bar (Visible only on very small screens) */}
        <div className="sm:hidden absolute top-12 left-0 w-full px-4 py-2 bg-surface z-20 border-b border-outline-variant/10">
           <div className="relative w-full group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-primary' : 'text-outline'}`} size={14} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..." 
                className="w-full bg-surface-low border border-outline-variant/10 rounded-lg pl-8 pr-8 py-1.5 text-xs focus:ring-2 focus:ring-primary/30 transition-all text-on-surface outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-error"
                >
                  <X size={12} />
                </button>
              )}
            </div>
        </div>

        {/* Page Content */}
        <div className="mt-[88px] sm:mt-12 pt-4 sm:pt-0 p-4 sm:p-6 lg:p-8 flex-grow overflow-y-auto overflow-x-hidden relative custom-scrollbar">
          {children}
        </div>

        {/* Footer - Harmonized */}
        <footer className={`w-full py-4 bg-background/90 backdrop-blur-md flex flex-col justify-center items-center px-4 lg:px-8 border-t border-outline-variant/10 flex-shrink-0 z-30 gap-1 ${hideFooterOnMobile ? 'hidden md:flex' : ''}`}>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">ESCALA DAPS/CAP5.3</span>
          <span className="text-[8px] font-bold text-outline/40 uppercase tracking-[0.15em]">Desenvolvido por Fabio Ferreira de Oliveira - DAPS/CAP5.3</span>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, path, onClick }: { icon: ReactNode, label: string, active?: boolean, path: string, onClick?: () => void }) {
  if (active) {
    return (
      <Link to={path} onClick={onClick} className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 border border-primary/20 rounded-lg shadow-sm active:scale-[0.98] transition-all font-bold">
        {icon}
        <span className="text-sm">{label}</span>
      </Link>
    );
  }
  
  return (
    <Link to={path} onClick={onClick} className="flex items-center gap-3 px-4 py-3 text-outline hover:bg-surface-high hover:text-on-surface border border-transparent hover:border-outline-variant/10 transition-all duration-200 rounded-lg group font-medium">
      <span className="group-hover:text-primary transition-colors">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}
