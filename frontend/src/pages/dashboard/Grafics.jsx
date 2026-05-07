import { useState } from "react";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  MessageSquareX,
} from "lucide-react";
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

// Dados Ampliados para a tela de Detalhes
const dataHorario = [
  { hora: "09:00", atendimentos: 2, renda: 1500 },
  { hora: "10:00", atendimentos: 5, renda: 4200 },
  { hora: "11:00", atendimentos: 4, renda: 1800 },
  { hora: "12:00", atendimentos: 2, renda: 0 },
  { hora: "13:00", atendimentos: 6, renda: 5500 },
  { hora: "14:00", atendimentos: 3, renda: 1200 },
  { hora: "15:00", atendimentos: 7, renda: 6800 },
  { hora: "16:00", atendimentos: 4, renda: 2100 },
  { hora: "17:00", atendimentos: 5, renda: 3000 },
];

const dataConversao = [
  { name: "Vendas Fechadas", value: 18, color: "#10b981" }, // Emerald
  { name: "Não Fechadas", value: 7, color: "#f43f5e" }, // Rose
];

const dataMotivos = [
  { name: "Apenas pesquisando", value: 3, color: "#94a3b8" }, // Slate
  { name: "Preço alto", value: 2, color: "#f59e0b" }, // Amber
  { name: "Falta de estoque", value: 2, color: "#0ea5e9" }, // Sky
];

export function Grafics() {
  const [periodo, setPeriodo] = useState("Hoje");

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabeçalho da Página de Relatórios */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 lg:p-8 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <PieChartIcon size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Gráficos Avançados
            </h1>
            <p className="text-base text-slate-500 mt-1">
              Análise detalhada de performance e faturamento.
            </p>
          </div>
        </div>

        {/* Filtros e Ações (Visuais por enquanto) */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl p-1">
            {["Hoje", "7 Dias", "30 Dias"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  periodo === p
                    ? "bg-white text-[#4D7BAB] shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-[#4D7BAB] hover:border-[#4D7BAB] transition-all"
            title="Filtros"
          >
            <Filter size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#4D7BAB] text-white rounded-2xl font-bold hover:bg-[#3a5d82] shadow-lg shadow-blue-900/20 transition-all active:scale-95">
            <Download size={20} />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* 📈 GRÁFICO PRINCIPAL: Faturamento (Ocupa a largura toda) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-2xl shadow-blue-100/30">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Evolução do Faturamento
              </h3>
              <p className="text-sm text-slate-500">
                Renda bruta gerada ao longo do dia
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase">
              Total do Período
            </p>
            <p className="text-3xl font-extrabold text-emerald-600">
              R$ 26.100,00
            </p>
          </div>
        </div>

        {/* Altura aumentada para 400px para visualização detalhada */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataHorario}
              margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="hora"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#64748b" }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#64748b" }}
                tickFormatter={(val) => `R$${val / 1000}k`}
              />
              <Tooltip
                cursor={{
                  stroke: "#cbd5e1",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [
                  `R$ ${value.toLocaleString("pt-BR")}`,
                  "Faturamento",
                ]}
              />
              <Line
                type="monotone"
                dataKey="renda"
                stroke="#10b981"
                strokeWidth={5}
                dot={{ r: 6, fill: "#10b981", strokeWidth: 3, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                name="Renda"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📊 GRID SECUNDÁRIO: Barras e Pizzas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico: Volume de Atendimentos */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-2xl shadow-blue-100/30">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-[#4D7BAB] rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Fluxo de Clientes
              </h3>
              <p className="text-sm text-slate-500">
                Volume de atendimentos por horário
              </p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataHorario}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
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
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="atendimentos"
                  fill="#4D7BAB"
                  radius={[8, 8, 0, 0]}
                  name="Atendimentos"
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico: Taxa de Sucesso vs Perdas */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-2xl shadow-blue-100/30 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquareX size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Conversão e Perdas
              </h3>
              <p className="text-sm text-slate-500">
                Proporção de fechamento e principais objeções
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Pizza 1: Sucesso x Falha */}
            <div className="h-[250px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataConversao}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
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
                    height={30}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Pizza 2: Motivos das Perdas (Bônus) */}
            <div className="h-[250px] w-full sm:w-1/2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0">
              <h4 className="text-center text-sm font-bold text-slate-500 mb-2 uppercase">
                Por que não fecharam?
              </h4>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={dataMotivos}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataMotivos.map((entry, index) => (
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
                    height={20}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Grafics;
