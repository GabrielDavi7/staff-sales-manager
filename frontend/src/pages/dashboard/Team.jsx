import { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Trophy,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Dados simulados da equipe (SEM hierarquias)
const TEAM_DATA = [
  {
    id: 1,
    name: "Gabriel Davi",
    avatar: "G",
    totalSales: 45800,
    conversion: 78,
    successVsLoss: [
      { name: "Vendas Fechadas", value: 45, color: "#10b981" },
      { name: "Não Fechadas", value: 12, color: "#f43f5e" },
    ],
    weeklySales: [
      { day: "Seg", vendas: 5 },
      { day: "Ter", vendas: 8 },
      { day: "Qua", vendas: 6 },
      { day: "Qui", vendas: 12 },
      { day: "Sex", vendas: 9 },
      { day: "Sáb", vendas: 15 },
    ],
  },
  {
    id: 2,
    name: "Caio Dias",
    avatar: "C",
    totalSales: 28400,
    conversion: 62,
    successVsLoss: [
      { name: "Vendas Fechadas", value: 31, color: "#10b981" },
      { name: "Não Fechadas", value: 19, color: "#f43f5e" },
    ],
    weeklySales: [
      { day: "Seg", vendas: 3 },
      { day: "Ter", vendas: 5 },
      { day: "Qua", vendas: 4 },
      { day: "Qui", vendas: 7 },
      { day: "Sex", vendas: 6 },
      { day: "Sáb", vendas: 10 },
    ],
  },
  {
    id: 3,
    name: "Pedro Braga",
    avatar: "P",
    totalSales: 12500,
    conversion: 45,
    successVsLoss: [
      { name: "Vendas Fechadas", value: 18, color: "#10b981" },
      { name: "Não Fechadas", value: 22, color: "#f43f5e" },
    ],
    weeklySales: [
      { day: "Seg", vendas: 2 },
      { day: "Ter", vendas: 3 },
      { day: "Qua", vendas: 2 },
      { day: "Qui", vendas: 4 },
      { day: "Sex", vendas: 3 },
      { day: "Sáb", vendas: 6 },
    ],
  },
];

export function Team() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(TEAM_DATA[0]);

  const filteredTeam = TEAM_DATA.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <Users size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Equipe de Vendas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie seus vendedores e analise o desempenho individual.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#4D7BAB] text-white rounded-2xl font-bold hover:bg-[#3a5d82] shadow-lg shadow-blue-900/20 transition-all active:scale-95 w-full md:w-auto justify-center">
          <UserPlus size={20} />
          Novo Vendedor
        </button>
      </div>

      {/* Layout Mestre-Detalhe */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 👈 LADO ESQUERDO: Lista de Funcionários */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/30 border border-blue-50 flex flex-col h-[700px]">
          <div className="relative mb-6 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4D7BAB] transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar vendedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-[#4D7BAB] focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-700 font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {filteredTeam.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedUser.id === user.id
                    ? "border-[#4D7BAB] bg-blue-50/50 shadow-md shadow-blue-100/50"
                    : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${
                      selectedUser.id === user.id
                        ? "bg-[#4D7BAB] text-white"
                        : "bg-slate-100 text-[#4D7BAB]"
                    }`}
                  >
                    {user.avatar}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-lg ${selectedUser.id === user.id ? "text-[#4D7BAB]" : "text-slate-700"}`}
                    >
                      {user.name}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 👉 LADO DIREITO: Painel Detalhado do Funcionário Selecionado */}
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100/40 border border-blue-50 h-[700px] flex flex-col overflow-hidden">
          {/* Header do Perfil Selecionado */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.5rem] bg-[#4D7BAB] text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-blue-900/20">
                {selectedUser.avatar}
              </div>
              <div>
                <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  {selectedUser.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Mini-Cards de Métricas Individuais */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Trophy size={18} />{" "}
                <span className="font-bold text-xs uppercase tracking-wider">
                  Total Vendido
                </span>
              </div>
              <p className="text-3xl font-extrabold text-[#4D7BAB]">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(selectedUser.totalSales)}
              </p>
            </div>
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Target size={18} />{" "}
                <span className="font-bold text-xs uppercase tracking-wider">
                  Taxa de Conversão
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-extrabold text-emerald-500">
                  {selectedUser.conversion}%
                </p>
                <p className="text-sm text-slate-400 mb-1 font-medium">
                  dos clientes compram
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos Individuais */}
          <div className="flex flex-col sm:flex-row gap-6 flex-1 min-h-0">
            {/* Gráfico 1: Pizza de Sucesso do Vendedor */}
            <div className="w-full sm:w-1/2 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                <PieChartIcon size={18} className="text-amber-500" /> Sucesso x
                Perdas
              </h3>
              <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={selectedUser.successVsLoss}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {selectedUser.successVsLoss.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={30}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Barras de Vendas na Semana */}
            <div className="w-full sm:w-1/2 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-[#4D7BAB]" /> Volume na
                Semana
              </h3>
              <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedUser.weeklySales}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="vendas"
                      fill="#4D7BAB"
                      radius={[6, 6, 0, 0]}
                      name="Atendimentos Fechados"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;
