import React, { useState, useEffect } from "react";
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

export function Team() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usuariosRaw, setUsuariosRaw] = useState([]); // Lista mestre protegida contra 403
  const [lojas, setLojas] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [metricasMestre, setMetricasMestre] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filtroLoja, setFiltroLoja] = useState("");

  const cargoLogado = user?.cargo?.toUpperCase();
  const isAdmin = cargoLogado === "ADMIN";
  const isSupervisor = cargoLogado === "SUPERVISOR";
  const isVendedor = cargoLogado === "VENDEDOR";

  // Trava de segurança estrutural para o Totem de Balcão (Dispositivo)
  if (cargoLogado === "DISPOSITIVO") {
    return <Navigate to="/registrarvenda" replace />;
  }

  // 1. CARREGA OS DADOS DO BANCO COM COBERTURA ANTIBLOQUEIO 403 (RBAC)
  useEffect(() => {
    const carregarDadosSuporte = async () => {
      try {
        setLoading(true);
        setError("");

        // Todos os cargos têm autorização nativa para ler o histórico de atendimentos do core
        const resAtendimentos = await api.get("/api/core/atendimentos/");
        const listaAtendimentos =
          resAtendimentos.data?.results || resAtendimentos.data || [];
        setAtendimentos(listaAtendimentos);

        // =================================================================
        // ESTRATÉGIA ANTIBLOQUEIO 403 PARA VENDEDORES E SUPERVISORES
        // =================================================================
        if (isVendedor) {
          // VENDEDOR: Só enxerga a si mesmo e consome rotas públicas/core
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
          // SUPERVISOR: Consome rotas do core para métricas para evitar 403
          const resMetricas = await api.get("/api/core/metricas/");
          setMetricasMestre(
            resMetricas.data?.results || resMetricas.data || [],
          );

          try {
            // Tenta buscar da rota administrativa se o Django permitir
            const resUsuarios = await api.get("/api/admin/usuarios/");
            setUsuariosRaw(resUsuarios.data?.results || resUsuarios.data || []);
          } catch (uErr) {
            console.warn(
              "Acesso admin restrito ao Supervisor, aplicando extração via logs do core...",
            );

            // SEGUNDA CAMADA DE PROTEÇÃO: Se der 403, reconstrói o time da loja usando os dados do histórico
            const mapaVendedores = {};
            const idLojaSupervisor = user.loja?.id || user.loja;

            listaAtendimentos.forEach((atend) => {
              const vend = atend.vendedor;
              if (vend && typeof vend === "object" && vend.id) {
                const idLojaVendedor = vend.loja?.id || vend.loja;
                // Só adiciona na lista se o vendedor pertencer à mesma loja do Supervisor
                if (String(idLojaVendedor) === String(idLojaSupervisor)) {
                  mapaVendedores[vend.id] = {
                    id: vend.id,
                    first_name: vend.first_name,
                    last_name: vend.last_name || "",
                    username: vend.username || vend.first_name?.toLowerCase(),
                    email: vend.email || "",
                    cargo: "VENDEDOR",
                    loja: vend.loja,
                    is_active: true,
                  };
                }
              }
            });

            // Inclui o próprio supervisor na lista para ele auditar a si mesmo se necessário
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
          // ADMINISTRADOR GLOBAL: Acesso livre total a todas as rotas admin
          const [resMetricas, resUsuarios, resLojas] = await Promise.all([
            api.get("/api/admin/metricas/"),
            api.get("/api/admin/usuarios/"),
            api.get("/api/admin/lojas/"),
          ]);
          setMetricasMestre(
            resMetricas.data?.results || resMetricas.data || [],
          );
          setUsuariosRaw(resUsuarios.data?.results || resUsuarios.data || []);
          setLojas(resLojas.data?.results || resLojas.data || []);
        }
      } catch (err) {
        console.error("Erro ao processar painel de equipe:", err);
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
    const contaAtiva = u.is_active === true || u.ativo === true;
    if (!contaAtiva) return false;

    // 1. VENDEDOR: Já está travado contendo apenas ele mesmo
    if (isVendedor) return true;

    // 2. SUPERVISOR: Vê apenas os colaboradores da MESMA LOJA que ele está alocado
    if (isSupervisor) {
      const cargoValido =
        u.cargo?.toUpperCase() === "VENDEDOR" ||
        u.cargo?.toUpperCase() === "SUPERVISOR";
      if (!cargoValido) return false;

      const idLojaSupervisor = user?.loja?.id || user?.loja;
      if (idLojaSupervisor) {
        const idLojaVendedor = u.loja?.id || u.loja;
        return String(idLojaVendedor) === String(idLojaSupervisor);
      }
      return false;
    }

    // 3. ADMIN: Visão total segmentada pelo seletor de lojas do topo
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

  // Filtro de texto da barra de busca lateral
  const filteredTeam = vendedoresFiltrados.filter((v) =>
    `${v.first_name || ""} ${v.last_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Auto-seleção inteligente do primeiro registro disponível na lista lateral
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
  // CALCULO DE MÉTRICAS INDIVIDUAIS (TOTAL, CONVERSÃO E GRÁFICO)
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

    const historicoVendedor = atendimentos.filter(
      (a) => String(a.vendedor?.id || a.vendedor) === String(vendedorId),
    );

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
      .map((key) => ({
        name: key,
        quantidade: contagemMetricas[key],
      }))
      .filter((d) => d.quantidade > 0);

    return { totalFaturado, taxaConversao, totalAtendimentos, dadosGrafico };
  };

  const performanceAtual = selectedUser
    ? obterMetricasVendedor(selectedUser.id)
    : null;

  const getSubtituloDinamico = () => {
    if (isAdmin) return "Painel de controle analítico global da rede";
    if (isSupervisor) return "Desempenho comercial focado na sua filial física";
    return "Acompanhamento em tempo real dos seus resultados comerciais";
  };

  if (loading && usuariosRaw.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#4D7BAB]" size={48} />
        <p className="text-slate-500 font-medium">
          Isolando níveis de acesso e computando gráficos...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isVendedor ? "Meus Indicadores" : "Equipe Comercial"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {getSubtituloDinamico()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Dropdown de Lojas: Exclusivo para ADMIN mestre */}
          {isAdmin && (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 w-full sm:w-auto">
              <Store size={20} className="text-[#4D7BAB] ml-2" />
              <select
                className="outline-none bg-transparent font-bold text-slate-600 pr-4 w-full cursor-pointer border-none"
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

          {/* Badge de Contexto de Loja Fixo para o Supervisor */}
          {isSupervisor && user?.loja && (
            <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-[#4D7BAB] rounded-2xl font-bold text-sm border border-blue-100">
              <Store size={18} /> Filial Protegida
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Grid Lateral Mestre-Detalhe */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* COLUNA ESQUERDA: Lista Lateral */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50 flex flex-col h-[650px]">
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
                  : "Buscar colaborador..."
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
                  v.loja_nome || correspondenteLoja?.nome || "Minha Unidade";

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedUser(v)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedUser?.id === v.id
                        ? "border-[#4D7BAB] bg-blue-50/50 shadow-md shadow-blue-100/50"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-base ${
                        selectedUser?.id === v.id
                          ? "bg-[#4D7BAB] text-white"
                          : "bg-slate-100 text-[#4D7BAB]"
                      }`}
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

        {/* COLUNA DIREITA: Painel Gráfico de Performance Segura */}
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50 h-[650px] flex flex-col overflow-hidden">
          {selectedUser && performanceAtual ? (
            <>
              {/* Identificação da Ficha */}
              <div className="flex items-center gap-5 mb-6 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-[#4D7BAB] text-white flex items-center justify-center font-black text-2xl flex-shrink-0">
                  {selectedUser.first_name?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                    {selectedUser.first_name} {selectedUser.last_name || ""}
                  </h2>
                  <p className="text-slate-400 text-sm font-semibold">
                    Usuário: @{selectedUser.username} •{" "}
                    {selectedUser.email || "Sem e-mail cadastrado"}
                  </p>
                </div>
              </div>

              {/* Grid dos Cards de Acumulados Dinâmicos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Dinheiro Faturado */}
                <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1.5 mb-1.5 tracking-wider">
                    <TrendingUp size={14} /> Total Faturado
                  </span>
                  <p className="text-xl font-black text-emerald-700">
                    R$ {performanceAtual.totalFaturado.toFixed(2)}
                  </p>
                </div>

                {/* Taxa de Conversão */}
                <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-100 shadow-sm">
                  <span className="text-[10px] font-black text-[#4D7BAB] uppercase flex items-center gap-1.5 mb-1.5 tracking-wider">
                    <Percent size={14} /> Conversão Comercial
                  </span>
                  <p className="text-xl font-black text-blue-700">
                    {performanceAtual.taxaConversao}%
                  </p>
                </div>

                {/* Atendimentos Totais */}
                <div className="p-5 bg-purple-50/40 rounded-2xl border border-purple-100 shadow-sm">
                  <span className="text-[10px] font-black text-purple-600 uppercase flex items-center gap-1.5 mb-1.5 tracking-wider">
                    <Activity size={14} /> Atendimentos
                  </span>
                  <p className="text-xl font-black text-purple-700">
                    {performanceAtual.totalAtendimentos} logs
                  </p>
                </div>
              </div>

              {/* GRÁFICO DE BARRAS REAL DE INTERAÇÕES COMERCIAIS */}
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
                          dataKey="quantidade"
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
                    Nenhum log operacional de atendimento localizado para este
                    funcionário.
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
                Nenhum colaborador selecionado ou cadastrado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
