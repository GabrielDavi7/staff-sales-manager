import {
  Cloud,
  Lock,
  MonitorSmartphone,
  BarChart2,
  FileSpreadsheet,
  Headset,
} from "lucide-react";

const features = [
  {
    icon: Cloud,
    title: "100% na Nuvem",
    description:
      "Acesse de qualquer lugar, a qualquer momento. Seus dados estão sempre sincronizados e seguros.",
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    icon: BarChart2,
    title: "Dados em Tempo Real",
    description:
      "O vendedor registra na loja e o gráfico do gestor atualiza instantaneamente. Sem atrasos.",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
  {
    icon: MonitorSmartphone,
    title: "Multi-dispositivos",
    description:
      "Interface otimizada para rodar perfeitamente no tablet da loja, no celular ou no computador da diretoria.",
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
  {
    icon: Lock,
    title: "Segurança & Backups",
    description:
      "Infraestrutura moderna com backups automáticos e criptografia de ponta a ponta para proteger seus negócios.",
    color: "text-rose-500",
    bg: "bg-rose-100",
  },
  {
    icon: FileSpreadsheet,
    title: "Exportação de Dados",
    description:
      "Precisa cruzar dados ou enviar para a contabilidade? Exporte tudo para Excel (.xlsx) ou CSV com um clique.",
    color: "text-indigo-500",
    bg: "bg-indigo-100",
  },
  {
    icon: Headset,
    title: "Suporte Humanizado",
    description:
      "Esqueça os robôs. Oferecemos acompanhamento próximo para garantir que sua equipe extraia o máximo do sistema.",
    color: "text-teal-500",
    bg: "bg-teal-100",
  },
];

export default function AboutFeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Parte 1: O "Sobre" */}
        <div className="text-center max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block bg-slate-100 text-slate-600 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Sobre o Joias Manager
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Construído para resolver{" "}
            <span className="text-amber-500">problemas reais.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            Entendemos que o varejo é dinâmico. O Joias Manager nasceu da
            necessidade de eliminar os papéis e planilhas confusas,
            transformando a rotina de vendas em uma operação digital, rastreável
            e orientada a resultados. Você foca em vender, nós cuidamos da
            tecnologia.
          </p>
        </div>

        {/* Parte 2: O Grid de Recursos (Features) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
