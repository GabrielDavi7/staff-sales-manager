import dashboardFull from '../../assets/landing/TelaGráficosAtendimentos-30Dias.png';
import graficoConversao from '../../assets/landing/GraficosFluxoDeClientes-ConversaoPerdas.png';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#132238] to-[#1a3550] text-white">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Sistema de gestão de atendimentos
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Dados reais da sua loja.
              <br />
              <span className="text-amber-400">Decisões reais</span> para o seu negócio.
            </h1>
            <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
              Um sistema de atendimento simples, onde o vendedor registra o dia a dia
              e o gestor enxerga o futuro da empresa em painéis claros.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#contato"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                Solicitar Demonstração
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a href="#metricas"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          {/* Mockup do Monitor */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Monitor frame */}
            <div className="relative">
              {/* Tela principal dentro do mockup */}
              <div className="bg-[#0d1b2a] rounded-t-2xl border-2 border-gray-600 border-b-0 p-2 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="flex-1 mx-4 bg-gray-700 rounded-full h-1.5" />
                </div>
                <img
                  src={dashboardFull}
                  alt="Painel administrativo do Joias Manager"
                  className="w-full max-w-[500px] rounded-lg shadow-inner"
                />
              </div>
              {/* Base do monitor */}
              <div className="bg-gray-700 h-4 rounded-b-lg mx-8" />
              <div className="bg-gray-600 h-2 w-24 rounded-b mx-auto" />
              <div className="bg-gray-700 h-1.5 w-40 rounded-b mx-auto" />
            </div>

            {/* Gráfico flutuante */}
            <div className="absolute -bottom-6 -right-4 bg-white rounded-xl shadow-2xl p-2 max-w-[240px] rotate-3 hover:rotate-0 transition-transform duration-300 z-10 border border-gray-100">
              <img
                src={graficoConversao}
                alt="Gráfico de conversão e perdas"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
