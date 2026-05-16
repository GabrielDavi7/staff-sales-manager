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
  X,
  ClipboardCheck,
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
    lower.includes("falta") ||
    lower.includes("caro")
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

  const [selectedAtendimento, setSelectedAtendimento] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. PRIMEIRA TRAVA: Redirecionamento de Dispositivo
  useEffect(() => {
    if (
      user?.cargo === "DISPOSITIVO" &&
      location.pathname.toLowerCase() !== "/registrarvenda"
    ) {
      navigate("/registrarvenda", { replace: true });
    }
  }, [user?.cargo, navigate, location.pathname]);

  // 2. SEGUNDA TRAVA (CRÍTICA): Não renderiza NADA se for dispositivo
  if (user?.cargo === "DISPOSITIVO") {
    return null;
  }

  // 3. BUSCA DE DADOS CORRIGIDA PARA O SUPERVISOR
  useEffect(() => {
    if (!user || user?.cargo === "DISPOSITIVO") return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = "";

        if (user?.cargo === "VENDEDOR") {
          endpoint = "/api/analytics/meu-desempenho/";
        } else if (user?.cargo === "SUPERVISOR") {
          // CORREÇÃO: Envia o ID da loja vinculada ao supervisor para alimentar os KPIs reais da filial
          const idLojaSupervisor = user.loja?.id || user.loja;
          endpoint = idLojaSupervisor
            ? `/api/analytics/loja/?loja_id=${idLojaSupervisor}`
            : "/api/analytics/loja/";
        } else if (user?.cargo === "ADMIN") {
          endpoint = "/api/analytics/geral/";
        }

        const response = await api.get(endpoint);
        setData(response.data);
      } catch (err) {
        setError("Não foi possível carregar as métricas do servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, user?.cargo]);

  // --- LÓGICA DE DADOS (Baseado no JSON real do Django) ---
  const kpis = data?.kpis || {};
  const totalValor = kpis.total_vendas_valor || 0;
  const vendasConcluidas = kpis.vendas_concluidas_count || 0;
  const vendasPerdidas = kpis.vendas_nao_concluidas_count || 0;
  const totalAtendimentos = vendasConcluidas + vendasPerdidas;

  const conversionRate = data?.taxa_conversao
    ? Math.round(data.taxa_conversao)
    : 0;

  const dataConversao = [
    { name: "Fechadas", value: vendasConcluidas, color: "#10b981" },
    { name: "Perdidas", value: vendasPerdidas, color: "#f43f5e" },
  ];

  const dataHorario = data?.grafico_vendas || [];

  const tabelaFiltrada = (data?.tabela || []).filter((item) => {
    const nomeVendedor =
      `${item.vendedor__first_name || ""} ${item.vendedor__last_name || ""}`.toLowerCase();
    const busca = search.toLowerCase();
    return (
      nomeVendedor.includes(busca) ||
      (item.metrica__nome || "").toLowerCase().includes(busca)
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
              <strong className="text-[#4D7BAB] uppercase">
                {user?.cargo}
              </strong>
            </p>
          </div>
        </div>
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
                <Bar dataKey="vendas" fill="#4D7BAB" radius={[4, 4, 0, 0]} />
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
                  dataKey="vendas"
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
                      {new Date(row.data_hora).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#4D7BAB]/10 text-[#4D7BAB] flex items-center justify-center text-xs font-bold">
                          {row.vendedor__first_name?.[0]}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {row.vendedor__first_name} {row.vendedor__last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                      {row.venda_fechada ? (
                        `R$ ${Number(row.valor_venda).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
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
                              : row.metrica__nome,
                          ),
                        )}
                      >
                        {row.venda_fechada
                          ? "Concretizada"
                          : row.metrica__nome || "Não informada"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAtendimento(row);
                          setIsModalOpen(true);
                        }}
                        className="cursor-pointer p-2 hover:bg-blue-50 rounded-full transition-colors text-[#4D7BAB]"
                        title="Visualizar Detalhes"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {isModalOpen && selectedAtendimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100">
            <div className="bg-slate-50 px-10 py-8 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  Detalhes do Atendimento
                </h2>
                <p className="text-base text-slate-500">
                  Informações registradas no sistema
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Vendedor
                  </span>
                  <p className="text-lg font-bold text-slate-700">
                    {selectedAtendimento.vendedor__first_name}{" "}
                    {selectedAtendimento.vendedor__last_name}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Cliente
                  </span>
                  <p className="text-lg font-bold text-slate-700">
                    {selectedAtendimento.cliente_nome || "Não informado"}
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Status da Venda
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedAtendimento.venda_fechada ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                    <span className="text-lg font-extrabold text-slate-700">
                      {selectedAtendimento.venda_fechada
                        ? "Concretizada"
                        : "Não Concretizada"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {selectedAtendimento.venda_fechada ? (
                    <>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 block mb-2">
                        Valor Final
                      </span>
                      <p className="text-4xl font-extrabold text-emerald-600">
                        R${" "}
                        {Number(selectedAtendimento.valor_venda).toLocaleString(
                          "pt-BR",
                          { minimumFractionDigits: 2 },
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold uppercase tracking-widest text-rose-500 block mb-2">
                        Motivo / Métrica
                      </span>
                      <p className="text-xl font-black text-rose-600">
                        {selectedAtendimento.metrica__nome || "N/A"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Observações
                </span>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-base text-slate-600 italic leading-relaxed min-h-[120px]">
                  {selectedAtendimento.observacoes ? (
                    selectedAtendimento.observacoes
                  ) : (
                    <span className="text-slate-300">
                      Nenhuma observação detalhada para este registro.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-12 py-4 bg-[#4D7BAB] text-white text-lg font-bold rounded-2xl hover:bg-[#3a5d82] transition-all shadow-lg active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
