import dashboardFull from "../../assets/landing/TelaGráficosAtendimentos-30Dias.png";
import graficoConversao from "../../assets/landing/GraficosFluxoDeClientes-ConversaoPerdas.png";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a1628] text-white min-h-[90vh] flex items-center">
      {/* Background Gradients & Glows */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0 mt-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Texto (Esquerda) */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-md rounded-full px-4 py-2 text-sm text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Sistema Inteligente de Atendimento
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-100">
              Dados reais da sua loja.
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent pb-2 block">
                Decisões lucrativas.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
              Um sistema de atendimento simples, onde o vendedor registra o dia
              a dia e o gestor enxerga o futuro da empresa em painéis claros.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#contato"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1"
              >
                Solicitar Demonstração
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7-7m7-7H3"
                  />
                </svg>
              </a>
              <a
                href="#metricas"
                className="inline-flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold px-8 py-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          {/* Mockup (Direita) */}
          <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 mt-10 lg:mt-0">
            {/* Glow de fundo da imagem */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-amber-500/20 blur-3xl rounded-full" />

            <div className="relative w-full max-w-[600px] z-10">
              {/* Browser Window Mockup */}
              <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/60 overflow-hidden">
                {/* Header do Browser (estilo macOS) */}
                <div className="bg-slate-800/80 border-b border-slate-700/50 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm" />
                  <div className="flex-1 text-center">
                    <div className="inline-block bg-slate-900/50 text-slate-400 text-[10px] px-3 py-1 rounded-md font-medium tracking-widest border border-slate-700/50">
                      app.joiasmanager.com.br
                    </div>
                  </div>
                </div>
                {/* Imagem do Dashboard */}
                <div className="p-1 bg-[#0f172a]">
                  <img
                    src={dashboardFull}
                    alt="Painel administrativo do Staff Sales Manager."
                    className="w-full object-cover rounded-b-xl border border-slate-800"
                  />
                </div>
              </div>

              {/* Gráfico Flutuante */}
              <div
                className="absolute -bottom-8 -left-8 bg-[#1e293b]/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/60 p-2 max-w-[260px] border border-slate-700/50 animate-bounce"
                style={{ animationDuration: "6s" }}
              >
                <img
                  src={graficoConversao}
                  alt="Gráfico de conversão e perdas"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
