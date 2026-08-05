import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "A definir",
    period: "",
    description: "Para pequenos negócios que querem profissionalizar a gestão.",
    features: [
      "1 loja",
      "Até 10 vendedores",
      "Métricas ilimitadas",
      "Dashboard + exportação CSV",
      "Dispositivo com PIN",
      "Suporte prioritário",
    ],
    highlighted: false,
    cta: "Tenho Interesse",
  },
  {
    name: "Plus",
    price: "A definir",
    period: "",
    description:
      "Para quem está crescendo e precisa gerenciar mais de uma unidade.",
    features: [
      "Até 3 lojas",
      "Vendedores ilimitados",
      "Métricas ilimitadas",
      "Dashboard consolidado",
      "Exportação CSV",
      "Dispositivo por loja",
      "Suporte via WhatsApp",
    ],
    highlighted: true,
    cta: "Tenho Interesse",
  },
  {
    name: "Pro",
    price: "A definir",
    period: "",
    description:
      "Para redes com múltiplas lojas e equipes comerciais completas.",
    features: [
      "Até 5 lojas",
      "Vendedores ilimitados",
      "Métricas ilimitadas",
      "Dashboard consolidado",
      "Exportação CSV + Excel",
      "Dispositivo por loja",
      "Suporte via WhatsApp",
    ],
    highlighted: false,
    cta: "Tenho Interesse",
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description:
      "Solução personalizada para grandes redes, franquias e corporações.",
    features: [
      "Lojas ilimitadas",
      "Vendedores ilimitados",
      "Dashboard por franqueado",
      "API de integração",
      "Treinamento da equipe",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
    highlighted: false,
    cta: "Falar com Consultor",
  },
];

export default function PlansSection() {
  return (
    <section id="planos" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block bg-slate-100 text-slate-600 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Planos & Preços
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Escale <span className="text-amber-500">sem limites.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            Nossos planos estão sendo estruturados para entregar o melhor
            custo-benefício. Demonstre seu interesse hoje.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 ${
                plan.highlighted
                  ? "border-2 border-amber-500 bg-white shadow-2xl shadow-amber-500/10 scale-100 lg:scale-105 z-10"
                  : "border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xl hover:border-slate-300"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  RECOMENDADO
                </div>
              )}

              <h3 className="text-2xl font-extrabold text-slate-900">
                {plan.name}
              </h3>
              <p className="text-sm text-slate-500 mt-2 font-medium min-h-[40px]">
                {plan.description}
              </p>

              <div className="mt-6 mb-8 pb-8 border-b border-slate-200">
                <span className="text-3xl font-black text-slate-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-slate-500 text-sm font-semibold ml-1">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-4 flex-1 mb-8">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-3 text-sm text-slate-700 font-medium"
                  >
                    <Check
                      size={18}
                      strokeWidth={3}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href="#contato"
                className={`mt-auto block text-center font-bold py-3.5 rounded-xl transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/30 hover:scale-[1.02]"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-800"
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
