import listaAtendimentos from "../../assets/landing/TelaListaDeAtendimentos.png";
import atendimentosPorVendedor from "../../assets/landing/Tela-Visualizaão-Atendimentos-Por-Vendedor.png";
import painelAdmin from "../../assets/landing/Tela-PainelAdministrativoCompleto.png";

const roles = [
  {
    title: "Vendedor",
    subtitle: "Sem burocracia. Registro em toques.",
    description:
      "Interface simples para registrar cada atendimento em segundos. " +
      "Venda fechada? Informa o valor. Não converteu? Seleciona o motivo na lista configurada pelo gestor.",
    img: listaAtendimentos,
    color: "border-t-emerald-500",
    bgBadge: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Supervisor",
    subtitle: "Visão tática. Acompanhe o time.",
    description:
      "Visualize o desempenho de cada vendedor da sua equipe. " +
      "Saiba quem está vendendo mais e quais os principais gargalos do dia — tudo em tempo real.",
    img: atendimentosPorVendedor,
    color: "border-t-blue-500",
    bgBadge: "bg-blue-100 text-blue-700",
  },
  {
    title: "Administrador",
    subtitle: "Controle total. Decida com dados.",
    description:
      "Painel completo com gráficos consolidados, métricas customizáveis " +
      "e gestão de lojas e equipes. Tudo que você precisa para alavancar os resultados da rede.",
    img: painelAdmin,
    color: "border-t-amber-500",
    bgBadge: "bg-amber-100 text-amber-700",
  },
];

export default function RolesSection() {
  return (
    <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block bg-amber-100 text-amber-700 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Simplicidade e Foco
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Um sistema, <span className="text-amber-500">três visões.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            Cada cargo vê exatamente o que precisa. Nada de menus confusos ou
            funções que não fazem sentido para o dia a dia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className={`bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 border-t-4 ${role.color} overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Imagem (forçando proporção idêntica para os 3 cards) */}
              <div className="relative h-56 bg-slate-100 overflow-hidden border-b border-slate-100">
                <img
                  src={role.img}
                  alt={`Tela do ${role.title}`}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
              </div>

              {/* Conteúdo */}
              <div className="p-8 pt-4">
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider ${role.bgBadge}`}
                >
                  {role.title}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3 leading-tight">
                  {role.subtitle}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
