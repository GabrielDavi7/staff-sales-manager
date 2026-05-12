import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  Plus,
  Search,
  LayoutDashboard,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  Eye,
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

// --- COMPONENTES AUXILIARES ---
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
  const lower = status.toLowerCase();
  if (
    lower.includes("não") ||
    lower.includes("alto") ||
    lower.includes("falta")
  )
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // ==========================================
  // 🚧 WORKAROUND: Mapeamento temporário por ID
  // Remover quando o backend retornar user.cargo
  // ==========================================
  const getCargoTemporario = (id) => {
    if (!id) return null;
    if (id === 1) return "ADMIN";
    if (id === 2) return "SUPERVISOR";
    if (id === 3) return "DISPOSITIVO";
    return "VENDEDOR";
  };

  const cargoAtivo = user?.cargo || getCargoTemporario(user?.id);

  // 1. PRIMEIRA TRAVA: Redirecionamento de Dispositivo
  // CORREÇÃO: Apontando para a rota correta /registrarvenda
  useEffect(() => {
    if (
      cargoAtivo === "DISPOSITIVO" &&
      location.pathname.toLowerCase() !== "/registrarvenda"
    ) {
      navigate("/registrarvenda", { replace: true });
    }
  }, [cargoAtivo, navigate, location.pathname]);

  // 2. SEGUNDA TRAVA (CRÍTICA): Não renderiza NADA se for dispositivo
  if (cargoAtivo === "DISPOSITIVO") {
    return null;
  }

  // 3. BUSCA DE DADOS (Só executa para Vendedor, Supervisor e Admin)
  useEffect(() => {
    if (!user || cargoAtivo === "DISPOSITIVO") return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = "";

        if (cargoAtivo === "VENDEDOR")
          endpoint = "/api/analytics/meu-desempenho/";
        else if (cargoAtivo === "SUPERVISOR") endpoint = "/api/analytics/loja/";
        else if (cargoAtivo === "ADMIN") endpoint = "/api/analytics/geral/";

        const response = await api.get(endpoint);
        setData(response.data);
      } catch (err) {
        setError("Não foi possível carregar as métricas do servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, cargoAtivo]);

  // --- LÓGICA DE DADOS ---
  const kpis = data?.kpis || {};
  const totalValor = kpis.total_vendas_valor || 0;
  const vendasConcluidas = kpis.vendas_concluidas_count || 0;
  const vendasPerdidas = kpis.vendas_nao_concluidas_count || 0;
  const totalAtendimentos = vendasConcluidas + vendasPerdidas;
  const conversionRate =
    totalAtendimentos > 0
      ? Math.round((vendasConcluidas / totalAtendimentos) * 100)
      : 0;

  const dataConversao = [
    { name: "Fechadas", value: vendasConcluidas, color: "#10b981" },
    { name: "Perdidas", value: vendasPerdidas, color: "#f43f5e" },
  ];

  const dataHorario = data?.grafico_vendas || [
    { hora: "09:00", qtd: 0, renda: 0 },
    { hora: "12:00", qtd: 0, renda: 0 },
    { hora: "15:00", qtd: 0, renda: 0 },
    { hora: "18:00", qtd: 0, renda: 0 },
  ];

  const tabelaFiltrada = (data?.tabela || []).filter((item) => {
    const nomeVendedor =
      `${item.vendedorfirst_name || ""} ${item.vendedorlast_name || ""}`.toLowerCase();
    const busca = search.toLowerCase();
    return (
      nomeVendedor.includes(busca) ||
      (item.metricanome || "").toLowerCase().includes(busca)
    );
  });

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Sincronizando dados...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-lg border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Painel Gerencial
            </h1>
            <p className="text-sm text-slate-500">
              Acesso:{" "}
              <strong className="text-[#4D7BAB] uppercase">{cargoAtivo}</strong>
            </p>
          </div>
        </div>
        {/* CORREÇÃO: Apontando para a rota correta /registrarvenda */}
        <Link
          to="/registrarvenda"
          className="bg-[#4D7BAB] text-white hover:bg-[#3a5d82] px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Novo Atendimento
        </Link>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Faturamento"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalValor)}
        />
        <MetricCard title="Atendimentos" value={totalAtendimentos} />
        <MetricCard title="Conversão" value={`${conversionRate}%`} />
      </div>

      {/* Área de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-xl">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#4D7BAB]" /> Fluxo de
            Atendimento
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={dataHorario}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="hora"
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="qtd" fill="#4D7BAB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-xl">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" /> Performance
            Financeira
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={dataHorario}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="hora"
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="renda"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-xl">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <PieChartIcon size={18} className="text-amber-500" /> Mix de
            Conversão
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataConversao}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dataConversao.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Listagem de Atendimentos */}
      <div className="bg-white border border-blue-50 rounded-[2rem] shadow-xl overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar vendedor ou motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4D7BAB] outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Venda</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tabelaFiltrada.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                tabelaFiltrada.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(row.data_hora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#4D7BAB]/10 text-[#4D7BAB] flex items-center justify-center text-xs font-bold">
                          {row.vendedorfirst_name?.[0]}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {row.vendedorfirst_name} {row.vendedorlast_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                      {row.venda_fechada ? (
                        `R$ ${row.valor_venda}`
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          "px-3 py-1 rounded-full text-[10px] font-bold border uppercase",
                          getStatusColors(
                            row.venda_fechada
                              ? "Venda concretizada"
                              : row.metricanome,
                          ),
                        )}
                      >
                        {row.venda_fechada
                          ? "Concretizada"
                          : row.metricanome || "Não informada"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-[#4D7BAB] transition-colors">
                        <Eye size={18} />
                      </button>
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
