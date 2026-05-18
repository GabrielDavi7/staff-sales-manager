import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  PieChart,
  LogOut,
  Diamond,
  Menu, // Ícone de três listrinhas (Hambúrguer)
  X, // Ícone para fechar o menu
} from "lucide-react";
import { clsx } from "clsx";

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Estado para controlar a abertura/fechamento do menu no mobile
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  const cargoLogado = user?.cargo?.toUpperCase();

  // Configuração mestre com array de permissões por item de menu
  const menuItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Visão Geral",
      roles: ["ADMIN", "SUPERVISOR", "VENDEDOR"],
    },
    {
      path: "registrarvenda",
      icon: PlusCircle,
      label: "Novo Atendimento",
      roles: ["ADMIN", "VENDEDOR", "DISPOSITIVO"],
    },
    {
      path: "funcionarios",
      icon: Users,
      label: "Equipe e Vendedores",
      roles: ["ADMIN", "SUPERVISOR", "VENDEDOR"],
    },
    {
      path: "graficos",
      icon: PieChart,
      label: "Gráficos Avançados",
      roles: ["ADMIN", "SUPERVISOR", "VENDEDOR"],
    },
    {
      path: "adminpainel",
      icon: Users,
      label: "Painel Administrativo",
      roles: ["ADMIN"],
    },
    {
      path: "meuperfil",
      icon: Users,
      label: "Meu Perfil",
      roles: ["ADMIN", "SUPERVISOR", "VENDEDOR"],
    },
  ];

  // Filtra dinamicamente os itens com proteção "?."
  const menuFiltrado = menuItems.filter((item) =>
    item.roles?.includes(cargoLogado),
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* 1. OVERLAY ESCURO NO MOBILE */}
      {/* Escurece o fundo e fecha o menu caso o usuário clique fora da barra lateral */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* 2. SIDEBAR RESPONSIVA */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-blue-50 flex flex-col shadow-xl shadow-blue-100/20 transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0", // No computador, fixa a barra lateral na tela
          isOpen ? "translate-x-0" : "-translate-x-full", // No mobile, esconde ou desliza para dentro
        )}
      >
        {/* Logo / Marca */}
        <div className="h-20 md:h-24 flex items-center gap-3 px-8 border-b border-slate-50 shrink-0">
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

          {menuFiltrado.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={closeMenu} // Fecha automaticamente o menu ao trocar de página no celular
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
        <div className="p-6 border-t border-slate-50 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#4D7BAB] font-bold border border-blue-50 shrink-0">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-700 truncate">
                {user?.nome || "Usuário"}
              </span>
              <span className="text-xs text-slate-400 capitalize truncate">
                {user?.cargo || "Administrador"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl font-semibold transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* 3. ÁREA CONTEÚDO PRINCIPAL (HEADER MOBILE + CONTEÚDO DINÂMICO) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* CABEÇALHO SUPERIOR - VISÍVEL APENAS NO CELULAR/TABLET */}
        <header className="md:hidden bg-white border-b border-blue-50 px-6 py-4 flex items-center justify-between shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#4D7BAB] rounded-lg text-white shadow-sm">
              <Diamond size={18} />
            </div>
            <span className="text-lg font-extrabold text-slate-800 tracking-tight">
              Joias Manager
            </span>
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors border-none bg-transparent outline-none cursor-pointer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* CONTAINER DA ROTA ATIVA */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 sm:p-8 lg:p-10 pb-24">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
