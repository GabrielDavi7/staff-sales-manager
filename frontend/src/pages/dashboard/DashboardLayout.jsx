import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  PieChart,
  LogOut,
  Diamond,
} from "lucide-react";
import { clsx } from "clsx";

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    // Define os itens do menu da sidebar
    { path: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
    {
      path: "/dashboard/registrar",
      icon: PlusCircle,
      label: "Novo Atendimento",
    },
    {
      path: "/dashboard/funcionarios",
      icon: Users,
      label: "Equipe e Vendedores",
    },
    {
      path: "/dashboard/relatorios",
      icon: PieChart,
      label: "Gráficos Avançados",
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/*Sidebar*/}
      <aside className="w-64 bg-white border-r border-blue-50 flex flex-col shadow-xl shadow-blue-100/20 hidden md:flex z-10">
        {/* Logo / Marca */}
        <div className="h-24 flex items-center gap-3 px-8 border-b border-slate-50">
          <div className="p-2 bg-[#4D7BAB] rounded-xl text-white shadow-md shadow-blue-900/20">
            <Diamond size={24} />
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">
            Joias Manager
          </span>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Menu Principal
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"} // Garante que a raiz não fique sempre ativa
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-[#4D7BAB] shadow-sm shadow-blue-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                )
              }
            >
              <item.icon size={20} strokeWidth={2.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé da Sidebar (Usuário e Sair) */}
        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#4D7BAB] font-bold border border-blue-50">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">
                {user?.nome || "Usuário"}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {user?.cargo || "Administrador"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl font-semibold transition-colors"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo (Onde as páginas carregam) */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        {/* O Outlet é o "buraco" onde o React Router vai renderizar a Home, o Registrar, os Funcionarios, etc. */}
        <div className="p-4 sm:p-8 lg:p-10 pb-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
