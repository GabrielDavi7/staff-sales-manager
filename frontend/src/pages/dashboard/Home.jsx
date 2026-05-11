import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// ATENÇÃO: Ajuste o caminho do import da sua API/Axios conforme a estrutura da sua pasta
import api from "../../api/axios";
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
  AlertCircle,
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

// Componentes Visuais Isolados
const MetricCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-lg shadow-blue-100/40">
    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
      {title}
    </h3>
    <p className="text-3xl font-extrabold text-[#4D7BAB]">{value}</p>
  </div>
);

const getStatusColors = (status) => {
  if (!status || status === "Venda concretizada")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (
    status.includes("Não") ||
    status.includes("alto") ||
    status.includes("falta")
  )
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

// Gráficos (Mantidos estáticos temporariamente até o backend enviar o "grafico_vendas" populado)
const dataHorario = [
  { hora: "09:00", qtd: 2, renda: 1500 },
  { hora: "10:00", qtd: 4, renda: 3200 },
  { hora: "11:00", qtd: 3, renda: 800 },
  { hora: "13:00", qtd: 5, renda: 4500 },
];
const dataConversao = [
  { name: "Fechadas", value: 12, color: "#10b981" },
  { name: "Perdidas", value: 5, color: "#f43f5e" },
];

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Estados da API
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // 2. Busca de Dados e Controle de Acesso
  useEffect(() => {
    // Bloqueia o tablet de ver o painel gerencial
    if (user?.cargo === "DISPOSITIVO") {
      navigate("/dashboard/registrar", { replace: true });
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Define a URL baseada no cargo
        let endpoint = "";
        if (user?.cargo === "VENDEDOR")
          endpoint = "/api/analytics/meu-desempenho/";
        else if (user?.cargo === "SUPERVISOR")
          endpoint = "/api/analytics/loja/";
        else if (user?.cargo === "ADMIN") endpoint = "/api/analytics/geral/";

        if (!endpoint) throw new Error("Acesso negado: Cargo inválido.");

        const response = await api.get(endpoint);
        setData(response.data);
      } catch (err) {
        setError(
          "Não foi possível carregar os dados. Verifique a conexão com o servidor.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, navigate]);

  // 3. Renderização Condicional (Carregamento e Erro)
  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">
          Carregando painel de métricas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-center gap-4 text-rose-700">
        <AlertCircle size={32} />
        <div>
          <h3 className="font-bold text-lg">Erro na Comunicação</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // 4. Mapeamento do JSON da API para as Variáveis Locais
  const totalValor = data?.kpis?.total_vendas_valor || 0;
  const vendasConcluidas = data?.kpis?.vendas_concluidas_count || 0;
  const vendasPerdidas = data?.kpis?.vendas_nao_concluidas_count || 0;
  const totalAtendimentos = vendasConcluidas + vendasPerdidas;

  const conversionRate =
    totalAtendimentos > 0
      ? Math.round((vendasConcluidas / totalAtendimentos) * 100)
      : 0;

  // Filtro funcionando com a estrutura real da tabela da API
  const tabelaFiltrada = (data?.tabela || []).filter((item) => {
    const nomeCompleto =
      `${item.vendedorfirst_name || ""} ${item.vendedorlast_name || ""}`.toLowerCase();
    const busca = search.toLowerCase();
    return (
      nomeCompleto.includes(busca) ||
      (item.metricanome || "").toLowerCase().includes(busca)
    );
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-lg border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Visão Geral
            </h1>
            <p className="text-sm text-slate-500">
              Perfil de acesso:{" "}
              <strong className="text-primary">{user?.cargo}</strong>
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/registrar"
          className="inline-flex items-center gap-2 bg-[#4D7BAB] text-white hover:bg-[#3a5d82] transition-all px-6 py-3 rounded-2xl font-bold shadow-xl"
        >
          <Plus size={20} /> Novo Atendimento
        </Link>
      </div>

      {/* Cards Lidos da API */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Faturamento do Dia"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalValor)}
        />
        <MetricCard title="Atendimentos Realizados" value={totalAtendimentos} />
        <MetricCard title="Taxa de Conversão" value={`${conversionRate}%`} />
      </div>

      {/* Gráficos (Mantidos estáticos temporariamente) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ... (Todo o seu bloco de gráficos (BarChart3, TrendingUp, PieChart) permanece igual aqui) ... */}
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
                <Bar dataKey="qtd" fill="#4D7BAB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
                  contentStyle={{ borderRadius: "12px", border: "none" }}
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

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
                  contentStyle={{ borderRadius: "12px", border: "none" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "14px", fontWeight: "500" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela Lida da API */}
      <div className="bg-white border border-blue-50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4D7BAB]"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar atendimentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-[#4D7BAB]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-[#4D7BAB]/5">
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase">
                  Data/Hora
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase">
                  Vendedor
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase">
                  Valor
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-600 uppercase text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {tabelaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <Search
                      className="mx-auto mb-4 text-slate-300"
                      size={48}
                      strokeWidth={1.5}
                    />
                    <p className="text-lg font-medium">
                      Nenhum atendimento na base de dados.
                    </p>
                  </td>
                </tr>
              ) : (
                tabelaFiltrada.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        {new Date(row.data_hora).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#4D7BAB] group-hover:bg-[#4D7BAB] group-hover:text-white transition-colors">
                          <User size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {row.vendedorfirst_name} {row.vendedorlast_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-bold text-slate-800">
                      {row.venda_fechada && row.valor_venda ? (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-max border border-emerald-100">
                          <DollarSign size={16} />
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(row.valor_venda)}
                        </div>
                      ) : (
                        <span className="text-slate-300 ml-6">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold border",
                          getStatusColors(row.metricanome),
                        )}
                      >
                        {row.venda_fechada
                          ? "Venda Concretizada"
                          : row.metricanome || "Pendente"}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-[#4D7BAB]">
                          <Eye size={18} />
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
