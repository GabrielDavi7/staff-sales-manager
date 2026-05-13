import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  MessageSquareX,
  AlertCircle,
  Building2,
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

export function Grafics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de Filtro
  const [periodo, setPeriodo] = useState("Hoje");
  const [lojaSelecionada, setLojaSelecionada] = useState(""); // Vazio = Todas as lojas
  const [lojasDisponiveis, setLojasDisponiveis] = useState([]);

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
        // ATENÇÃO: Confirme se essa é a rota real do seu backend para listar as lojas
        const response = await api.get("/api/core/lojas/");
        const listaLojas = response.data.results || response.data;
        setLojasDisponiveis(listaLojas);
      } catch (err) {
        console.error("Erro ao buscar lojas:", err);
      }
    };

    fetchLojas();
  }, [isAdmin]);

  // 3. BUSCA DE DADOS NA API DE ANALYTICS
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
          endpoint = "/api/analytics/loja/";
        } else if (isAdmin) {
          endpoint = "/api/analytics/geral/";
          // Se o admin escolheu uma loja, adiciona o parâmetro na URL
          if (lojaSelecionada) {
            endpoint += `?loja_id=${lojaSelecionada}`; // Ajuste para o nome do parâmetro que seu backend espera (ex: ?loja= ou ?loja_id=)
          }
        }

        const response = await api.get(endpoint);
        setData(response.data);
      } catch (err) {
        console.error("Erro ao carregar gráficos:", err);
        setError("Não foi possível carregar os dados dos gráficos.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, user?.cargo, periodo, lojaSelecionada, isAdmin]);

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

  // --- ESTADOS DE TELA ---
  if (loading) {
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
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Cabeçalho */}
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
              Visão:{" "}
              <strong className="uppercase text-[#4D7BAB]">
                {user?.cargo}
              </strong>
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* FILTRO DE LOJAS - EXCLUSIVO PARA ADMIN */}
          {isAdmin && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Building2 size={16} />
              </div>
              <select
                value={lojaSelecionada}
                onChange={(e) => setLojaSelecionada(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl text-sm font-bold bg-white border-2 border-slate-100 text-slate-600 focus:outline-none focus:border-[#4D7BAB] transition-all cursor-pointer shadow-sm appearance-none min-w-[160px]"
              >
                <option value="">Todas as Lojas</option>
                {lojasDisponiveis.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

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
          <button className="flex items-center gap-2 px-6 py-3 bg-[#4D7BAB] text-white rounded-2xl font-bold hover:bg-[#3a5d82] shadow-lg shadow-blue-900/20 transition-all">
            <Download size={20} />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
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
        {/* Fluxo de Clientes (Barras) */}
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

        {/* Pizzas */}
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
            {/* Pizza 1: Sucesso x Falha */}
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

            {/* Pizza 2: Motivos */}
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
