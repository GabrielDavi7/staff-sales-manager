import React, { useState, useEffect } from "react";
import { ArrowLeft, FileText, Filter, Edit, Loader2 } from "lucide-react";
import EditarAtendimento from "./EditarAtendimento";

// Instância personalizada do Axios do seu projeto
import api from "../../api/axios";

export default function RelatorioAtendimento({ onBack }) {
  const [filtroLoja, setFiltroLoja] = useState("");
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);

  const [lojas, setLojas] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARREGA AS LOJAS PARA O FILTRO DROPDOWN
  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const response = await api.get("/api/admin/lojas/");
        setLojas(response.data?.results || response.data || []);
      } catch (err) {
        console.error("Erro ao carregar lojas no relatório:", err);
      }
    };
    fetchLojas();
  }, []);

  // 2. CARREGA OS ATENDIMENTOS DO BACK-END (REATIVO AO FILTRO DE LOJA)
  const fetchAtendimentos = async () => {
    try {
      setLoading(true);

      // Utiliza o mesmo padrão de parâmetros estruturado no seu arquivo Team.jsx
      const params = filtroLoja ? { params: { loja_id: filtroLoja } } : {};
      const response = await api.get("/api/atendimentos/", params);

      setAtendimentos(response.data?.results || response.data || []);
    } catch (err) {
      console.error("Erro ao carregar histórico de atendimentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtendimentos();
  }, [filtroLoja]);

  // 3. EXECUTA APÓS SALVAR A EDIÇÃO NO SUB-COMPONENTE
  const handleSalvarEdicao = () => {
    alert("Atendimento atualizado com sucesso!");
    setAtendimentoSelecionado(null);
    fetchAtendimentos(); // Recarrega os dados atualizados direto do banco
  };

  if (loading && atendimentos.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="animate-spin text-[#3E5641]" size={48} />
        <p className="text-slate-300 font-medium">
          Sincronizando registros de auditoria...
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
                  Histórico completo de vendas e interações para auditoria.
                </p>
              </div>
            </div>

            {/* Seletor de Filtro de Lojas Dinâmico */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <Filter size={18} className="text-[#a8d3b2]" />
              <select
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer border-none outline-none pr-4"
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

          {/* Tabela de Dados Vinculada ao Django */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-300 text-sm uppercase tracking-wider">
                    <th className="p-5 font-semibold">Data/Hora</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Vendedor</th>
                    <th className="px-5 py-4">Métrica / Status</th>
                    <th className="px-5 py-4">Valor</th>
                    <th className="px-5 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {atendimentos.map((item) => {
                    // Tratamento seguro de renderização dos nomes de relacionamentos do Django
                    const nomeVendedor = item.vendedor__first_name
                      ? `${item.vendedor__first_name} ${item.vendedor__last_name || ""}`.trim()
                      : item.vendedor_nome || "Não informado";

                    const statusMetrica = item.venda_fechada
                      ? "Concretizada"
                      : item.metrica__nome ||
                        item.metrica_nome ||
                        "Não informada";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-5 text-slate-300">
                          {new Date(item.data_hora).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-4 font-medium text-white">
                          {item.cliente_nome || "Não informado"}
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {nomeVendedor}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              item.venda_fechada
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {statusMetrica}
                          </span>
                        </td>
                        <td
                          className={`px-5 py-4 font-bold ${item.venda_fechada ? "text-[#a8d3b2]" : "text-slate-400"}`}
                        >
                          R$ {parseFloat(item.valor_venda || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => setAtendimentoSelecionado(item)}
                            className="p-2 bg-[#3E5641]/20 text-[#a8d3b2] hover:bg-[#3E5641] hover:text-white rounded-lg transition-colors cursor-pointer border-none inline-flex"
                            title="Editar Registro"
                          >
                            <Edit size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {atendimentos.length === 0 && !loading && (
                <p className="text-center text-slate-400 py-12">
                  Nenhum registro de atendimento encontrado para esta seleção.
                </p>
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
