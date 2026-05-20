import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Filter,
  Edit,
  Loader2,
} from "lucide-react";
import EditarAtendimento from "./EditarAtendimento";

import api from "../../api/axios";

export default function RelatorioAtendimento({ onBack }) {
  const [filtroLoja, setFiltroLoja] = useState("");
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);

  const [lojas, setLojas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [metricas, setMetricas] = useState([]);

  // ESTADO ATUALIZADO PARA PAGINAÇÃO
  const estadoInicialPaginacao = { results: [], next: null, previous: null };
  const [atendimentos, setAtendimentos] = useState(estadoInicialPaginacao);
  const [loading, setLoading] = useState(true);

  // CARREGA OS DADOS MESTRE DO BANCO PARA CRUZAMENTO DE IDENTIFICADORES
  useEffect(() => {
    const carregarDadosSuporte = async () => {
      try {
        const [resLojas, resUsuarios, resMetricas] = await Promise.all([
          api.get("/api/admin/lojas/"),
          api.get("/api/admin/usuarios/"),
          api.get("/api/admin/metricas/"),
        ]);

        const dadosLojas = resLojas.data?.results || resLojas.data || [];

        setLojas(dadosLojas.filter((l) => l.ativo === true));

        setUsuarios(resUsuarios.data?.results || resUsuarios.data || []);
        setMetricas(resMetricas.data?.results || resMetricas.data || []);
      } catch (err) {
        console.error("Erro ao carregar dados mestres de suporte:", err);
      }
    };
    carregarDadosSuporte();
  }, []);

  //CARREGA O HISTÓRICO COMPLETO DE ATENDIMENTOS (PÁGINA 1)
  const formatarPaginacao = (res) => ({
    results: res.data?.results || res.data || [],
    next: res.data?.next || null,
    previous: res.data?.previous || null,
  });

  const fetchAtendimentos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/core/atendimentos/");
      setAtendimentos(formatarPaginacao(response));
    } catch (err) {
      console.error("Erro ao carregar histórico de atendimentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtendimentos();
  }, []);

  // FUNÇÃO PARA NAVEGAR ENTRE AS PÁGINAS DA API
  const carregarPagina = async (urlOriginal) => {
    if (!urlOriginal) return;
    try {
      setLoading(true);
      const urlRelativa = urlOriginal.substring(urlOriginal.indexOf("/api/"));
      const response = await api.get(urlRelativa);
      setAtendimentos(formatarPaginacao(response));
    } catch (err) {
      console.error("Erro ao carregar nova página:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. CAMADA DE FILTRAGEM DEFENSIVA E MULTI-NÍVEL (MUDANÇA DE LOJA EM TEMPO REAL)
  const atendimentosFiltrados = atendimentos.results.filter((item) => {
    if (!filtroLoja) return true; // Se estiver em "Todas as Lojas", mostra tudo

    // Caminho 1: Tenta ler o ID da loja direto do objeto de atendimento
    const lojaIdDireto =
      item.loja?.id || item.loja || item.loja_id || item.loja__id;
    if (lojaIdDireto && String(lojaIdDireto) === String(filtroLoja)) {
      return true;
    }

    // Caminho 2: Se o atendimento não tiver loja direta, cruza com a loja do Vendedor responsável
    const idVendedor = item.vendedor?.id || item.vendedor;
    const vend = usuarios.find((u) => String(u.id) === String(idVendedor));

    if (vend) {
      const lojaIdVendedor = vend.loja?.id || vend.loja || vend.loja_id;
      if (lojaIdVendedor && String(lojaIdVendedor) === String(filtroLoja)) {
        return true;
      }
    }

    return false;
  });

  const handleSalvarEdicao = () => {
    alert("Atendimento atualizado com sucesso!");
    setAtendimentoSelecionado(null);
    fetchAtendimentos(); // Recarrega a listagem atualizada do banco
  };

  if (loading && atendimentos.results.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="animate-spin text-[#3E5641]" size={48} />
        <p className="text-slate-300 font-medium">
          Sincronizando logs de atendimento e dados mestre...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full relative z-10 animate-in slide-in-from-bottom duration-500">
      {!atendimentoSelecionado ? (
        <>
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <ArrowLeft size={20} /> Voltar ao Painel
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#3E5641] rounded-2xl text-white shadow-lg shadow-[#3E5641]/30">
                <FileText size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Relatório de Atendimentos
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Auditoria de performance de vendas e motivos de perda da rede.
                </p>
              </div>
            </div>

            {/* Dropdown com a lista filtrada de Lojas Ativas */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <Filter size={18} className="text-[#a8d3b2]" />
              <select
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer border-none outline-none pr-4 font-bold"
              >
                <option value="" className="bg-[#003847]">
                  Todas as Lojas
                </option>
                {lojas.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#003847]">
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-xl backdrop-blur-md relative">
            {/* Overlay de carregamento ao mudar de página */}
            {loading && atendimentos.results.length > 0 && (
              <div className="absolute inset-0 bg-[#003847]/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#3E5641]" size={40} />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-300 text-sm uppercase tracking-wider">
                    <th className="p-5 font-semibold">Data/Hora</th>
                    <th className="p-5 font-semibold">Cliente</th>
                    <th className="p-5 font-semibold">Vendedor</th>
                    <th className="p-5 font-semibold">Métrica / Status</th>
                    <th className="p-5 font-semibold">Valor</th>
                    <th className="p-5 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {atendimentosFiltrados.map((item) => {
                    // 1. RESOLUÇÃO DO VENDEDOR
                    let nomeVendedor = "Não informado";
                    if (item.vendedor && typeof item.vendedor === "object") {
                      nomeVendedor =
                        `${item.vendedor.first_name || ""} ${item.vendedor.last_name || ""}`.trim();
                    } else if (item.vendedor__first_name) {
                      nomeVendedor =
                        `${item.vendedor__first_name} ${item.vendedor__last_name || ""}`.trim();
                    } else if (item.vendedor_nome) {
                      nomeVendedor = item.vendedor_nome;
                    } else if (item.vendedor) {
                      const correspondente = usuarios.find(
                        (u) => String(u.id) === String(item.vendedor),
                      );
                      if (correspondente) {
                        nomeVendedor =
                          `${correspondente.first_name || ""} ${correspondente.last_name || ""}`.trim();
                      } else {
                        nomeVendedor = `Vendedor ID #${item.vendedor}`;
                      }
                    }

                    // 2. RESOLUÇÃO DA MÉTRICA
                    let statusMetrica = "Não informada";
                    if (item.venda_fechada) {
                      statusMetrica = "Concretizada";
                    } else if (
                      item.metrica &&
                      typeof item.metrica === "object"
                    ) {
                      statusMetrica = item.metrica.nome || "Não informada";
                    } else if (item.metrica__nome) {
                      statusMetrica = item.metrica__nome;
                    } else if (item.metrica_nome) {
                      statusMetrica = item.metrica_nome;
                    } else if (item.metrica) {
                      const correspondente = metricas.find(
                        (m) => String(m.id) === String(item.metrica),
                      );
                      if (correspondente) {
                        statusMetrica = correspondente.nome;
                      } else {
                        statusMetrica = `Métrica ID #${item.metrica}`;
                      }
                    }

                    const valorExibido =
                      item.valor_venda !== undefined
                        ? item.valor_venda
                        : item.valor || 0;
                    const clienteExibido =
                      item.cliente_nome || item.cliente || "Não informado";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-5 text-slate-300 text-sm">
                          {item.data_hora
                            ? new Date(item.data_hora).toLocaleString("pt-BR")
                            : "Sem data"}
                        </td>
                        <td className="p-5 font-medium text-white">
                          {clienteExibido}
                        </td>
                        <td className="p-5 text-slate-300">{nomeVendedor}</td>
                        <td className="p-5 text-slate-300">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                              item.venda_fechada
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {statusMetrica}
                          </span>
                        </td>
                        <td
                          className={`p-5 font-black text-base ${item.venda_fechada ? "text-[#a8d3b2]" : "text-slate-400"}`}
                        >
                          R$ {parseFloat(valorExibido).toFixed(2)}
                        </td>
                        <td className="p-5 text-center">
                          <button
                            type="button"
                            onClick={() => setAtendimentoSelecionado(item)}
                            className="p-2 bg-[#3E5641]/20 text-[#a8d3b2] hover:bg-[#3E5641] hover:text-white rounded-lg transition-colors cursor-pointer border-none inline-flex"
                          >
                            <Edit size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {atendimentosFiltrados.length === 0 && !loading && (
                <p className="text-center text-slate-400 py-12 font-medium">
                  Nenhum registro de atendimento localizado para a loja
                  selecionada.
                </p>
              )}

              {/* Controles de Paginação */}
              {(atendimentos.next || atendimentos.previous) && (
                <div className="flex justify-between items-center p-6 border-t border-white/5 bg-white/5">
                  <button
                    onClick={() => carregarPagina(atendimentos.previous)}
                    disabled={!atendimentos.previous}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-slate-300 font-bold cursor-pointer transition-all hover:bg-white/20"
                  >
                    <ArrowLeft size={18} /> Anterior
                  </button>
                  <button
                    onClick={() => carregarPagina(atendimentos.next)}
                    disabled={!atendimentos.next}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-slate-300 font-bold cursor-pointer transition-all hover:bg-white/20"
                  >
                    Próxima <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <EditarAtendimento
          atendimento={atendimentoSelecionado}
          onSave={handleSalvarEdicao}
          onCancel={() => setAtendimentoSelecionado(null)}
        />
      )}
    </div>
  );
}
