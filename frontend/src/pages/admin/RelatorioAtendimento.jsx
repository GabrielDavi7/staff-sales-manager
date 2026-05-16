import React, { useState } from "react";
import { ArrowLeft, FileText, Filter, Edit } from "lucide-react";
import EditarAtendimento from "./EditarAtendimento";

export default function RelatorioAtendimento({ onBack }) {
  const [filtroLoja, setFiltroLoja] = useState("");
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
  const lojas = [
    { id: "1", nome: "Loja Matriz - Centro" },
    { id: "2", nome: "Loja Filial - Shopping" },
  ];

  const [atendimentos, setAtendimentos] = useState([
    {
      id: 1,
      loja_id: "1",
      data_hora: "2026-05-15T14:30",
      valor: "2500.00",
      vendedor: "Gabriel Davi",
      metrica: "Venda Concluída",
      cliente: "Maria Silva",
      observacoes: "Cliente procurava alianças de casamento.",
    },
    {
      id: 2,
      loja_id: "2",
      data_hora: "2026-05-14T10:15",
      valor: "0.00",
      vendedor: "Ana Sousa",
      metrica: "Preço Alto",
      cliente: "João Pedro",
      observacoes: "Achou o colar de ouro caro.",
    },
    {
      id: 3,
      loja_id: "1",
      data_hora: "2026-05-15T16:00",
      valor: "450.00",
      vendedor: "Gabriel Davi",
      metrica: "Venda Concluída",
      cliente: "Carlos Gomes",
      observacoes: "Presente de aniversário.",
    },
  ]);

  const atendimentosFiltrados = filtroLoja
    ? atendimentos.filter((a) => a.loja_id === filtroLoja)
    : atendimentos;

  const handleSalvarEdicao = (dadosAtualizados) => {
    setAtendimentos((prev) =>
      prev.map((a) => (a.id === dadosAtualizados.id ? dadosAtualizados : a)),
    );
    alert("Atendimento atualizado!");
    setAtendimentoSelecionado(null);
  };

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
                  Histórico completo de vendas e interações.
                </p>
              </div>
            </div>
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

          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-300 text-sm uppercase tracking-wider">
                    <th className="p-5 font-semibold">Data/Hora</th>
                    <th className="p-5 font-semibold">Cliente</th>
                    <th className="p-5 font-semibold">Vendedor</th>
                    <th className="p-5 font-semibold">Métrica</th>
                    <th className="p-5 font-semibold">Valor</th>
                    <th className="p-5 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {atendimentosFiltrados.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5 text-slate-300">
                        {new Date(item.data_hora).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-5 font-medium text-white">
                        {item.cliente}
                      </td>
                      <td className="p-5 text-slate-300">{item.vendedor}</td>
                      <td className="p-5 text-slate-300">
                        <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold">
                          {item.metrica}
                        </span>
                      </td>
                      <td className="p-5 font-bold text-[#a8d3b2]">
                        R$ {parseFloat(item.valor).toFixed(2)}
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => setAtendimentoSelecionado(item)}
                          className="p-2 bg-[#3E5641]/20 text-[#a8d3b2] hover:bg-[#3E5641] hover:text-white rounded-lg transition-colors cursor-pointer border-none inline-flex"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
