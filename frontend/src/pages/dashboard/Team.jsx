import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  Trophy,
  Target,
  Loader2,
  AlertCircle,
  Store,
  TrendingUp,
  Percent,
  Activity,
  Calendar,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

// Importação dos componentes de gráfico para performance real do vendedor
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// --- FUNÇÃO AUXILIAR PARA FUSO HORÁRIO ---
const getLocalDataString = (dateObj) => {
  const tzoffset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 10);
};

export function Team() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usuariosRaw, setUsuariosRaw] = useState([]); // Lista mestre protegida contra 403
  const [lojas, setLojas] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [metricasMestre, setMetricasMestre] = useState([]);

  // Estados de Filtro
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filtroLoja, setFiltroLoja] = useState("");

  // Estados para o intervalo de datas
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const dateInputInicioRef = useRef(null);
  const dateInputFimRef = useRef(null);

  // Estado para controlar o período do gráfico
  const [periodo, setPeriodo] = useState("30 Dias");

  const cargoLogado = user?.cargo?.toUpperCase();
  const isAdmin = cargoLogado === "ADMIN";
  const isSupervisor = cargoLogado === "SUPERVISOR";
  const isVendedor = cargoLogado === "VENDEDOR";

  // Trava de segurança estrutural para o Totem de Balcão (Dispositivo)
  if (cargoLogado === "DISPOSITIVO") {
    return <Navigate to="/registrarvenda" replace />;
  }

  // CARREGA OS DADOS DO BANCO COM COBERTURA ANTIBLOQUEIO 403 (RBAC)
  useEffect(() => {
    const carregarDadosSuporte = async () => {
      try {
        setLoading(true);
        setError("");

        // =================================================================
        // LOOP DE PAGINAÇÃO PARA O HISTÓRICO DE ATENDIMENTOS
        // O Admin tem muitos registros. Precisamos buscar todas as páginas
        // para que o cálculo gráfico do Frontend não "esqueça" vendas antigas.
        // =================================================================
        let listaAtendimentos = [];
        let urlAtendimentos = "/api/core/atendimentos/";

        while (urlAtendimentos) {
          const resAtendimentos = await api.get(urlAtendimentos);
          const dados =
            resAtendimentos.data?.results || resAtendimentos.data || [];

          if (Array.isArray(dados)) {
            listaAtendimentos = [...listaAtendimentos, ...dados];
          } else {
            listaAtendimentos = dados;
            break;
          }

          if (resAtendimentos.data?.next) {
            // Pega o caminho relativo da próxima página
            urlAtendimentos = resAtendimentos.data.next.substring(
              resAtendimentos.data.next.indexOf("/api/"),
            );
          } else {
            urlAtendimentos = null; // Encerra o laço
          }
        }

        setAtendimentos(listaAtendimentos);

        // =================================================================
        // ESTRATÉGIA ANTIBLOQUEIO 403 PARA VENDEDORES E SUPERVISORES
        // =================================================================
        if (isVendedor) {
          const resMetricas = await api.get("/api/core/metricas/");
          setMetricasMestre(
            resMetricas.data?.results || resMetricas.data || [],
          );

          setUsuariosRaw([
            {
              id: user.id,
              username: user.username,
              email: user.email,
              cargo: user.cargo,
              loja: user.loja,
              first_name: user.first_name || "Meu",
              last_name: user.last_name || "Painel",
              is_active: true,
            },
          ]);
        } else if (isSupervisor) {
          const resMetricas = await api.get("/api/core/metricas/");
          setMetricasMestre(
            resMetricas.data?.results || resMetricas.data || [],
          );

          try {
            // Tenta primeiro a rota pública de vendedores operacionais
            const resVendedores = await api.get("/api/users/vendedores/");
            const dadosProd =
              resVendedores.data?.results || resVendedores.data || [];

            // Normaliza o objeto injetando cargo e ativação se vierem ausentes do Django
            const timeMapeado = dadosProd.map((v) => ({
              ...v,
              cargo: v.cargo || "VENDEDOR",
              is_active: v.is_active !== undefined ? v.is_active : true,
            }));

            // Inclui o próprio supervisor na listagem lateral para autoverificação
            timeMapeado.push({
              id: user.id,
              first_name: user.first_name || "Eu",
              last_name: user.last_name || "(Supervisor)",
              username: user.username,
              email: user.email,
              cargo: "SUPERVISOR",
              loja: user.loja,
              is_active: true,
            });

            setUsuariosRaw(timeMapeado);
          } catch (uErr) {
            console.warn(
              "Acesso admin restrito ao Supervisor, aplicando extração via logs do core...",
            );

            const mapaVendedores = {};
            const idLojaSupervisor = user.loja?.id || user.loja;

            listaAtendimentos.forEach((atend) => {
              let vId = null;
              let fName = "";
              let lName = "";
              let vLoja = atend.loja?.id || atend.loja || atend.loja_id;

              if (atend.vendedor && typeof atend.vendedor === "object") {
                vId = atend.vendedor.id;
                fName = atend.vendedor.first_name || "";
                lName = atend.vendedor.last_name || "";
                if (!vLoja)
                  vLoja = atend.vendedor.loja?.id || atend.vendedor.loja;
              } else if (atend.vendedor_id) {
                vId = atend.vendedor_id;
                fName = atend.vendedor_nome || "Vendedor";
              } else if (atend.vendedor && !isNaN(atend.vendedor)) {
                vId = atend.vendedor;
                if (atend.vendedor_nome) fName = atend.vendedor_nome;
                else if (atend.vendedor__first_name) {
                  fName = atend.vendedor__first_name;
                  lName = atend.vendedor__last_name || "";
                } else {
                  fName = `Vendedor #${vId}`;
                }
              }

              if (vId && String(vLoja) === String(idLojaSupervisor)) {
                mapaVendedores[vId] = {
                  id: vId,
                  first_name: fName,
                  last_name: lName,
                  username: atend.vendedor_username || fName.toLowerCase(),
                  email: atend.vendedor_email || "",
                  cargo: "VENDEDOR",
                  loja: vLoja,
                  is_active: true,
                };
              }
            });

            mapaVendedores[user.id] = {
              id: user.id,
              first_name: user.first_name || "Eu",
              last_name: user.last_name || "(Supervisor)",
              username: user.username,
              email: user.email,
              cargo: "SUPERVISOR",
              loja: user.loja,
              is_active: true,
            };

            setUsuariosRaw(Object.values(mapaVendedores));
          }
        } else if (isAdmin) {
          // 1. Busca as métricas e lojas normalmente
          const [resMetricas, resLojas] = await Promise.all([
            api.get("/api/admin/metricas/"),
            api.get("/api/admin/lojas/"),
          ]);
          setMetricasMestre(
            resMetricas.data?.results || resMetricas.data || [],
          );
          setLojas(resLojas.data?.results || resLojas.data || []);

          // 2. CORREÇÃO: LOOP DE PAGINAÇÃO PARA USUÁRIOS
          let listaUsuarios = [];
          let urlUsuarios = "/api/admin/usuarios/";

          while (urlUsuarios) {
            const resUsuarios = await api.get(urlUsuarios);
            const dados = resUsuarios.data?.results || resUsuarios.data || [];

            if (Array.isArray(dados)) {
              listaUsuarios = [...listaUsuarios, ...dados];
            } else {
              listaUsuarios = dados;
              break;
            }

            if (resUsuarios.data?.next) {
              urlUsuarios = resUsuarios.data.next.substring(
                resUsuarios.data.next.indexOf("/api/"),
              );
            } else {
              urlUsuarios = null;
            }
          }

          setUsuariosRaw(listaUsuarios);
        }
      } catch (err) {
        console.error("Erro ao processar painel de equipa:", err);
        setError(
          "Não foi possível sincronizar os indicadores de performance com o servidor.",
        );
      } finally {
        setLoading(false);
      }
    };

    carregarDadosSuporte();
  }, [isAdmin, isSupervisor, isVendedor, user]);

  // =================================================================
  // REGRAS DE VISUALIZAÇÃO E PRIVACIDADE LATERAL (RBAC)
  // =================================================================
  const vendedoresFiltrados = usuariosRaw.filter((u) => {
    // Caso as propriedades is_active ou ativo não venham descritas, assume true
    const contaAtiva =
      u.is_active === true ||
      u.ativo === true ||
      (u.is_active === undefined && u.ativo === undefined);
    if (!contaAtiva) return false;

    if (isVendedor) return true;

    if (isSupervisor) {
      const cargoValido =
        u.cargo?.toUpperCase() === "VENDEDOR" ||
        u.cargo?.toUpperCase() === "SUPERVISOR";
      if (!cargoValido) return false;

      const idLojaSupervisor = user?.loja?.id || user?.loja;
      const idLojaVendedor = u.loja?.id || u.loja || u.loja_id;

      // Se o endpoint filtrado omitir o ID da loja por redundância, exibe o vendedor na tela
      if (!idLojaVendedor) return true;

      return String(idLojaVendedor) === String(idLojaSupervisor);
    }

    if (isAdmin) {
      const cargoValido =
        u.cargo?.toUpperCase() === "VENDEDOR" ||
        u.cargo?.toUpperCase() === "SUPERVISOR";
      if (!cargoValido) return false;

      if (filtroLoja) {
        const idLojaVendedor = u.loja?.id || u.loja;
        return String(idLojaVendedor) === String(filtroLoja);
      }
      return true;
    }

    return false;
  });

  const filteredTeam = vendedoresFiltrados.filter((v) =>
    `${v.first_name || ""} ${v.last_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (filteredTeam.length > 0 && !selectedUser) {
      setSelectedUser(filteredTeam[0]);
    }
  }, [filteredTeam, selectedUser]);

  useEffect(() => {
    if (selectedUser && !filteredTeam.some((v) => v.id === selectedUser.id)) {
      setSelectedUser(filteredTeam[0] || null);
    }
  }, [filtroLoja, filteredTeam, selectedUser]);

  // =================================================================
  // CÁLCULO DE MÉTRICAS INDIVIDUAIS COM FILTRO DE TEMPO
  // =================================================================
  const obterMetricasVendedor = (vendedorId) => {
    if (!vendedorId || atendimentos.length === 0) {
      return {
        totalFaturado: 0,
        taxaConversao: 0,
        totalAtendimentos: 0,
        dadosGrafico: [],
      };
    }

    let historicoVendedor = atendimentos.filter(
      (a) => String(a.vendedor?.id || a.vendedor) === String(vendedorId),
    );

    // APLICA O FILTRO DE PERÍODO
    if (periodo === "Especifico" && (dataInicio || dataFim)) {
      historicoVendedor = historicoVendedor.filter((a) => {
        if (!a.data_hora) return false;
        const dataVenda = new Date(a.data_hora);
        const vendaStr = getLocalDataString(dataVenda);

        // Se o utilizador preencheu ambas as datas (Intervalo)
        if (dataInicio && dataFim) {
          return vendaStr >= dataInicio && vendaStr <= dataFim;
        }
        // Se preencheu apenas a data de Início (Desta data em diante)
        if (dataInicio && !dataFim) {
          return vendaStr >= dataInicio;
        }
        // Se preencheu apenas a data de Fim (Até esta data)
        if (!dataInicio && dataFim) {
          return vendaStr <= dataFim;
        }
        return true;
      });
    } else if (periodo === "Hoje") {
      const hojeStr = getLocalDataString(new Date());
      historicoVendedor = historicoVendedor.filter((a) => {
        if (!a.data_hora) return false;
        const dataVenda = new Date(a.data_hora);
        const vendaStr = getLocalDataString(dataVenda);
        return vendaStr === hojeStr;
      });
    } else if (periodo === "7 Dias" || periodo === "30 Dias") {
      const dias = periodo === "7 Dias" ? 7 : 30;
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - dias);
      limitDate.setHours(0, 0, 0, 0);
      historicoVendedor = historicoVendedor.filter(
        (a) => new Date(a.data_hora) >= limitDate,
      );
    }
    // Se for "Tudo", não filtra nada e calcula todo o histórico

    const totalAtendimentos = historicoVendedor.length;
    const vendasConcluidas = historicoVendedor.filter(
      (a) => a.venda_fechada === true,
    );

    const totalFaturado = vendasConcluidas.reduce(
      (sum, a) => sum + parseFloat(a.valor_venda || a.valor || 0),
      0,
    );

    const taxaConversao =
      totalAtendimentos > 0
        ? ((vendasConcluidas.length / totalAtendimentos) * 100).toFixed(1)
        : 0;

    const contagemMetricas = {};
    metricasMestre.forEach((m) => {
      contagemMetricas[m.nome] = 0;
    });
    contagemMetricas["Vendas Concluídas"] = vendasConcluidas.length;

    historicoVendedor.forEach((a) => {
      if (!a.venda_fechada) {
        let motivoNome = "Não informada";
        if (a.metrica && typeof a.metrica === "object")
          motivoNome = a.metrica.nome;
        else if (a.metrica_nome) motivoNome = a.metrica_nome;
        else if (a.metrica__nome) motivoNome = a.metrica__nome;
        else if (a.metrica) {
          const correspondente = metricasMestre.find(
            (m) => String(m.id) === String(a.metrica),
          );
          if (correspondente) motivoNome = correspondente.nome;
        }
        contagemMetricas[motivoNome] = (contagemMetricas[motivoNome] || 0) + 1;
      }
    });

    const dadosGrafico = Object.keys(contagemMetricas)
      .map((key) => ({ name: key, quantity: contagemMetricas[key] }))
      .filter((d) => d.quantity > 0);

    return { totalFaturado, taxaConversao, totalAtendimentos, dadosGrafico };
  };

  const performanceAtual = selectedUser
    ? obterMetricasVendedor(selectedUser.id)
    : null;

  const getSubtituloDinamico = () => {
    if (isAdmin) return "Painel de controlo analítico global da rede";
    if (isSupervisor) return "Desempenho comercial focado na sua filial física";
    return "Acompanhamento em tempo real dos seus resultados comerciais";
  };

  if (loading && usuariosRaw.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#4D7BAB]" size={48} />
        <p className="text-slate-500 font-medium">
          A isolar níveis de acesso e computar gráficos...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isVendedor ? "Meus Indicadores" : "Equipa Comercial"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {getSubtituloDinamico()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* BOTÕES DE PERÍODO */}
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto items-center gap-1 overflow-x-auto">
            {["Hoje", "7 Dias", "30 Dias", "Tudo"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriodo(p);
                  setDataInicio(""); // Limpa o calendário inicial
                  setDataFim(""); // Limpa o calendário final
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border-none outline-none whitespace-nowrap ${
                  periodo === p
                    ? "bg-blue-200 text-[#4D7BAB] shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 bg-transparent"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Separador */}
            <div className="w-[1px] h-6 bg-slate-200 mx-2 hidden sm:block"></div>

            {/* Input de Calendário: DATA INICIAL */}
            <div
              onClick={() => dateInputInicioRef.current?.showPicker()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm ${
                periodo === "Especifico" && dataInicio
                  ? "bg-blue-200 text-[#4D7BAB] border-[#4D7BAB]/40 ring-2 ring-[#4D7BAB]/10"
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
                className="bg-transparent text-sm font-bold outline-none cursor-pointer w-full text-inherit"
                style={{ WebkitAppearance: "none" }}
                title="Data Inicial"
              />
            </div>

            <span className="text-slate-400 text-xs font-bold hidden sm:block">
              até
            </span>

            {/* Input de Calendário: DATA FINAL */}
            <div
              onClick={() => dateInputFimRef.current?.showPicker()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm ${
                periodo === "Especifico" && dataFim
                  ? "bg-blue-200 text-[#4D7BAB] border-[#4D7BAB]/40 ring-2 ring-[#4D7BAB]/10"
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
                value={dataFim}
                min={dataInicio} // Impede que o utilizador escolha uma data final anterior à inicial
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setPeriodo("Especifico");
                }}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer w-full text-inherit"
                style={{ WebkitAppearance: "none" }}
                title="Data Final"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* COLUNA ESQUERDA: Lista Lateral */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50 flex flex-col h-[650px]">
          {/* FILTRO DE LOJAS (Reposicionado) */}
          {isAdmin && (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 w-full mb-4">
              <Store size={20} className="text-[#4D7BAB] ml-2 shrink-0" />
              <select
                className="outline-none bg-transparent font-bold text-slate-600 pr-2 w-full cursor-pointer border-none truncate"
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
              >
                <option value="">Todas as Lojas</option>
                {lojas
                  .filter((l) => l.ativo === true)
                  .map((loja) => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* AVISO SUPERVISOR (Reposicionado) */}
          {isSupervisor && user?.loja && (
            <div className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 text-[#4D7BAB] rounded-2xl font-bold text-sm border border-blue-100 w-full mb-4">
              <Store size={18} /> Filial Protegida
            </div>
          )}

          {/* CAMPO DE PESQUISA */}
          <div className="relative mb-6">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              disabled={isVendedor}
              placeholder={
                isVendedor
                  ? "Painel Individual Ativado"
                  : "Procurar colaborador..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#4D7BAB] transition-all font-medium text-slate-700 disabled:opacity-60"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredTeam.length === 0 ? (
              <p className="text-center text-slate-400 mt-10 font-medium text-sm">
                Nenhum colaborador localizado nesta visualização.
              </p>
            ) : (
              filteredTeam.map((v) => {
                const correspondenteLoja = lojas.find(
                  (l) => String(l.id) === String(v.loja?.id || v.loja),
                );
                const nomeDaLoja =
                  v.loja_nome || correspondenteLoja?.nome || "A Minha Unidade";

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedUser(v)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedUser?.id === v.id ? "border-[#4D7BAB] bg-blue-50/50 shadow-md shadow-blue-100/50" : "border-transparent hover:bg-slate-50"}`}
                  >
                    <div
                      className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-base ${selectedUser?.id === v.id ? "bg-[#4D7BAB] text-white" : "bg-slate-100 text-[#4D7BAB]"}`}
                    >
                      {v.first_name?.[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden w-full">
                      <span
                        className={`block font-bold truncate text-sm ${selectedUser?.id === v.id ? "text-[#4D7BAB]" : "text-slate-700"}`}
                      >
                        {v.first_name} {v.last_name || ""}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 block truncate capitalize">
                        {v.cargo?.toLowerCase()} • {nomeDaLoja}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Painel Gráfico */}
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50 h-[650px] flex flex-col overflow-hidden">
          {selectedUser && performanceAtual ? (
            <>
              <div className="flex items-center justify-between gap-5 mb-6 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#4D7BAB] text-white flex items-center justify-center font-black text-2xl flex-shrink-0">
                    {selectedUser.first_name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                      {selectedUser.first_name} {selectedUser.last_name || ""}
                    </h2>
                    <p className="text-slate-400 text-sm font-semibold">
                      Utilizador: @{selectedUser.username} •{" "}
                      {selectedUser.email || "Sem e-mail registado"}
                    </p>
                  </div>
                </div>
                {/* Indica o período selecionado para o utilizador saber o que está a ver */}
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                    Período
                  </span>
                  <span className="text-sm font-bold text-[#4D7BAB]">
                    {periodo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1.5 mb-1.5 tracking-wider">
                    <TrendingUp size={14} /> Total Faturado
                  </span>
                  <p className="text-xl font-black text-emerald-700">
                    R$ {performanceAtual.totalFaturado.toFixed(2)}
                  </p>
                </div>
                <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-100 shadow-sm">
                  <span className="text-[10px] font-black text-[#4D7BAB] uppercase flex items-center gap-1.5 mb-1.5 tracking-wider">
                    <Percent size={14} /> Conversão Comercial
                  </span>
                  <p className="text-xl font-black text-blue-700">
                    {performanceAtual.taxaConversao}%
                  </p>
                </div>
                <div className="p-5 bg-purple-50/40 rounded-2xl border border-purple-100 shadow-sm">
                  <span className="text-[10px] font-black text-purple-600 uppercase flex items-center gap-1.5 mb-1.5 tracking-wider">
                    <Activity size={14} /> Atendimentos
                  </span>
                  <p className="text-xl font-black text-purple-700">
                    {performanceAtual.totalAtendimentos} logs
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-slate-50/50 border border-slate-100 rounded-3xl p-5 overflow-hidden">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" /> Histograma
                  Analítico de Resultados
                </h3>
                {performanceAtual.dadosGrafico.length > 0 ? (
                  <div className="w-full h-full min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceAtual.dadosGrafico}
                        margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#003847",
                            borderRadius: "1rem",
                            border: "none",
                            color: "#fff",
                          }}
                          itemStyle={{ color: "#a8d3b2", fontWeight: "bold" }}
                        />
                        <Bar
                          dataKey="quantity"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={45}
                        >
                          {performanceAtual.dadosGrafico.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === "Vendas Concluídas" ||
                                entry.name === "Concretizada"
                                  ? "#4D7BAB"
                                  : "#822659"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm italic py-10">
                    Não existem registos de atendimento para o período
                    selecionado.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Users
                size={64}
                strokeWidth={1}
                className="mb-4 text-slate-200"
              />
              <p className="font-medium">
                Nenhum colaborador selecionado ou registado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
