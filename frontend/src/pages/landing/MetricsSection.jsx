import { ArrowRight, ArrowDown, Settings2, BarChart3 } from "lucide-react";
import painelAdmin from "../../assets/landing/Tela-PainelAdministrativoCompleto.png";
import metricaForm from "../../assets/landing/Tela-PainelAdministrativo-CadastrarNovasMetricas.png";

export default function MetricsSection() {
  return (
    <section
      id="metricas"
      className="py-24 md:py-32 bg-slate-50 relative overflow-hidden"
    >
      {/* Elementos de fundo decorativos */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-amber-200/40 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-blue-200/40 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="bg-amber-100 text-amber-700 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full">
              Métricas Customizáveis
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Você define <span className="text-amber-500">o que importa.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            Personalize os motivos de perda de venda. Seus vendedores registram
            em segundos e você vê os gargalos da loja em tempo real.
          </p>
        </div>

        {/* Fluxo: Registro → Resultado */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center max-w-6xl mx-auto">
          {/* Tela 1: Configuração (Origem) */}
          <div className="relative group animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-200 rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

            <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden transition-transform duration-500 group-hover:-translate-y-2">
              <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-rose-400 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                <span className="ml-2 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Configurações
                </span>
              </div>

              {/* CORREÇÃO AQUI: aspect-video e object-cover para forçar tamanho igual */}
              <div className="p-2 bg-slate-50 aspect-[4/3] lg:aspect-video relative overflow-hidden">
                <img
                  src={metricaForm}
                  alt="Tela de cadastro de métricas"
                  className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] object-cover object-top rounded-lg border border-slate-200/60 shadow-sm"
                />
              </div>
            </div>

            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
              <Settings2 size={16} className="text-amber-400" />
              1. Crie suas métricas
            </div>
          </div>

          {/* Seta conectora */}
          <div className="flex justify-center py-8 md:py-0 animate-in fade-in duration-700 delay-300">
            <div className="flex md:hidden flex-col items-center gap-2">
              <div className="w-1 h-8 border-l-2 border-dashed border-amber-300"></div>
              <div className="bg-amber-100 p-2 rounded-full text-amber-600 shadow-sm">
                <ArrowDown size={24} strokeWidth={2.5} />
              </div>
              <div className="w-1 h-8 border-l-2 border-dashed border-amber-300"></div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-1 border-t-2 border-dashed border-amber-300"></div>
              <div className="bg-amber-100 p-3 rounded-full text-amber-600 shadow-sm transition-transform duration-300 hover:scale-110">
                <ArrowRight size={28} strokeWidth={2.5} />
              </div>
              <div className="w-8 h-1 border-t-2 border-dashed border-amber-300"></div>
            </div>
          </div>

          {/* Tela 2: Painel Consolidador (Destino) */}
          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-300 rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

            <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden transition-transform duration-500 group-hover:-translate-y-2">
              <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-rose-400 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                <span className="ml-2 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Painel Gerencial
                </span>
              </div>

              {/* CORREÇÃO AQUI: aspect-video e object-cover para forçar tamanho igual */}
              <div className="p-2 bg-slate-50 aspect-[4/3] lg:aspect-video relative overflow-hidden">
                <img
                  src={painelAdmin}
                  alt="Painel administrativo"
                  className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] object-cover object-top rounded-lg border border-slate-200/60 shadow-sm"
                />
              </div>
            </div>

            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#4D7BAB] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
              <BarChart3 size={16} className="text-blue-200" />
              2. Visão consolidada
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
