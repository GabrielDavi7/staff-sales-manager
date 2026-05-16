import React, { useState, useEffect } from "react";
import {
  Target,
  Save,
  ArrowLeft,
  FileText,
  Store,
  PlusCircle,
  X,
  Loader2,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto (já configurada com a baseURL)
import api from "../../api/axios";

export default function CriarMetrica({ onBack }) {
  const [loadingLojas, setLoadingLojas] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [metricFormData, setMetricFormData] = useState({
    nome: "",
    descricao: "",
    loja: "", // Armazenará o ID da loja selecionada ou "GLOBAL"
  });

  const [lojasDisponiveis, setLojasDisponiveis] = useState([]);

  // 1. CARREGA AS LOJAS REAIS DO BANCO DE DADOS
  useEffect(() => {
    const fetchLojas = async () => {
      try {
        setLoadingLojas(true);
        const response = await api.get("/api/admin/lojas/");
        const dados = response.data?.results || response.data;

        if (Array.isArray(dados)) {
          // Regra de UX: Só permite vincular novas métricas a lojas que estejam ATIVAS
          const lojasAtivas = dados.filter((l) => l.ativo === true);
          setLojasDisponiveis(lojasAtivas);
        }
      } catch (err) {
        console.error("Erro ao buscar lojas para o seletor de métricas:", err);
      } finally {
        setLoadingLojas(false);
      }
    };

    fetchLojas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetricFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. SUBMETE A NOVA MÉTRICA PARA O BACK-END DIANGO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Ajusta o payload conforme as regras do Serializer do Django
    const payload = {
      nome: metricFormData.nome,
      descricao: metricFormData.descricao,
      // Se selecionou GLOBAL, envia null (campo opcional no banco para métricas globais)
      loja:
        metricFormData.loja === "GLOBAL" ? null : Number(metricFormData.loja),
    };

    try {
      await api.post("/api/admin/metricas/", payload);
      alert(`Métrica "${metricFormData.nome}" cadastrada com sucesso!`);
      onBack(); // Retorna ao Centro de Comando atualizando os contadores
    } catch (err) {
      console.error(
        "Erro ao salvar métrica no Django:",
        err.response?.data || err.message,
      );
      alert("Erro 400: Não foi possível salvar a métrica. Verifique os dados.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full relative z-10 animate-in slide-in-from-bottom duration-500">
      <button
        onClick={onBack}
        disabled={submitting}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
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
            Configure metas, funis de conversão ou motivos de perda no banco de
            dados.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Nome do Indicador */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PlusCircle size={16} className="text-[#822659]" /> Nome do
              Indicador
            </label>
            <input
              type="text"
              name="nome"
              required
              disabled={submitting}
              value={metricFormData.nome}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#822659] transition-all disabled:opacity-50"
              placeholder="Ex: Perda - Preço Alto"
            />
          </div>

          {/* Popup de Seleção de Loja (Dinamizado) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Store size={16} className="text-[#822659]" /> Vincular à Unidade
            </label>
            <div className="relative">
              <select
                name="loja"
                required
                disabled={submitting || loadingLojas}
                value={metricFormData.loja}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#822659] cursor-pointer outline-none disabled:opacity-50 appearance-none"
              >
                <option value="" disabled>
                  {loadingLojas
                    ? "Sincronizando lojas com o servidor..."
                    : "Selecione a alocação da métrica..."}
                </option>
                <option
                  value="GLOBAL"
                  className="bg-[#003847] font-bold text-rose-300"
                >
                  Todas as Lojas (Métrica Global)
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

          {/* Descrição / Objetivo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText size={16} className="text-[#822659]" /> Descrição /
              Objetivo
            </label>
            <textarea
              name="descricao"
              required
              disabled={submitting}
              rows="4"
              value={metricFormData.descricao}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#822659] transition-all resize-none disabled:opacity-50"
              placeholder="Descreva o motivo de perda ou foco do indicador..."
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
            disabled={submitting || loadingLojas}
            className="px-10 py-4 bg-[#822659] hover:bg-[#6a1d47] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#822659]/30 flex items-center gap-2 cursor-pointer border-none outline-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Processando...
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Métrica
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
