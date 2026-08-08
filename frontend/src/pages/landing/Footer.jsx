import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-slate-400 py-16 border-t border-slate-800/50 relative overflow-hidden">
      {/* Detalhe de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Marca e Descrição (Ocupa mais espaço) */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-slate-900 font-black text-sm">JM</span>
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
                Staff Sales Manager.
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm font-medium">
              Sistema inteligente de gestão de atendimentos para lojas e varejo.
              Transforme dados operacionais em decisões lucrativas.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all border border-slate-700/50"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all border border-slate-700/50"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">
              Links Rápidos
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a
                  href="#metricas"
                  className="hover:text-amber-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>{" "}
                  Funcionalidades
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  className="hover:text-amber-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>{" "}
                  Planos e Preços
                </a>
              </li>
              <li>
                <a
                  href="#contato"
                  className="hover:text-amber-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>{" "}
                  Falar com Vendas
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="hover:text-amber-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>{" "}
                  Acesso ao Sistema
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">
              Contato & Suporte
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <a
                  href="mailto:contato@joiasmanager.com.br"
                  className="hover:text-amber-400 transition-colors"
                >
                  contato@joiasmanager.com.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Montes Claros, MG
                  <br />
                  <span className="text-slate-500 text-xs">
                    Atendimento em todo o Brasil
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Direitos Autorais */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>
            &copy; {new Date().getFullYear()} Staff Sales Manager. Todos os
            direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-amber-400 transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
