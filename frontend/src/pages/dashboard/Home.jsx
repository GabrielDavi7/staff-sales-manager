import { useState, useEffect, useRef, useMemo } from "react";
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
  ArrowLeft,
  ArrowRight,
  Calendar,
  Building2,
  FileDown,
  FileSpreadsheet,
  FileText,
  Store,
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

// --- COMPONENTE DO MODAL DE EXPORTAÇÃO ---
export function ExportModal({ isOpen, onClose, onExport, lojasDisponiveis }) {
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const dateInicioRef = useRef(null);
  const dateFimRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Cabeçalho */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-10 py-8 border-b dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              Exportar Relatório
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Selecione a loja, o formato e o período
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer border-none outline-none"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {/* Seleção de Loja */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-4">
              Loja (Obrigatório)
            </span>
            <div className="relative">
              <Store
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <select
                value={lojaSelecionada}
                onChange={(e) => setLojaSelecionada(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#4D7BAB] dark:text-white text-slate-700 font-bold cursor-pointer appearance-none transition-colors"
              >
                <option value="">Selecione uma loja...</option>
                {lojasDisponiveis
                  .filter((loja) => loja.ativo === true)
                  .map((loja) => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Período da Exportação */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-4">
              Período da Exportação (Obrigatório)
            </span>
            <div className="grid md:grid-cols-2 gap-4">
              <div
                onClick={() => dateInicioRef.current?.showPicker()}
                className="flex items-center gap-3 p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              >
                <Calendar
                  size={18}
                  className="text-slate-400 dark:text-slate-500"
                />
                <input
                  ref={dateInicioRef}
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer w-full text-slate-700 dark:text-slate-200 dark:[color-scheme:dark]"
                />
              </div>

              <div
                onClick={() => dateFimRef.current?.showPicker()}
                className="flex items-center gap-3 p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              >
                <Calendar
                  size={18}
                  className="text-slate-400 dark:text-slate-500"
                />
                <input
                  ref={dateFimRef}
                  type="date"
                  min={dataInicio}
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer w-full text-slate-700 dark:text-slate-200 dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Formato */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-4">
              Formato
            </span>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat("xlsx")}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 cursor-pointer ${
                  exportFormat === "xlsx"
                    ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <FileSpreadsheet size={24} /> Excel (.xlsx)
              </button>
              <button
                onClick={() => setExportFormat("csv")}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 cursor-pointer ${
                  exportFormat === "csv"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <FileText size={24} /> CSV (.csv)
              </button>
            </div>
          </div>
        </div>
        {/* Rodapé */}
        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/80 border-t dark:border-slate-800 flex justify-end gap-4 transition-colors">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              const lojaObj = lojasDisponiveis.find(
                (l) => String(l.id) === String(lojaSelecionada),
              );
              onExport(
                exportFormat,
                lojaSelecionada,
                lojaObj?.nome || "",
                dataInicio,
                dataFim,
              );
            }}
            disabled={!lojaSelecionada || !dataInicio || !dataFim}
            className="px-10 py-3 bg-[#4D7BAB] dark:bg-blue-600 text-white font-bold rounded-2xl hover:bg-[#3a5d82] dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer border-none outline-none"
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---
const MetricCard = ({ title, value }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-blue-50 dark:border-slate-800 shadow-lg shadow-blue-100/40 dark:shadow-none transition-colors">
    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
      {title}
    </h3>
    <p className="text-3xl font-extrabold text-[#4D7BAB] dark:text-blue-400">
      {value}
    </p>
  </div>
);

const getStatusColors = (status) => {
  if (!status || status === "Venda concretizada")
    return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
  const lower = status.toLowerCase();
  if (
    lower.includes("não") ||
    lower.includes("alto") ||
    lower.includes("falta") ||
    lower.includes("caro")
  )
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
  return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
};

const getLocalDataString = (dateObj) => {
  const tzoffset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 10);
};

// --- FUNÇÃO PRINCIPAL ---
export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.cargo?.toUpperCase() === "ADMIN";

  const [periodo, setPeriodo] = useState("Hoje");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const dateInputInicioRef = useRef(null);
  const dateInputFimRef = useRef(null);

  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [lojasDisponiveis, setLojasDisponiveis] = useState([]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedAtendimento, setSelectedAtendimento] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, periodo, lojaSelecionada]);

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
        setError("Não foi possível carregar as métricas do servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [
    user,
    user?.cargo,
    periodo,
    dataInicio,
    dataFim,
    lojaSelecionada,
    isAdmin,
  ]);

  if (user?.cargo === "DISPOSITIVO") return null;

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

  const dataHorarioProcessado = useMemo(() => {
    const tabelaBase = data?.tabela || [];
    const agrupado = {};

    tabelaBase.forEach((venda) => {
      if (!venda.venda_fechada || !venda.data_hora) return;
      const horaLocal =
        new Date(venda.data_hora).getHours().toString().padStart(2, "0") +
        ":00";

      if (!agrupado[horaLocal]) {
        agrupado[horaLocal] = { hora: horaLocal, vendas: 0, renda: 0 };
      }

      agrupado[horaLocal].vendas += 1;
      agrupado[horaLocal].renda += Number(venda.valor_venda || 0);
    });

    return Object.values(agrupado).sort(
      (a, b) => parseInt(a.hora) - parseInt(b.hora),
    );
  }, [data]);

  const removeAcentos = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const tabelaFiltrada = (data?.tabela || []).filter((item) => {
    const nomeVendedor =
      `${item.vendedor__first_name || ""} ${item.vendedor__last_name || ""}`.toLowerCase();
    const nomeCliente = (item.cliente_nome || "").toLowerCase();
    const nomeLoja = (item.vendedor__loja__nome || "").toLowerCase();
    const statusReal = item.venda_fechada
      ? "concretizada"
      : (item.metrica__nome || "não informada").toLowerCase();
    const buscaLimpa = removeAcentos(search.toLowerCase());

    return (
      removeAcentos(nomeVendedor).includes(buscaLimpa) ||
      removeAcentos(nomeCliente).includes(buscaLimpa) ||
      removeAcentos(nomeLoja).includes(buscaLimpa) ||
      removeAcentos(statusReal).includes(buscaLimpa)
    );
  });

  const totalPages = Math.ceil(tabelaFiltrada.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tabelaFiltrada.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  if (loading && !data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Sincronizando dados...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500 relative">
      {loading && data && (
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-[2px] z-20 rounded-3xl flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
            <span className="font-bold text-[#4D7BAB] dark:text-blue-400">
              Atualizando...
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-blue-50 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-3 bg-[#4D7BAB]/10 dark:bg-[#4D7BAB]/20 rounded-2xl text-[#4D7BAB] dark:text-blue-400">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Painel Gerencial
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Acesso:{" "}
              <strong className="text-[#4D7BAB] dark:text-blue-400 uppercase">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none outline-none whitespace-nowrap ${
                  periodo === p
                    ? "bg-blue-200 dark:bg-[#4D7BAB] text-[#4D7BAB] dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 bg-transparent"
                }`}
              >
                {p}
              </button>
            ))}

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block shrink-0"></div>

            {/* Input Data Início */}
            <div
              onClick={() => dateInputInicioRef.current?.showPicker()}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm shrink-0 ${
                periodo === "Especifico" && dataInicio
                  ? "bg-blue-200 dark:bg-[#4D7BAB]/30 text-[#4D7BAB] dark:text-blue-400 border-[#4D7BAB]/40 ring-1 ring-[#4D7BAB]/10"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Calendar
                size={14}
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
                className="bg-transparent text-xs font-bold outline-none cursor-pointer w-[95px] text-inherit dark:[color-scheme:dark]"
                style={{ WebkitAppearance: "none" }}
              />
            </div>

            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold hidden sm:block shrink-0">
              até
            </span>

            {/* Input Data Fim */}
            <div
              onClick={() => dateInputFimRef.current?.showPicker()}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm shrink-0 ${
                periodo === "Especifico" && dataFim
                  ? "bg-blue-200 dark:bg-[#4D7BAB]/30 text-[#4D7BAB] dark:text-blue-400 border-[#4D7BAB]/40 ring-1 ring-[#4D7BAB]/10"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Calendar
                size={14}
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
                className="pl-8 pr-6 py-2 w-full rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#4D7BAB] dark:focus:border-blue-500 transition-all cursor-pointer shadow-sm appearance-none min-w-[140px]"
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

          <Link
            to="/registrarvenda"
            className="bg-[#4D7BAB] text-white hover:bg-[#3a5d82] dark:hover:bg-blue-600 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all w-full sm:w-auto justify-center shrink-0"
          >
            <Plus size={18} /> Novo
          </Link>
        </div>
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-blue-50 dark:border-slate-800 shadow-xl transition-colors">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
            <BarChart3
              size={18}
              className="text-[#4D7BAB] dark:text-blue-400"
            />{" "}
            Fluxo de Atendimento
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={dataHorarioProcessado}>
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
                  style={{ fontSize: "12px" }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "12px" }}
                  allowDecimals={false}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  cursor={{ fill: "currentColor" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#f8fafc",
                  }}
                  className="dark:text-slate-800"
                />
                <Bar dataKey="vendas" fill="#4D7BAB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-blue-50 dark:border-slate-800 shadow-xl transition-colors">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" /> Performance
            Financeira
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={dataHorarioProcessado}>
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
                  style={{ fontSize: "12px" }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "12px" }}
                  tickFormatter={(val) => `R$${val}`}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#f8fafc",
                  }}
                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Valor Vendido",
                  ]}
                />
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

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-blue-50 dark:border-slate-800 shadow-xl transition-colors">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
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
                  height={36}
                  wrapperStyle={{ color: "currentColor" }}
                  className="text-slate-600 dark:text-slate-300"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Listagem de Atendimentos */}
      <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden transition-colors">
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar cliente, loja, vendedor ou motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-[#4D7BAB] outline-none transition-all"
            />
          </div>
          {/* Botão de Exportação */}
          {isAdmin && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 bg-[#4D7BAB] bg-[#4D7BAB] text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg hover:bg-[#3a5d82] dark:hover:bg-blue-600 transition-all w-full sm:w-auto justify-center cursor-pointer border-none outline-none shrink-0"
            >
              <FileDown size={18} /> Exportar Dados
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Loja</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Venda</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                currentItems.map((row) => {
                  const nomeDaLoja = row.vendedor__loja__nome;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(row.data_hora).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#4D7BAB]/10 dark:bg-[#4D7BAB]/20 text-[#4D7BAB] dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {row.vendedor__first_name?.[0]}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {row.vendedor__first_name} {row.vendedor__last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {nomeDaLoja ? (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Building2
                              size={14}
                              className="text-[#4D7BAB] dark:text-blue-400 opacity-70"
                            />{" "}
                            {nomeDaLoja}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-normal text-xs">
                            Sem loja alocada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {row.cliente_nome ? (
                          row.cliente_nome
                        ) : (
                          <span className="text-slate-400 italic font-normal">
                            Não informado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-sm">
                        {row.venda_fechada ? (
                          `R$ ${Number(row.valor_venda).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            "px-3 py-1 rounded-full text-[10px] font-bold border uppercase whitespace-nowrap",
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
                          className="cursor-pointer p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors text-[#4D7BAB] dark:text-blue-400"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-slate-500 dark:text-slate-400 font-bold cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-center"
            >
              <ArrowLeft size={18} /> Anterior
            </button>
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-full pb-1 sm:pb-0">
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-slate-400 font-bold"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
                      currentPage === page
                        ? "bg-[#4D7BAB] text-white shadow-md shadow-blue-500/20 border-none"
                        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-slate-500 dark:text-slate-400 font-bold cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-center"
            >
              Próxima <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={async (format, lojaId, nomeLoja, exportStart, exportEnd) => {
          try {
            const params = new URLSearchParams();
            params.set("loja_id", lojaId);
            if (exportStart) params.set("data_inicio", exportStart);
            if (exportEnd) params.set("data_fim", exportEnd);

            // 1. Fazemos a chamada segura pelo Axios (com baseURL e Token inclusos)
            const response = await api.get(
              `/api/analytics/exportar-${format}/?${params.toString()}`,
              { responseType: "blob" }, // Avisa que receberá um arquivo binário
            );

            // FUNÇÃO DE FORMATAÇÃO: Remove acentos, caracteres especiais e troca espaços por _
            const formatarNomeArquivo = (nome) => {
              if (!nome) return `loja_${lojaId}`;
              return nome
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9\s_-]/g, "")
                .trim()
                .replace(/\s+/g, "_")
                .replace(/-+/g, "_");
            };

            const lojaFormatada = formatarNomeArquivo(nomeLoja);
            const dataInicioFormatada = exportStart
              ? exportStart.replace(/-/g, "")
              : "";
            const dataFimFormatada = exportEnd
              ? exportEnd.replace(/-/g, "")
              : "";

            // 2. Cria o arquivo na memória do navegador e força o download automático
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Nome formatado bonitinho
            link.download = `relatorio_${lojaFormatada}_${dataInicioFormatada}_a_${dataFimFormatada}.${format}`;

            document.body.appendChild(link);
            link.click();

            // 3. Limpa os elementos da memória
            link.remove();
            window.URL.revokeObjectURL(url);

            // 4. Fecha o modal de exportação
            setIsExportModalOpen(false);
          } catch (err) {
            console.error("Erro ao executar a exportação no frontend:", err);
          }
        }}
        lojasDisponiveis={lojasDisponiveis}
      />

      {/* Modal de Detalhes */}
      {isModalOpen && selectedAtendimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="bg-slate-50 dark:bg-slate-800/80 px-10 py-8 border-b dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  Detalhes do Atendimento
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  Informações registradas no sistema
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer border-none outline-none"
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
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {selectedAtendimento.vendedor__first_name}{" "}
                    {selectedAtendimento.vendedor__last_name}
                  </p>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Building2 size={12} />
                    {selectedAtendimento.vendedor__loja__nome ||
                      "Sem loja alocada"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Cliente
                  </span>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {selectedAtendimento.cliente_nome || "Não informado"}
                  </p>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Status da Venda
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedAtendimento.venda_fechada ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                    <span className="text-lg font-extrabold text-slate-700 dark:text-slate-200">
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
                      <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
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
                      <p className="text-xl font-black text-rose-600 dark:text-rose-400">
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
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-base text-slate-600 dark:text-slate-400 italic leading-relaxed min-h-[120px]">
                  {selectedAtendimento.observacoes ? (
                    selectedAtendimento.observacoes
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600">
                      Nenhuma observação detalhada para este registro.
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/80 border-t dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-12 py-4 bg-[#4D7BAB] text-white text-lg font-bold rounded-2xl hover:bg-[#3a5d82] dark:hover:bg-blue-600 transition-all shadow-lg active:scale-95 cursor-pointer border-none outline-none"
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

export default Home;
