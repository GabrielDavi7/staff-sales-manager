import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detecta o scroll para mudar a cor de fundo da Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-[#0a1628]/95 backdrop-blur-md border-slate-800 py-3 shadow-lg"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-slate-900 font-black text-sm">JM</span>
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">
              Staff Sales Manager.
            </span>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#metricas"
              className="text-sm font-semibold text-slate-300 hover:text-amber-400 transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#planos"
              className="text-sm font-semibold text-slate-300 hover:text-amber-400 transition-colors"
            >
              Planos
            </a>
            <a
              href="#contato"
              className="text-sm font-semibold text-slate-300 hover:text-amber-400 transition-colors"
            >
              Contato
            </a>

            <div className="w-px h-5 bg-slate-700 mx-2"></div>

            <a
              href="/login" // Ajuste para a rota de login do seu sistema
              className="text-sm font-bold text-white hover:text-amber-400 transition-colors"
            >
              Entrar
            </a>
            <a
              href="#contato"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5"
            >
              Solicitar Demo
            </a>
          </div>

          {/* Botão Menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a1628]/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col">
            <a
              href="#metricas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#planos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              Planos
            </a>
            <a
              href="#contato"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              Contato
            </a>
            <div className="h-px bg-slate-800 my-2"></div>
            <a
              href="/login"
              className="block px-3 py-2 text-base font-bold text-white hover:text-amber-400 rounded-lg transition-colors"
            >
              Fazer Login
            </a>
            <a
              href="#contato"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center mt-4 bg-amber-500 hover:bg-amber-400 text-slate-900 text-base font-bold px-5 py-3 rounded-xl transition-all shadow-lg"
            >
              Solicitar Demonstração
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
