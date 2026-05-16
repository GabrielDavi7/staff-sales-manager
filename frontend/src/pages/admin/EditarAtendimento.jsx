import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  DollarSign,
  User,
  Tag,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function EditarAtendimento({ atendimento, onSave, onCancel }) {
  const [formData, setFormData] = useState({ ...atendimento });
  const [isVendaConcluida, setIsVendaConcluida] = useState(
    parseFloat(atendimento.valor) > 0 ||
      atendimento.metrica === "Venda Concluída",
  );

  const [vendedoresDisponiveis] = useState([
    { id: "Gabriel Davi", nome: "Gabriel Davi" },
    { id: "Ana Sousa", nome: "Ana Sousa" },
    { id: "Marcos Silva", nome: "Marcos Silva" },
  ]);

  const [metricasDisponiveis] = useState([
    { id: "Preço Alto", nome: "Preço Alto" },
    { id: "Apenas Olhando", nome: "Apenas Olhando" },
    { id: "Modelo Indisponível", nome: "Modelo Indisponível" },
    { id: "Falta de Limite no Cartão", nome: "Falta de Limite no Cartão" },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = (vendaSucesso) => {
    setIsVendaConcluida(vendaSucesso);
    if (vendaSucesso) {
      setFormData((prev) => ({
        ...prev,
        metrica: "Venda Concluída",
        valor: prev.valor === "0.00" || prev.valor === 0 ? "" : prev.valor,
      }));
    } else {
      setFormData((prev) => ({ ...prev, valor: "0.00", metrica: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-xl border-none outline-none"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Editar Atendimento #{formData.id}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Ajuste valores, vendedores e motivos de perda.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row gap-4 bg-[#003847]/50 p-2 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => handleStatusToggle(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all cursor-pointer border-none outline-none ${isVendaConcluida ? "bg-[#3E5641] text-white shadow-lg shadow-[#3E5641]/30" : "text-slate-400 hover:bg-white/5"}`}
          >
            <CheckCircle2 size={20} /> Venda Concluída
          </button>
          <button
            type="button"
            onClick={() => handleStatusToggle(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all cursor-pointer border-none outline-none ${!isVendaConcluida ? "bg-[#822659] text-white shadow-lg shadow-[#822659]/30" : "text-slate-400 hover:bg-white/5"}`}
          >
            <XCircle size={20} /> Venda Não Concluída
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar size={16} className="text-[#3E5641]" /> Data e Hora
            </label>
            <input
              type="datetime-local"
              name="data_hora"
              value={formData.data_hora}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <User size={16} className="text-[#3E5641]" /> Nome do Cliente
            </label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <User size={16} className="text-[#3E5641]" /> Vendedor Responsável
            </label>
            <select
              name="vendedor"
              value={formData.vendedor}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer outline-none font-medium"
              required
            >
              <option value="" disabled>
                Selecione o vendedor...
              </option>
              {vendedoresDisponiveis.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </div>

          {isVendaConcluida ? (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-sm font-semibold text-[#a8d3b2] flex items-center gap-2">
                <DollarSign size={16} /> Valor da Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                className="w-full bg-[#3E5641]/20 border border-[#3E5641]/50 rounded-xl px-4 py-3 text-[#a8d3b2] font-bold focus:outline-none focus:border-[#3E5641]"
                placeholder="Ex: 1500.00"
                required
              />
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                <Tag size={16} /> Motivo da Perda (Métrica)
              </label>
              <select
                name="metrica"
                value={formData.metrica}
                onChange={handleChange}
                className="w-full bg-[#822659]/20 border border-[#822659]/50 rounded-xl px-4 py-3 text-rose-200 focus:outline-none focus:border-[#822659] cursor-pointer outline-none"
                required
              >
                <option value="" disabled>
                  Selecione por que a venda não ocorreu...
                </option>
                {metricasDisponiveis.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#003847]">
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText size={16} className="text-[#3E5641]" /> Observações
            </label>
            <textarea
              name="observacoes"
              rows="3"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#3E5641] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <X size={20} /> Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-[#3E5641] hover:bg-[#2e4030] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#3E5641]/30 flex items-center gap-2 cursor-pointer border-none outline-none"
          >
            <Save size={20} /> Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
