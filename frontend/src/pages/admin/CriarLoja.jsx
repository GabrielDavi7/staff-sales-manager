import React, { useState } from "react";
import {
  Store,
  Save,
  MapPin,
  PlusCircle,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto (já configurada com a baseURL)
import api from "../../api/axios";

export default function CriarLoja({ onBack }) {
  const [submitting, setSubmitting] = useState(false);
  const [storeFormData, setStoreFormData] = useState({
    nome_loja: "",
    cidade: "",
  });

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ENVIA A NOVA UNIDADE/FILIAL PARA O BACK-END DIANGO
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Estrutura o payload conforme os campos definidos no seu Serializer do Django
    const payload = {
      nome: storeFormData.nome_loja, // Mapeado de nome_loja para nome
      cidade: storeFormData.cidade,
    };

    try {
      await api.post("/api/admin/lojas/", payload);
      alert(`Loja "${storeFormData.nome_loja}" cadastrada com sucesso!`);
      onBack(); // Retorna ao Centro de Comando atualizando os contadores automaticamente
    } catch (err) {
      console.error(
        "Erro ao cadastrar nova loja no Django:",
        err.response?.data || err.message,
      );
      alert(
        "Erro 400: Não foi possível salvar a nova unidade. Verifique as validações do sistema.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full relative z-10 animate-in slide-in-from-bottom duration-500">
      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
      >
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
        <div className="p-4 bg-[#4D7BAB] rounded-2xl text-white shadow-lg shadow-[#4D7BAB]/30">
          <Store size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Nova Unidade / Filial
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Expanda sua rede corporativa registrando uma nova filial no banco de
            dados.
          </p>
        </div>
      </div>

      <form onSubmit={handleStoreSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Nome da Loja */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PlusCircle size={16} className="text-[#4D7BAB]" /> Nome da Loja
            </label>
            <input
              type="text"
              name="nome_loja"
              required
              disabled={submitting}
              value={storeFormData.nome_loja}
              onChange={handleStoreChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#4D7BAB] transition-all disabled:opacity-50"
              placeholder="Ex: Loja Diamond - Shopping Sul"
            />
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <MapPin size={16} className="text-[#4D7BAB]" /> Cidade
            </label>
            <input
              type="text"
              name="cidade"
              required
              disabled={submitting}
              value={storeFormData.cidade}
              onChange={handleStoreChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#4D7BAB] transition-all disabled:opacity-50"
              placeholder="Ex: Montes Claros"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4 pt-8 border-t border-white/10">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
          >
            <X size={20} /> Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-10 py-4 bg-[#4D7BAB] hover:bg-[#3b628a] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#4D7BAB]/30 flex items-center gap-2 cursor-pointer border-none outline-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Salvando...
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Loja
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
