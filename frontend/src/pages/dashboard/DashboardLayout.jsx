import { useState } from "react";
import { Outlet, NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  PieChart,
  LogOut,
  TrendingUp, // <-- NOVO ÍCONE ADICIONADO AQUI
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { clsx } from "clsx";

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams();
  const basePath = slug ? `/${slug}` : "";

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate(basePath ? `${basePath}/login` : "/login");
  };

  const cargoLogado = user?.cargo?.toUpperCase();

  const menuItems = [
    {
      path: basePath ? `${basePath}/` : "/",
      icon: LayoutDashboard,
      label: "Visão Geral",
      roles: ["ADMIN", "ADMIN_CLIENTE", "SUPERVISOR", "VENDEDOR"],
    },
    {
      path: `${basePath}/registrarVenda`,
      icon: PlusCircle,
      label: "Novo Atendimento",
      roles: ["ADMIN", "ADMIN_CLIENTE", "VENDEDOR", "DISPOSITIVO"],
    },
    {
      path: `${basePath}/funcionarios`,
      icon: Users,
      label: "Equipe e Vendedores",
      roles: ["ADMIN", "ADMIN_CLIENTE", "SUPERVISOR", "VENDEDOR"],
    },
    {
      path: `${basePath}/graficos`,
      icon: PieChart,
      label: "Gráficos Avançados",
      roles: ["ADMIN", "ADMIN_CLIENTE", "SUPERVISOR", "VENDEDOR"],
    },
    {
      path: `${basePath}/adminpainel`,
      icon: Users,
      label: "Painel Administrativo",
      roles: ["ADMIN", "ADMIN_CLIENTE"],
    },
    {
      path: `${basePath}/meuperfil`,
      icon: Users,
      label: "Meu Perfil",
      roles: ["ADMIN", "ADMIN_CLIENTE", "SUPERVISOR", "VENDEDOR"],
    },
  ];

  const menuFiltrado = menuItems.filter((item) =>
    item.roles?.includes(cargoLogado),
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-blue-50 dark:border-slate-800 flex flex-col shadow-xl shadow-blue-100/20 dark:shadow-none transition-all duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* LOGO SIDEBAR - NOVO DESIGN */}
        <div className="h-20 md:h-24 flex items-center gap-3 px-8 border-b border-slate-50 dark:border-slate-800 shrink-0 select-none">
          <div className="p-2.5 bg-gradient-to-br from-[#4D7BAB] to-blue-400 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[1.35rem] font-black bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent tracking-tight leading-none mb-1">
              Staff Sales
            </span>
            <span className="text-[0.65rem] font-black text-[#4D7BAB] dark:text-blue-400 uppercase tracking-[0.2em] leading-none">
              Manager
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Menu Principal
          </p>

          {menuFiltrado.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path === `${basePath}/`}
              onClick={closeMenu}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-[#4D7BAB] dark:text-blue-400 shadow-sm shadow-blue-100/50 dark:shadow-none"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200",
                )
              }
            >
              <item.icon size={20} strokeWidth={2.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RODAPÉ DA SIDEBAR */}
        <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 transition-colors">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#4D7BAB] dark:text-blue-400 font-bold border border-blue-50 dark:border-slate-700 shrink-0">
              {user?.first_name
                ? user.first_name.charAt(0).toUpperCase()
                : user?.username
                  ? user.username.charAt(0).toUpperCase()
                  : "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {user?.first_name
                  ? `${user.first_name} ${user?.last_name || ""}`.trim()
                  : user?.username || "Usuário"}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 capitalize truncate">
                {user?.cargo || "Administrador"}
              </span>
            </div>
          </div>

          {/* BOTÃO MODO DARK */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-3 mb-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 rounded-2xl font-semibold transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <div className="flex items-center gap-2">
              {theme === "light" ? (
                <Moon size={18} strokeWidth={2.5} />
              ) : (
                <Sun size={18} strokeWidth={2.5} />
              )}
              <span>{theme === "light" ? "Modo Escuro" : "Modo Claro"}</span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl font-semibold transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER MOBILE - NOVO DESIGN */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-blue-50 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm z-30 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-[#4D7BAB] to-blue-400 rounded-lg text-white shadow-sm shadow-blue-500/30">
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[1.05rem] font-black bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent tracking-tight leading-none mb-0.5">
                Staff Sales
              </span>
              <span className="text-[0.55rem] font-black text-[#4D7BAB] dark:text-blue-400 uppercase tracking-[0.2em] leading-none">
                Manager
              </span>
            </div>
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border-none bg-transparent outline-none cursor-pointer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* CONTAINER DA ROTA ATIVA */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
          <div className="p-4 sm:p-8 lg:p-10 pb-24">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
