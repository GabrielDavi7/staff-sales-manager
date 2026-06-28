import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Building2,
  MessageSquareX,
  Calendar,
  Trophy,
  GitCompare,
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

const getLocalDataString = (dateObj) => {
  const tzoffset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 10);
};

// Paleta de cores para o gráfico dinâmico de múltiplas lojas
const CORES_LOJAS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#14b8a6",
  "#6366f1",
  "#84cc16",
  "#eab308",
  "#d946ef",
  "#0ea5e9",
];

export function Grafics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [periodo, setPeriodo] = useState("Hoje");
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [lojasDisponiveis, setLojasDisponiveis] = useState([]);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const dateInputInicioRef = useRef(null);
  const dateInputFimRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargoLogado = user?.cargo?.toUpperCase();
  const isAdmin = cargoLogado === "ADMIN";
  const isSupervisor = cargoLogado === "SUPERVISOR";
  const isVendedor = cargoLogado === "VENDEDOR";

  useEffect(() => {
    if (
      user?.cargo === "DISPOSITIVO" &&
      location.pathname.toLowerCase() !== "/registrarvenda"
    ) {
      navigate("/registrarvenda", { replace: true });
    }
  }, [user?.cargo, navigate, location.pathname]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchLojas = async () => {
      try {
        const response = await api.get("/api/admin/lojas/");
        const listaLojas = response.data.results || response.data;
        setLojasDisponiveis(listaLojas);
      } catch (err) {
        console.error("Erro ao buscar lojas:", err);
      }
    };
    fetchLojas();
  }, [isAdmin]);

  useEffect(() => {
    if (!user || user?.cargo === "DISPOSITIVO") return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        const hojeStr = getLocalDataString(new Date());

        if (periodo === "Especifico") {
          if (dataInicio) params.append("data_inicio", dataInicio);
          if (dataFim) params.append("data_fim", dataFim);
        } else if (periodo === "Hoje") {
          params.append("data_inicio", hojeStr);
          params.append("data_fim", hojeStr);
        } else if (periodo === "7 Dias") {
          const limit = new Date();
          limit.setDate(limit.getDate() - 7);
          params.append("data_inicio", getLocalDataString(limit));
          params.append("data_fim", hojeStr);
        } else if (periodo === "30 Dias") {
          const limit = new Date();
          limit.setDate(limit.getDate() - 30);
          params.append("data_inicio", getLocalDataString(limit));
          params.append("data_fim", hojeStr);
        }

        let endpoint = "";

        if (isVendedor) {
          endpoint = "/api/analytics/meu-desempenho/";
        } else if (isSupervisor) {
          const idLojaSupervisor = user.loja?.id || user.loja;
          endpoint = "/api/analytics/loja/";
          if (idLojaSupervisor) params.append("loja_id", idLojaSupervisor);
        } else if (isAdmin) {
          endpoint = "/api/analytics/geral/";
          if (lojaSelecionada) params.append("loja_id", lojaSelecionada);
        }

        const response = await api.get(`${endpoint}?${params.toString()}`);
        setData(response.data);
      } catch (err) {
        console.error("Erro ao carregar gráficos:", err);
        setError("Não foi possível carregar os dados dos gráficos.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [
    user,
    isVendedor,
    isSupervisor,
    isAdmin,
    periodo,
    lojaSelecionada,
    dataInicio,
    dataFim,
  ]);

  if (user?.cargo === "DISPOSITIVO") return null;

  const totalFaturamento = data?.kpis?.total_vendas_valor || 0;

  // 1. Processamento Global (Linha de faturamento e Barras de fluxo)
  const processadoHorario = useMemo(() => {
    const tabelaBase = data?.tabela || [];
    const agrupado = {};

    tabelaBase.forEach((venda) => {
      if (!venda.venda_fechada || !venda.data_hora) return;
      const horaLocal =
        new Date(venda.data_hora).getHours().toString().padStart(2, "0") +
        ":00";
      if (!agrupado[horaLocal]) {
        agrupado[horaLocal] = { hora: horaLocal, atendimentos: 0, renda: 0 };
      }
      agrupado[horaLocal].atendimentos += 1;
      agrupado[horaLocal].renda += Number(venda.valor_venda || 0);
    });

    return Object.values(agrupado).sort(
      (a, b) => parseInt(a.hora) - parseInt(b.hora),
    );
  }, [data]);

  // 2. Processamento: Comparativo entre Lojas por Hora (Apenas Admin)
  const processadoLojasHorario = useMemo(() => {
    if (!isAdmin) return { dados: [], lojasUnicas: [] };
    const tabelaBase = data?.tabela || [];
    const agrupado = {};
    const setLojas = new Set();

    tabelaBase.forEach((venda) => {
      if (!venda.venda_fechada || !venda.data_hora) return;
      const horaLocal =
        new Date(venda.data_hora).getHours().toString().padStart(2, "0") +
        ":00";
      const nomeLoja = venda.vendedor__loja__nome || "Sem Loja";

      setLojas.add(nomeLoja);

      if (!agrupado[horaLocal]) {
        agrupado[horaLocal] = { hora: horaLocal };
      }
      agrupado[horaLocal][nomeLoja] =
        (agrupado[horaLocal][nomeLoja] || 0) + Number(venda.valor_venda || 0);
    });

    const dados = Object.values(agrupado).sort(
      (a, b) => parseInt(a.hora) - parseInt(b.hora),
    );
    return { dados, lojasUnicas: Array.from(setLojas) };
  }, [data, isAdmin]);

  // 3. Processamento: Ranking de Colaboradores (Admin e Supervisor)
  const processadoRanking = useMemo(() => {
    if (isVendedor) return [];
    const tabelaBase = data?.tabela || [];
    const mapVendedores = {};

    tabelaBase.forEach((venda) => {
      if (!venda.venda_fechada) return;
      const nome =
        `${venda.vendedor__first_name || ""} ${venda.vendedor__last_name || ""}`.trim() ||
        "Colaborador N/A";

      if (!mapVendedores[nome]) {
        mapVendedores[nome] = 0;
      }
      mapVendedores[nome] += Number(venda.valor_venda || 0);
    });

    return Object.keys(mapVendedores)
      .map((nome) => ({ name: nome, faturamento: mapVendedores[nome] }))
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 10); // Mostra o Top 10
  }, [data, isVendedor]);

  // Processamento de Pizzas
  const processadoConversao = [
    {
      name: "Vendas Fechadas",
      value: data?.kpis?.vendas_concluidas_count || 0,
      color: "#10b981",
    },
    {
      name: "Não Fechadas",
      value: data?.kpis?.vendas_nao_concluidas_count || 0,
      color: "#f43f5e",
    },
  ];

  const mapMotivos = {};
  (data?.tabela || []).forEach((t) => {
    if (!t.venda_fechada) {
      const motivo = t.metrica__nome || "Não informado";
      mapMotivos[motivo] = (mapMotivos[motivo] || 0) + 1;
    }
  });

  const coresMotivos = ["#94a3b8", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ec4899"];
  const processadoMotivos = Object.keys(mapMotivos).map((key, index) => ({
    name: key,
    value: mapMotivos[key],
    color: coresMotivos[index % coresMotivos.length],
  }));

  if (loading && !data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Processando gráficos detalhados...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {loading && data && (
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-[2px] z-20 rounded-3xl flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
            <span className="font-bold text-[#4D7BAB] dark:text-blue-400">
              Atualizando Gráficos...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 dark:shadow-none border border-blue-50 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-3 bg-[#4D7BAB]/10 dark:bg-[#4D7BAB]/20 rounded-2xl text-[#4D7BAB] dark:text-blue-400">
            <PieChartIcon size={28} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Gráficos de Performance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visão:{" "}
              <strong className="uppercase text-[#4D7BAB] dark:text-blue-400">
                {user?.cargo}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center gap-3 w-full xl:w-auto overflow-hidden">
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full xl:w-auto items-center gap-1 overflow-x-auto custom-scrollbar">
            {["Hoje", "7 Dias", "30 Dias", "Tudo"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriodo(p);
                  setDataInicio("");
                  setDataFim("");
                }}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer border-none outline-none whitespace-nowrap ${
                  periodo === p
                    ? "bg-blue-200 dark:bg-[#4D7BAB] text-[#4D7BAB] dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 bg-transparent"
                }`}
              >
                {p}
              </button>
            ))}

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block shrink-0"></div>

            <div
              onClick={() => dateInputInicioRef.current?.showPicker()}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm shrink-0 ${
                periodo === "Especifico" && dataInicio
                  ? "bg-blue-200 dark:bg-[#4D7BAB]/30 text-[#4D7BAB] dark:text-blue-400 border-[#4D7BAB]/40 ring-1 ring-[#4D7BAB]/10"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Calendar
                size={16}
                className={
                  periodo === "Especifico" && dataInicio
                    ? "text-[#4D7BAB] dark:text-blue-400"
                    : "text-slate-400"
                }
              />
              <input
                ref={dateInputInicioRef}
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setPeriodo("Especifico");
                }}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer w-[110px] text-inherit dark:[color-scheme:dark]"
                style={{ WebkitAppearance: "none" }}
              />
            </div>

            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold hidden sm:block shrink-0">
              até
            </span>

            <div
              onClick={() => dateInputFimRef.current?.showPicker()}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm shrink-0 ${
                periodo === "Especifico" && dataFim
                  ? "bg-blue-200 dark:bg-[#4D7BAB]/30 text-[#4D7BAB] dark:text-blue-400 border-[#4D7BAB]/40 ring-1 ring-[#4D7BAB]/10"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Calendar
                size={16}
                className={
                  periodo === "Especifico" && dataFim
                    ? "text-[#4D7BAB] dark:text-blue-400"
                    : "text-slate-400"
                }
              />
              <input
                ref={dateInputFimRef}
                type="date"
                min={dataInicio}
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setPeriodo("Especifico");
                }}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer w-[95px] text-inherit dark:[color-scheme:dark]"
                style={{ WebkitAppearance: "none" }}
              />
            </div>
          </div>

          {isAdmin && (
            <div className="relative w-full sm:w-auto shrink-0">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Building2 size={14} />
              </div>
              <select
                value={lojaSelecionada}
                onChange={(e) => setLojaSelecionada(e.target.value)}
                className="pl-8 pr-6 py-2 w-full rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#4D7BAB] dark:focus:border-blue-500 transition-all cursor-pointer shadow-sm appearance-none min-w-[140px] dark:[color-scheme:dark]"
              >
                <option value="" className="bg-white dark:bg-slate-800">
                  Todas Lojas
                </option>
                {lojasDisponiveis
                  .filter((loja) => loja.ativo === true)
                  .map((loja) => (
                    <option
                      key={loja.id}
                      value={loja.id}
                      className="bg-white dark:bg-slate-800"
                    >
                      {loja.nome}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* BLOCO 1: Faturamento Global */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-2xl shadow-blue-100/30 dark:shadow-none transition-colors">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Evolução Global do Faturamento
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase">
              Total do Período
            </p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalFaturamento)}
            </p>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processadoHorario}
              margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700"
              />
              <XAxis
                dataKey="hora"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14 }}
                stroke="currentColor"
                className="text-slate-500 dark:text-slate-400"
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14 }}
                tickFormatter={(val) => `R$${val / 1000}k`}
                stroke="currentColor"
                className="text-slate-500 dark:text-slate-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderRadius: "16px",
                  border: "none",
                  color: "#f8fafc",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)",
                }}
                formatter={(value) => [
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  "Faturamento",
                ]}
              />
              <Line
                type="monotone"
                dataKey="renda"
                name="Faturamento"
                stroke="#10b981"
                strokeWidth={5}
                dot={{ r: 6, fill: "#10b981", strokeWidth: 3, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BLOCO 2: Barras de Atendimento e Pizzas de Motivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-2xl shadow-blue-100/30 dark:shadow-none transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-[#4D7BAB] dark:text-blue-400 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Fluxo de Clientes (Atendimentos)
              </h3>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processadoHorario}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                />
                <XAxis
                  dataKey="hora"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  cursor={{ fill: "currentColor" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "16px",
                    border: "none",
                    color: "#f8fafc",
                  }}
                  className="dark:text-slate-800"
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

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-2xl shadow-blue-100/30 dark:shadow-none flex flex-col transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <MessageSquareX size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Conversão e Perdas
              </h3>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="h-[250px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processadoConversao}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {processadoConversao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                      border: "none",
                      color: "#f8fafc",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "currentColor" }}
                    className="text-slate-600 dark:text-slate-300"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[250px] w-full sm:w-1/2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0">
              <h4 className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                Por que não fecharam?
              </h4>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={processadoMotivos}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {processadoMotivos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                      border: "none",
                      color: "#f8fafc",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={20}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", color: "currentColor" }}
                    className="text-slate-600 dark:text-slate-300"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 3: Comparativo de Lojas (APENAS ADMIN) */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-2xl shadow-blue-100/30 dark:shadow-none transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-[#4D7BAB] dark:text-blue-400 rounded-xl">
              <GitCompare size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Comparativo entre Lojas por Hora
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Volume de faturamento por unidade
              </p>
            </div>
          </div>

          {processadoLojasHorario.dados.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processadoLojasHorario.dados}
                  margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <XAxis
                    dataKey="hora"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14 }}
                    stroke="currentColor"
                    className="text-slate-500 dark:text-slate-400"
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14 }}
                    tickFormatter={(val) => `R$${val / 1000}k`}
                    stroke="currentColor"
                    className="text-slate-500 dark:text-slate-400"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "16px",
                      border: "none",
                      color: "#f8fafc",
                    }}
                    formatter={(value, name) => [
                      `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                      name,
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px", fontSize: "14px" }}
                    className="text-slate-600 dark:text-slate-300"
                  />

                  {processadoLojasHorario.lojasUnicas.map((loja, index) => (
                    <Line
                      key={loja}
                      type="monotone"
                      dataKey={loja}
                      name={loja}
                      stroke={CORES_LOJAS[index % CORES_LOJAS.length]}
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-slate-400 text-sm italic">
              Sem dados para comparar.
            </div>
          )}
        </div>
      )}

      {/* BLOCO 4: Ranking de Colaboradores (ADMIN E SUPERVISOR) */}
      {(isAdmin || isSupervisor) && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-2xl shadow-blue-100/30 dark:shadow-none transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Ranking de Faturamento (Top 10)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isAdmin
                  ? lojaSelecionada
                    ? "Colaboradores da loja selecionada"
                    : "Melhores resultados da rede toda"
                  : "Colaboradores da sua filial"}
              </p>
            </div>
          </div>

          {processadoRanking.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="horizontal" // 1. Mude de 'vertical' para 'horizontal'
                  data={processadoRanking}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                  />

                  {/* 2. O XAxis agora recebe os nomes dos colaboradores */}
                  <XAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: "bold" }}
                    stroke="currentColor"
                    className="text-slate-600 dark:text-slate-300"
                    interval={0} // Garante que todos os nomes apareçam
                    angle={-45} // Inclina o texto para não sobrepor
                    textAnchor="end"
                    height={60}
                  />

                  {/* 3. O YAxis agora recebe os valores numéricos */}
                  <YAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    stroke="currentColor"
                    className="text-slate-500 dark:text-slate-400"
                    tickFormatter={(val) => `R$${val / 1000}k`}
                  />

                  <Tooltip
                    cursor={{ fill: "currentColor" }}
                    className="dark:text-slate-800"
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "16px",
                      border: "none",
                      color: "#f8fafc",
                    }}
                    formatter={(value) => [
                      `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                      "Faturamento",
                    ]}
                  />

                  <Bar
                    dataKey="faturamento"
                    fill="#4D7BAB"
                    radius={[8, 8, 0, 0]} // Arredonda o topo das barras verticais
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-slate-400 text-sm italic">
              Sem dados de vendas para gerar ranking.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Grafics;
