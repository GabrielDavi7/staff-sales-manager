import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Download,
  AlertCircle,
  Building2,
  MessageSquareX,
  Calendar,
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

// Função para formatar a data local (YYYY-MM-DD)
const getLocalDataString = (dateObj) => {
  const tzoffset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 10);
};

export function Grafics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de Filtro (Botões de Período)
  const [periodo, setPeriodo] = useState("Hoje");
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [lojasDisponiveis, setLojasDisponiveis] = useState([]);

  // Estados para o intervalo de datas
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const dateInputInicioRef = useRef(null);
  const dateInputFimRef = useRef(null);

  // Estados de Dados
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.cargo?.toUpperCase() === "ADMIN";

  // 1. TRAVA DE SEGURANÇA: Dispositivo não acessa gráficos
  useEffect(() => {
    if (
      user?.cargo === "DISPOSITIVO" &&
      location.pathname.toLowerCase() !== "/registrarvenda"
    ) {
      navigate("/registrarvenda", { replace: true });
    }
  }, [user?.cargo, navigate, location.pathname]);

  // 2. BUSCA A LISTA DE LOJAS (Somente para ADMIN)
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

  // 3. BUSCA DE DADOS NA API COM FILTRO DE PERÍODO
  useEffect(() => {
    if (!user || user?.cargo === "DISPOSITIVO") return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        const hojeStr = getLocalDataString(new Date());

        // Configura as datas com base no botão clicado
        if (periodo === "Especifico") {
          // Se o utilizador preencher ambos ou apenas um dos lados do intervalo
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
        // Se for "Tudo", não envia datas, e o backend traz todo o histórico.

        let endpoint = "";

        if (user?.cargo === "VENDEDOR") {
          endpoint = "/api/analytics/meu-desempenho/";
        } else if (user?.cargo === "SUPERVISOR") {
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
    user?.cargo,
    periodo,
    lojaSelecionada,
    isAdmin,
    dataInicio,
    dataFim,
  ]);

  if (user?.cargo === "DISPOSITIVO") return null;

  // --- PROCESSAMENTO DE DADOS ---
  const totalFaturamento = data?.kpis?.total_vendas_valor || 0;

  const processadoHorario = (data?.grafico_vendas || []).map((gv) => {
    const horaGrafico = gv.hora.substring(0, 2);
    const rendaSomada = (data?.tabela || [])
      .filter((t) => {
        if (!t.venda_fechada) return false;
        const horaTabela = new Date(t.data_hora)
          .getHours()
          .toString()
          .padStart(2, "0");
        return horaTabela === horaGrafico;
      })
      .reduce((acc, curr) => acc + (curr.valor_venda || 0), 0);

    return {
      hora: gv.hora,
      atendimentos: gv.vendas,
      renda: rendaSomada,
    };
  });

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
        <p className="text-slate-500 font-medium">
          Processando gráficos detalhados...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Overlay translúcido de carregamento */}
      {loading && data && (
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] z-20 rounded-3xl flex items-center justify-center">
          <div className="bg-white p-4 rounded-full shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
            <span className="font-bold text-[#4D7BAB]">
              Atualizando Gráficos...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-blue-50">
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-3 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <PieChartIcon size={28} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Gráficos Lojas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Visão:{" "}
              <strong className="uppercase text-[#4D7BAB]">
                {user?.cargo}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center gap-3 w-full xl:w-auto overflow-hidden">
          {/* BOTÕES DE PERÍODO + CALENDÁRIO COMPACTOS */}
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200 w-full xl:w-auto items-center gap-1 overflow-x-auto custom-scrollbar">
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
                    ? "bg-blue-200 text-[#4D7BAB] shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 bg-transparent"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Separador */}
            <div className="w-[1px] h-5 bg-slate-200 mx-1 hidden sm:block shrink-0"></div>

            {/* Input de Calendário: DATA INICIAL */}
            <div
              onClick={() => dateInputInicioRef.current?.showPicker()}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm shrink-0 ${
                periodo === "Especifico" && dataInicio
                  ? "bg-blue-200 text-[#4D7BAB] border-[#4D7BAB]/40 ring-1 ring-[#4D7BAB]/10"
                  : "bg-slate-200 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Calendar
                size={16}
                className={
                  periodo === "Especifico" && dataInicio
                    ? "text-[#4D7BAB]"
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
                className="bg-transparent text-xs font-bold outline-none cursor-pointer w-[110px] text-inherit"
                style={{ WebkitAppearance: "none" }}
                title="Data Inicial"
              />
            </div>

            <span className="text-slate-400 text-[10px] font-bold hidden sm:block shrink-0">
              até
            </span>

            {/* Input de Calendário: DATA FINAL */}
            <div
              onClick={() => dateInputFimRef.current?.showPicker()}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm shrink-0 ${
                periodo === "Especifico" && dataFim
                  ? "bg-blue-200 text-[#4D7BAB] border-[#4D7BAB]/40 ring-1 ring-[#4D7BAB]/10"
                  : "bg-slate-200 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Calendar
                size={16}
                className={
                  periodo === "Especifico" && dataFim
                    ? "text-[#4D7BAB]"
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
                className="bg-transparent text-xs font-bold outline-none cursor-pointer w-[95px] text-inherit"
                style={{ WebkitAppearance: "none" }}
                title="Data Final"
              />
            </div>
          </div>

          {/* SELETOR DE LOJAS COMPACTO (Apenas Admin) */}
          {isAdmin && (
            <div className="relative w-full sm:w-auto shrink-0">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Building2 size={14} />
              </div>
              <select
                value={lojaSelecionada}
                onChange={(e) => setLojaSelecionada(e.target.value)}
                className="pl-8 pr-6 py-2 w-full rounded-2xl text-xs font-bold bg-slate-50 hover:bg-slate-100 border-2 border-slate-100 text-slate-600 focus:outline-none focus:border-[#4D7BAB] transition-all cursor-pointer shadow-sm appearance-none min-w-[140px]"
              >
                <option value="">Todas Lojas</option>
                {lojasDisponiveis
                  .filter((loja) => loja.ativo === true)
                  .map((loja) => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Faturamento (Linha) */}
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
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase">
              Total do Período
            </p>
            <p className="text-3xl font-extrabold text-emerald-600">
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barras e Pizzas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-2xl shadow-blue-100/30">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-[#4D7BAB] rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Fluxo de Clientes
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

        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-2xl shadow-blue-100/30 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquareX size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
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

            <div className="h-[250px] w-full sm:w-1/2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0">
              <h4 className="text-center text-sm font-bold text-slate-500 mb-2 uppercase">
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
