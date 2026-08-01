import listaAtendimentos from '../../assets/landing/TelaListaDeAtendimentos.png';
import atendimentosPorVendedor from '../../assets/landing/Tela-Visualizaão-Atendimentos-Por-Vendedor.png';
import painelAdmin from '../../assets/landing/Tela-PainelAdministrativoCompleto.png';

const roles = [
  {
    title: 'Vendedor',
    subtitle: 'Sem burocracia. Registro em toques.',
    description:
      'Interface simples para registrar cada atendimento em segundos. ' +
      'Venda fechada? Informa o valor. Não converteu? Seleciona o motivo na lista configurada pelo gestor.',
    img: listaAtendimentos,
    color: 'border-l-emerald-500',
    bgBadge: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Supervisor',
    subtitle: 'Visão tática. Acompanhe o time em tempo real.',
    description:
      'Visualize o desempenho de cada vendedor da sua equipe. ' +
      'Saiba quem está vendendo mais e quais os principais gargalos do dia — tudo ao vivo.',
    img: atendimentosPorVendedor,
    color: 'border-l-blue-500',
    bgBadge: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Administrador',
    subtitle: 'Controle total. Configure o sistema para o seu negócio.',
    description:
      'Painel completo com gráficos consolidados, métricas customizáveis ' +
      'e gestão de lojas e equipes. Tudo que você precisa para tomar decisões baseadas em dados reais.',
    img: painelAdmin,
    color: 'border-l-amber-500',
    bgBadge: 'bg-amber-100 text-amber-700',
  },
];

export default function RolesSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-semibold text-sm tracking-wide uppercase">
            Simplicidade para Cada Perfil
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Um sistema, três visões.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Cada cargo vê exatamente o que precisa. Nada de menus confusos ou funções desnecessárias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.title}
              className={`bg-white rounded-2xl shadow-md border border-gray-200 border-l-4 ${role.color} overflow-hidden hover:shadow-xl transition-shadow duration-300`}
            >
              {/* Imagem */}
              <div className="relative overflow-hidden h-48">
                <img
                  src={role.img}
                  alt={`Tela do ${role.title}`}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>

              {/* Conteúdo */}
              <div className="p-6 pt-2">
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${role.bgBadge}`}>
                  {role.title}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {role.subtitle}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
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
