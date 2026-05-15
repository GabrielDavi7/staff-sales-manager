import React, { useState } from "react";
import {
  Target,
  Save,
  ArrowLeft,
  FileText,
  Store,
  PlusCircle,
  X,
} from "lucide-react";

export default function CriarMetrica({ onBack }) {
  const [metricFormData, setMetricFormData] = useState({
    nome: "",
    descricao: "",
    loja: "",
  });
  const [lojasDisponiveis] = useState([
    { id: "GLOBAL", nome: "Todas as Lojas (Métrica Global)" },
    { id: 1, nome: "Loja Matriz - Centro" },
    { id: 2, nome: "Loja Filial - Shopping" },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetricFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Nova Métrica cadastrada:", metricFormData);
    alert(`Métrica "${metricFormData.nome}" cadastrada com sucesso!`);
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto w-full relative z-10 animate-in slide-in-from-bottom duration-500">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none outline-none"
      >
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
        <div className="p-4 bg-[#822659] rounded-2xl text-white shadow-lg shadow-[#822659]/30">
          <Target size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Nova Métrica / Indicador
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure metas, funis de conversão ou motivos de perda.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PlusCircle size={16} className="text-[#822659]" /> Nome do
              Indicador
            </label>
            <input
              type="text"
              name="nome"
              required
              value={metricFormData.nome}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#822659] transition-all"
              placeholder="Ex: Perda - Preço Alto"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Store size={16} className="text-[#822659]" /> Vincular à Unidade
            </label>
            <select
              name="loja"
              required
              value={metricFormData.loja}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#822659] cursor-pointer outline-none"
            >
              <option value="" disabled>
                Selecione a loja correspondente...
              </option>
              {lojasDisponiveis.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText size={16} className="text-[#822659]" /> Descrição /
              Objetivo
            </label>
            <textarea
              name="descricao"
              required
              rows="4"
              value={metricFormData.descricao}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#822659] transition-all resize-none"
              placeholder="Descreva o motivo de perda ou foco do indicador..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-8 border-t border-white/10">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <X size={20} /> Cancelar
          </button>
          <button
            type="submit"
            className="px-10 py-4 bg-[#822659] hover:bg-[#6a1d47] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#822659]/30 flex items-center gap-2 cursor-pointer border-none outline-none"
          >
            <Save size={20} /> Salvar Métrica
          </button>
        </div>
      </form>
    </div>
  );
}
