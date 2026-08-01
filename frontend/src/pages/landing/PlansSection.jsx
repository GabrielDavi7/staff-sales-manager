const plans = [
  {
    name: 'Basic',
    price: 'R$ 79',
    period: '/mês',
    description: 'Para pequenos negócios que querem profissionalizar a gestão.',
    features: [
      '1 loja',
      'Até 10 vendedores',
      'Métricas ilimitadas',
      'Dashboard + exportação CSV',
      'Dispositivo com PIN',
      'Suporte prioritário',
    ],
    highlighted: false,
    cta: 'Assinar Basic',
  },
  {
    name: 'Plus',
    price: 'R$ 109',
    period: '/mês',
    description: 'Para quem está crescendo e precisa gerenciar mais de uma unidade.',
    features: [
      'Até 3 lojas',
      'Vendedores ilimitados',
      'Métricas ilimitadas',
      'Dashboard consolidado',
      'Exportação CSV',
      'Dispositivo por loja',
      'Suporte via WhatsApp',
    ],
    highlighted: true,
    cta: 'Assinar Plus',
  },
  {
    name: 'Pro',
    price: 'R$ 149',
    period: '/mês',
    description: 'Para redes com múltiplas lojas e equipes.',
    features: [
      'Até 5 lojas',
      'Vendedores ilimitados',
      'Métricas ilimitadas',
      'Dashboard consolidado',
      'Exportação CSV + Excel',
      'Dispositivo por loja',
      'Suporte via WhatsApp',
    ],
    highlighted: false,
    cta: 'Assinar Pro',
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Solução personalizada para grandes redes e franquias.',
    features: [
      'Lojas ilimitadas',
      'Vendedores ilimitados',
      'Dashboard por franqueado',
      'API de integração',
      'Treinamento da equipe',
      'Gerente de conta dedicado',
      'SLA garantido',
    ],
    highlighted: false,
    cta: 'Falar com Vendas',
  },
];

export default function PlansSection() {
  return (
    <section id="planos" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-semibold text-sm tracking-wide uppercase">
            Planos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Escolha o plano ideal para o seu negócio.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Comece com o plano que cabe no seu momento e escale quando seu negócio crescer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-amber-500 bg-amber-50/50 shadow-xl scale-[1.03]'
                  : 'border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                  MAIS POPULAR
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href="#contato"
                className={`mt-6 block text-center font-semibold py-3 rounded-lg transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-amber-500 hover:bg-amber-400 text-gray-900 shadow-md'
                    : 'border-2 border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
