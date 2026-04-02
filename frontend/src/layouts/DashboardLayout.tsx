import { Outlet, Link, useLocation } from "react-router";
import {
  Gem,
  LayoutDashboard,
  FilePlus2,
  UserCircle,
  BarChart3,
} from "lucide-react";
import { clsx } from "clsx";

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 flex flex-col selection:bg-neutral-200">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link
                to="/"
                className="flex flex-shrink-0 items-center gap-2 group"
              >
                <div className="bg-neutral-900 text-white p-1.5 rounded-lg group-hover:bg-neutral-800 transition-colors">
                  <Gem size={20} className="stroke-[1.5]" />
                </div>
                <span className="font-semibold text-lg tracking-tight uppercase tracking-widest">
                  Aura
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden sm:flex sm:space-x-1">
                <Link
                  to="/"
                  className={clsx(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors gap-2",
                    location.pathname === "/"
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50",
                  )}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/novo-atendimento"
                  className={clsx(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors gap-2",
                    location.pathname === "/novo-atendimento"
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50",
                  )}
                >
                  <FilePlus2 size={18} />
                  Novo Atendimento
                </Link>
                <Link
                  to="/relatorios"
                  className={clsx(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors gap-2",
                    location.pathname === "/relatorios"
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50",
                  )}
                >
                  <BarChart3 size={18} />
                  Relatórios
                </Link>
              </nav>
            </div>

            <div className="flex items-center">
              <button className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors bg-white hover:bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full shadow-sm">
                <UserCircle size={18} />
                <span className="hidden sm:inline-block">Gerente</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
