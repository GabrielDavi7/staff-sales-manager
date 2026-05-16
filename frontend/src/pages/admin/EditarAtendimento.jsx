import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto (já configurada com a baseURL)
import api from "../../api/axios";

export default function EditarAtendimento({ atendimento, onSave, onCancel }) {
  const [loadingDados, setLoadingDados] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Mapeia e normaliza os dados vindos do back-end para o estado interno do formulário
  const [formData, setFormData] = useState({
    id: atendimento.id,
    data_hora: atendimento.data_hora
      ? atendimento.data_hora.substring(0, 16)
      : "",
    cliente_nome: atendimento.cliente_nome || atendimento.cliente || "",
    vendedor: atendimento.vendedor?.id || atendimento.vendedor || "",
    valor_venda:
      atendimento.valor_venda !== undefined
        ? atendimento.valor_venda
        : atendimento.valor || "",
    metrica: atendimento.metrica?.id || atendimento.metrica || "",
    observacoes: atendimento.observacoes || "",
  });

  // Controla o switch visual de Venda Fechada ou Perda
  const [isVendaConcluida, setIsVendaConcluida] = useState(
    atendimento.venda_fechada === true ||
      parseFloat(atendimento.valor_venda || atendimento.valor || 0) > 0,
  );

  const [vendedoresDisponiveis, setVendedoresDisponiveis] = useState([]);
  const [metricasDisponiveis, setMetricasDisponiveis] = useState([]);

  // 1. BUSCA OS VENDEDORES E AS MÉTRICAS REAIS CADASTRADAS NO BANCO
  useEffect(() => {
    const carregarDadosFormulario = async () => {
      try {
        setLoadingDados(true);
        const [resUsuarios, resMetricas] = await Promise.all([
          api.get("/api/admin/usuarios/"),
          api.get("/api/admin/metricas/"),
        ]);

        const dadosUsuarios =
          resUsuarios.data?.results || resUsuarios.data || [];
        const dadosMetricas =
          resMetricas.data?.results || resMetricas.data || [];

        // Filtra para exibir no select apenas colaboradores e motivos que estejam ativos
        setVendedoresDisponiveis(
          dadosUsuarios.filter((u) => u.is_active !== false),
        );
        setMetricasDisponiveis(dadosMetricas.filter((m) => m.ativo === true));
      } catch (err) {
        console.error("Erro ao carregar dados estruturais para edição:", err);
      } finally {
        setLoadingDados(false);
      }
    };

    carregarDadosFormulario();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = (vendaSucesso) => {
    setIsVendaConcluida(vendaSucesso);
    if (vendaSucesso) {
      setFormData((prev) => ({
        ...prev,
        metrica: "",
        valor_venda: prev.valor_venda == 0 ? "" : prev.valor_venda,
      }));
    } else {
      setFormData((prev) => ({ ...prev, valor_venda: 0, metrica: "" }));
    }
  };

  // 2. DISPARA O COMANDO PATCH DE ATUALIZAÇÃO PARA O DJANGO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // REQUISITO DE DATA/HORA: Se deixado em branco, utiliza a data e hora local atual formatada para o Django
    let dataHoraFinal = formData.data_hora;
    if (!dataHoraFinal) {
      const agora = new Date();
      // Ajusta o fuso horário local para o formato ISO aceito pelo Django (YYYY-MM-DDTHH:MM)
      const offset = agora.getTimezoneOffset() * 60000;
      dataHoraFinal = new Date(agora.getTime() - offset)
        .toISOString()
        .substring(0, 16);
    }

    // Estruturação do Payload alinhada com os serializers do app core
    const payload = {
      vendedor: Number(formData.vendedor),
      venda_fechada: isVendaConcluida,
      valor_venda: isVendaConcluida ? parseFloat(formData.valor_venda) : 0,
      metrica: !isVendaConcluida ? Number(formData.metrica) : null,
      cliente_nome: formData.cliente_nome.trim() || "Não informado", // REQUISITO: Opcional
      data_hora: dataHoraFinal,
      observacoes: formData.observacoes,
    };

    try {
      // Executa o PATCH na rota de atendimentos mapeada no urlscore.py
      await api.patch(`/api/core/atendimentos/${formData.id}/`, payload);
      onSave(); // Aciona o callback do RelatorioAtendimento para fechar a tela e recarregar a tabela
    } catch (err) {
      console.error(
        "Erro ao atualizar atendimento no Django:",
        err.response?.data || err.message,
      );
      alert(
        "Erro 400: Não foi possível salvar as alterações. Verifique os campos informados.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDados) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="animate-spin text-[#3E5641]" size={44} />
        <p className="text-slate-300 font-medium">
          Sincronizando integridade dos registros...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-xl border-none outline-none disabled:opacity-50"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Editar Atendimento #{formData.id}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Ajuste valores, vendedores e motivos de perda diretamente no banco
            de dados.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-xl backdrop-blur-md"
      >
        {/* Toggle Switch de Status da Venda */}
        <div className="flex flex-col md:flex-row gap-4 bg-[#003847]/50 p-2 rounded-2xl border border-white/5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleStatusToggle(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all cursor-pointer border-none outline-none ${isVendaConcluida ? "bg-[#3E5641] text-white shadow-lg shadow-[#3E5641]/30" : "text-slate-400 hover:bg-white/5 disabled:opacity-50"}`}
          >
            <CheckCircle2 size={20} /> Venda Concluída
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleStatusToggle(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all cursor-pointer border-none outline-none ${!isVendaConcluida ? "bg-[#822659] text-white shadow-lg shadow-[#822659]/30" : "text-slate-400 hover:bg-white/5 disabled:opacity-50"}`}
          >
            <XCircle size={20} /> Venda Não Concluída
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data e Hora (Opcional - Fallback Automático para Data Local) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar size={16} className="text-[#3E5641]" /> Data e Hora
            </label>
            <input
              type="datetime-local"
              name="data_hora"
              disabled={submitting}
              value={formData.data_hora}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] disabled:opacity-50"
            />
            <p className="text-[11px] text-slate-400 italic pl-1">
              Deixe em branco para assumir o horário local atual.
            </p>
          </div>

          {/* Nome do Cliente (REQUISITO: Totalmente Opcional) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <User size={16} className="text-[#3E5641]" /> Nome do Cliente
            </label>
            <input
              type="text"
              name="cliente_nome"
              disabled={submitting}
              value={formData.cliente_nome}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] disabled:opacity-50"
              placeholder="Ex: Maria Silva (Opcional)"
            />
          </div>

          {/* Vendedor Responsável Dinâmico */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <User size={16} className="text-[#3E5641]" /> Vendedor Responsável
            </label>
            <select
              name="vendedor"
              required
              disabled={submitting}
              value={formData.vendedor}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer outline-none font-medium disabled:opacity-50"
            >
              <option value="" disabled>
                Selecione o vendedor responsável...
              </option>
              {vendedoresDisponiveis.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#003847]">
                  {v.first_name} {v.last_name || ""}
                </option>
              ))}
            </select>
          </div>

          {/* Seção Condicional: Valor ou Motivo de Perda */}
          {isVendaConcluida ? (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-sm font-semibold text-[#a8d3b2] flex items-center gap-2">
                <DollarSign size={16} /> Valor da Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="valor_venda"
                required
                disabled={submitting}
                value={formData.valor_venda}
                onChange={handleChange}
                className="w-full bg-[#3E5641]/20 border border-[#3E5641]/50 rounded-xl px-4 py-3 text-[#a8d3b2] font-bold focus:outline-none focus:border-[#3E5641] disabled:opacity-50"
                placeholder="Ex: 1500.00"
              />
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                <Tag size={16} /> Motivo da Perda (Métrica)
              </label>
              <select
                name="metrica"
                required
                disabled={submitting}
                value={formData.metrica}
                onChange={handleChange}
                className="w-full bg-[#822659]/20 border border border-[#822659]/50 rounded-xl px-4 py-3 text-rose-200 focus:outline-none focus:border-[#822659] cursor-pointer outline-none disabled:opacity-50"
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

          {/* Observações */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText size={16} className="text-[#3E5641]" /> Observações
            </label>
            <textarea
              name="observacoes"
              rows="3"
              disabled={submitting}
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full bg-[#003847] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#3E5641] resize-none disabled:opacity-50"
              placeholder="Insira detalhes ou anotações extras sobre o atendimento..."
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
          >
            <X size={20} /> Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-[#3E5641] hover:bg-[#2e4030] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#3E5641]/30 flex items-center gap-2 cursor-pointer border-none outline-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Salvando...
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
