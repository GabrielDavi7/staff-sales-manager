import painelAdmin from '../../assets/landing/Tela-PainelAdministrativoCompleto.png';
import metricaForm from '../../assets/landing/Tela-PainelAdministrativo-CadastrarNovasMetricas.png';

export default function MetricsSection() {
  return (
    <section id="metricas" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-semibold text-sm tracking-wide uppercase">
            Métricas Customizáveis
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Você define o que importa.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Seus vendedores registram em segundos.
            Você vê os gargalos da loja em tempo real.
          </p>
        </div>

        {/* Fluxo: Registro → Resultado */}
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          {/* Tela 1: Painel */}
          <div className="relative group">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-transform duration-300 group-hover:-translate-y-2">
              <div className="bg-gray-100 px-4 py-2 flex items-center gap-1.5 border-b">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-500 font-medium">Painel do Gestor</span>
              </div>
              <img
                src={painelAdmin}
                alt="Painel administrativo com dados consolidados da loja"
                className="w-full p-3"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow">
              📊 Visão consolidada
            </div>
          </div>

          {/* Seta conectora (mobile: vertical, desktop: horizontal) */}
          <div className="flex md:hidden justify-center py-2">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          {/* Tela 2: Configuração */}
          <div className="relative group">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-transform duration-300 group-hover:-translate-y-2">
              <div className="bg-gray-100 px-4 py-2 flex items-center gap-1.5 border-b">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-500 font-medium">Cadastro de Métricas</span>
              </div>
              <img
                src={metricaForm}
                alt="Tela de cadastro de métricas — configure o que é relevante para seu negócio"
                className="w-full p-3"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow">
              ⚡ Customização total
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
