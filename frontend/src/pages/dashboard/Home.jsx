import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Clock,
  User,
  DollarSign,
  MessageSquare,
  Eye,
  Pencil,
  Trash2,
  LayoutDashboard,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import { clsx } from "clsx";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

// 1. Componente de Cartão de Métrica
const MetricCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-lg shadow-blue-100/40 hover:shadow-blue-200/50 transition-shadow">
    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
      {title}
    </h3>
    <p className="text-3xl font-extrabold text-[#4D7BAB]">{value}</p>
  </div>
);

// 2. Função de Cores dos Status
const getStatusColors = (status) => {
  if (status === "Venda concretizada")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (
    status.includes("Não") ||
    status.includes("alto") ||
    status.includes("falta")
  )
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

// 3. Dados Simulados para os Gráficos
const dataHorario = [
  { hora: "09:00", qtd: 2, renda: 1500 },
  { hora: "10:00", qtd: 4, renda: 3200 },
  { hora: "11:00", qtd: 3, renda: 800 },
  { hora: "12:00", qtd: 1, renda: 0 },
  { hora: "13:00", qtd: 5, renda: 4500 },
  { hora: "14:00", qtd: 2, renda: 1200 },
];

const dataConversao = [
  { name: "Fechadas", value: 12, color: "#10b981" }, // emerald-500
  { name: "Perdidas", value: 5, color: "#f43f5e" }, // rose-500
];

export function Home() {
  const [search, setSearch] = useState("");

  // Dados de Teste da Tabela
  const [attendances, setAttendances] = useState([
    {
      id: 1,
      time: "10:30",
      salesperson: "Gabriel Davi",
      client: "Maria Antonieta",
      value: 1250.0,
      status: "Venda concretizada",
      observations: "Comprou alianças de ouro.",
    },
    {
      id: 2,
      time: "11:15",
      salesperson: "Caio Dias",
      client: "João Pedro",
      value: 0,
      status: "Apenas pesquisando",
      observations: "Olhando relógios, volta mês que vem.",
    },
    {
      id: 3,
      time: "14:20",
      salesperson: "Pedro Braga",
      client: "Ana Silva",
      value: 0,
      status: "Preço alto",
      observations: "",
    },
  ]);

  const deleteAttendance = (id) => {
    setAttendances(attendances.filter((a) => a.id !== id));
  };

  const filteredData = attendances.filter(
    (item) =>
      item.client.toLowerCase().includes(search.toLowerCase()) ||
      item.salesperson.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase()),
  );

  const totalValue = filteredData.reduce(
    (acc, curr) => acc + (curr.value || 0),
    0,
  );

  const conversionRate =
    filteredData.length > 0
      ? Math.round(
          (filteredData.filter((d) => d.status === "Venda concretizada")
            .length /
            filteredData.length) *
            100,
        )
      : 0;

  const handleDelete = (id, clientName) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o atendimento de ${clientName}?`,
      )
    ) {
      deleteAttendance(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-lg shadow-blue-100/40 border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Visão Geral
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhe os atendimentos e a performance do dia.
            </p>
          </div>
        </div>
        <Link
          to="/registrar"
          className="inline-flex items-center justify-center gap-2 bg-[#4D7BAB] text-white hover:bg-[#3a5d82] transition-all px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-blue-900/10 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={20} />
          Novo Atendimento
        </Link>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Total em Vendas (Dia)"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalValue)}
        />
        <MetricCard title="Total de Atendimentos" value={filteredData.length} />
        <MetricCard title="Taxa de Conversão" value={`${conversionRate}%`} />
      </div>

      {/* 📊 NOVA SEÇÃO DE GRÁFICOS 📊 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Quantidade por Horário (BarChart) */}
        <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-100/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-[#4D7BAB] rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Atendimentos por Hora</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataHorario}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="hora"
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
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="qtd"
                  fill="#4D7BAB"
                  radius={[6, 6, 0, 0]}
                  name="Atendimentos"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Renda por Horário (LineChart) */}
        <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-100/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Renda por Hora (R$)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dataHorario}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="hora"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={(val) => `R$${val / 1000}k`}
                />
                <Tooltip
                  cursor={{
                    stroke: "#cbd5e1",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [`R$ ${value}`, "Renda"]}
                />
                <Line
                  type="monotone"
                  dataKey="renda"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{
                    r: 4,
                    fill: "#10b981",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                  name="Renda"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Pizza de Conversão */}
        <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-100/40">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <PieChartIcon size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Taxa de Sucesso</h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataConversao}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dataConversao.map((entry, index) => (
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
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#475569",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Área da Tabela */}
      <div className="bg-white border border-blue-50 rounded-[2rem] shadow-2xl shadow-blue-100/50 overflow-hidden flex flex-col">
        {/* Filtros */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4D7BAB] transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por cliente, vendedor ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-[#4D7BAB] focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 font-medium text-slate-700 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:border-[#4D7BAB] hover:text-[#4D7BAB] hover:bg-blue-50/50 transition-all w-full sm:w-auto justify-center shadow-sm">
            <Filter size={18} />
            Filtros
            <ChevronDown size={16} className="ml-1 opacity-70" />
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-[#4D7BAB]/5">
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider w-[80px]">
                  Hora
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[150px]">
                  Vendedor
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[160px]">
                  Cliente
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[130px]">
                  Valor
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[200px]">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Observação
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider text-right w-[120px]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Search
                      className="mx-auto mb-4 text-slate-300"
                      size={48}
                      strokeWidth={1.5}
                    />
                    <p className="text-lg font-medium">
                      Nenhum atendimento encontrado.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        {row.time}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[#4D7BAB] group-hover:bg-[#4D7BAB] group-hover:text-white transition-colors">
                          <User size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {row.salesperson}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-700 font-semibold">
                      {row.client}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-bold text-slate-800">
                      {row.value && row.value > 0 ? (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-max border border-emerald-100">
                          <DollarSign size={16} />
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(row.value)}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-normal ml-6">
                          -
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold border shadow-sm",
                          getStatusColors(row.status),
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 max-w-[250px]">
                      <div className="flex items-start gap-2">
                        <MessageSquare
                          size={16}
                          className="text-slate-400 shrink-0 mt-0.5"
                        />
                        <span
                          className="truncate group-hover:whitespace-normal transition-all"
                          title={row.observations}
                        >
                          {row.observations || (
                            <span className="text-slate-300 italic">
                              Sem observações
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/atendimento/${row.id}`}
                          className="p-2 text-slate-400 hover:text-[#4D7BAB] hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/editar-atendimento/${row.id}`}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(row.id, row.client)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
