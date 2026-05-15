import {
  Store,
  Users,
  Target,
  TrendingUp,
  Settings,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export default function AdminPainel() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-[#822659]" size={28} />
            <h1 className="text-4xl font-black tracking-tight text-white">
              Centro de Comando
            </h1>
          </div>
          <p className="text-slate-300 font-medium text-lg">
            Visão sistêmica global. Acesso restrito nível Executivo.
          </p>
        </div>

        {/* Botão de Ação Rápida (Cor: Veludo/Plum) */}
        <button className="px-8 py-4 bg-[#822659] hover:bg-[#6a1d47] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#822659]/20 flex items-center gap-2">
          <Settings size={20} />
          Configurações Globais
        </button>
      </div>

      {/* CARDS DE INDICADORES GERAIS (Métricas Fake) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-xl backdrop-blur-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6">
            <Store size={28} />
          </div>
          <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
            Lojas Ativas
          </h3>
          <p className="text-4xl font-extrabold text-white">03</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-xl backdrop-blur-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6">
            <Users size={28} />
          </div>
          <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
            Vendedores Registrados
          </h3>
          <p className="text-4xl font-extrabold text-white">12</p>
        </div>

        {/* Card 3 - Faturamento (Uso do Verde Esmeralda) */}
        <div className="bg-[#3E5641]/20 border border-[#3E5641]/30 p-8 rounded-[2rem] shadow-xl backdrop-blur-sm relative overflow-hidden">
          {/* Efeito visual de fundo */}
          <div className="absolute -right-6 -top-6 text-[#3E5641] opacity-20">
            <TrendingUp size={120} strokeWidth={3} />
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#3E5641] flex items-center justify-center text-white mb-6 shadow-lg shadow-[#3E5641]/30">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-[#a8d3b2] font-bold uppercase tracking-wider text-xs mb-2">
              Faturamento Acumulado (Mês)
            </h3>
            <p className="text-4xl font-extrabold text-white">
              R$ 145.000<span className="text-2xl text-[#a8d3b2]">,00</span>
            </p>
          </div>
        </div>
      </div>

      {/* MÓDULOS DO SISTEMA (Botões de Navegação) */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold text-white mb-6">
          Módulos de Gestão
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Módulo de Métricas */}
          <button className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#822659] p-8 rounded-[2rem] transition-all duration-300">
            <div className="flex justify-between items-start mb-16">
              <div className="p-4 bg-[#822659]/20 group-hover:bg-[#822659] text-[#822659] group-hover:text-white rounded-2xl transition-colors">
                <Target size={32} />
              </div>
              <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Gerenciar Métricas
            </h3>
            <p className="text-slate-400 text-sm">
              Adicione ou desative motivos de perda e configure o funil de
              vendas.
            </p>
          </button>

          {/* Módulo de Lojas */}
          <button className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#822659] p-8 rounded-[2rem] transition-all duration-300">
            <div className="flex justify-between items-start mb-16">
              <div className="p-4 bg-white/5 group-hover:bg-[#822659] text-slate-300 group-hover:text-white rounded-2xl transition-colors">
                <Store size={32} />
              </div>
              <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Gerenciar Lojas
            </h3>
            <p className="text-slate-400 text-sm">
              Cadastre novas unidades, defina metas e supervisione filiais.
            </p>
          </button>

          {/* Módulo de Permissões */}
          <button className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#822659] p-8 rounded-[2rem] transition-all duration-300">
            <div className="flex justify-between items-start mb-16">
              <div className="p-4 bg-white/5 group-hover:bg-[#822659] text-slate-300 group-hover:text-white rounded-2xl transition-colors">
                <Users size={32} />
              </div>
              <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Acessos e Equipe
            </h3>
            <p className="text-slate-400 text-sm">
              Controle cargos, crie supervisores e delegue permissões no
              sistema.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
