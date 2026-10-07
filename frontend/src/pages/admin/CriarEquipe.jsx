import React, { useState, useEffect } from "react";
import {
  Target,
  Save,
  ArrowLeft,
  Store,
  PlusCircle,
  X,
  Users,
  Loader2,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto (já configurada com a baseURL)
import api from "../../api/axios";

export default function CriarEquipe({ onBack }) {
  const [loadingLojas, setLoadingLojas] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [equipeFormData, setEquipeFormData] = useState({
    nome: "",
    loja: "",
  });

  const [lojasDisponiveis, setLojasDisponiveis] = useState([]);

  // 1. CARREGA AS LOJAS OPERACIONAIS DO BACK-END
  useEffect(() => {
    const fetchLojas = async () => {
      try {
        setLoadingLojas(true);
        const response = await api.get("/api/admin/lojas/");
        const dados = response.data?.results || response.data;

        if (Array.isArray(dados)) {
          // Regra de UX: Só permite associar um novo time a uma filial que esteja ATIVA
          const lojasAtivas = dados.filter((l) => l.ativo === true);
          setLojasDisponiveis(lojasAtivas);
        }
      } catch (err) {
        console.error("Erro ao buscar lojas para o seletor de equipes:", err);
      } finally {
        // <-- CORRIGIDO AQUI (Dois L's agora)
        setLoadingLojas(false);
      }
    };

    fetchLojas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipeFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. ENVIA O NOVO TIME COOPERATIVO PARA O DJANGO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      nome: equipeFormData.nome,
      loja: Number(equipeFormData.loja), // Garante que o ID vai como número inteiro
    };

    try {
      await api.post("/api/admin/equipes/", payload);
      alert(`Equipe "${equipeFormData.nome}" cadastrada com sucesso!`);
      onBack();
    } catch (err) {
      console.error("Erro ao cadastrar equipe:", err.response?.data || err.message);
      const data = err.response?.data;
      if (typeof data === 'string') {
        setErrorMsg(data);
      } else if (data?.detail) {
        setErrorMsg(data.detail);
      } else if (data && typeof data === 'object') {
        const msgs = Object.values(data).flat();
        setErrorMsg(msgs.join(' '));
      } else {
        setErrorMsg("Erro ao salvar. Verifique os dados e tente novamente.");
      }
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
          <Users size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Nova Equipe Comercial
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Agrupe e organize times de vendedores associando-os às filiais
            físicas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Nome da Equipe */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PlusCircle size={16} className="text-[#4D7BAB]" /> Nome da Equipe
            </label>
            <input
              type="text"
              name="nome"
              required
              disabled={submitting}
              value={equipeFormData.nome}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#4D7BAB] transition-all disabled:opacity-50"
              placeholder="Ex: Equipe Diamante"
            />
          </div>

          {/* Seletor Dinâmico de Lojas */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Store size={16} className="text-[#4D7BAB]" /> Vincular à Loja
            </label>
            <div className="relative">
              <select
                name="loja"
                required
                disabled={submitting || loadingLojas}
                value={equipeFormData.loja}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#4D7BAB] cursor-pointer outline-none disabled:opacity-50 appearance-none"
              >
                <option value="" disabled>
                  {loadingLojas
                    ? "Sincronizando filiais ativas..."
                    : "Selecione a loja da equipe..."}
                </option>
                {lojasDisponiveis.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#003847]">
                    {l.nome} ({l.cidade})
                  </option>
                ))}
              </select>
              {loadingLojas && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-slate-400" size={18} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

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
            disabled={submitting || loadingLojas}
            className="px-10 py-4 bg-[#4D7BAB] hover:bg-[#3b628a] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#4D7BAB]/30 flex items-center gap-2 cursor-pointer border-none outline-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Salvando...
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Equipe
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
