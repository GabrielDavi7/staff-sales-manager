import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  User,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ClipboardCheck,
  Lock,
  Calendar,
} from "lucide-react";
import { clsx } from "clsx";

const NewAttendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [vendedores, setVendedores] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vendedorId: null,
    vendedorNome: "",
    vendaFechada: null,
    valor: "",
    motivoId: null,
    clienteNome: "",
    observacoes: "",
    pin: "",
    dataHora: "",
  });

  const cargoLogado = user?.cargo?.toUpperCase();
  const isDispositivo = cargoLogado === "DISPOSITIVO";

  /**
   * Normaliza entrada de valor em BRL (Real Brasileiro)
   * Aceita: "1200,45" → armazena como "1200,45" (exibição), converte para 1200.45 (API)
   * Rejeita: "1.200,45", "1200.45", "1,200.45" (ponto NÃO é permitido)
   *
   * Regras:
   * - Apenas dígitos e vírgula (,)
   * - Máximo 2 casas decimais
   * - Ponto (.) é rejeitado imediatamente
   *
   * @param {string} valor - Entrada do usuário
   * @returns {string} - Valor normalizado (com vírgula) ou string vazia se inválido
   */
  const normalizarValorBRL = (valor) => {
    if (!valor) return "";

    let cleaned = valor.trim();

    // ❌ REJEITA qualquer ponto (.) - não é permitido
    if (cleaned.includes(".")) {
      return "";
    }

    // ❌ REJEITA caracteres inválidos - aceita apenas dígitos e vírgula
    if (!/^[\d,]*$/.test(cleaned)) {
      return "";
    }

    // Se tem vírgula, valida decimais
    if (cleaned.includes(",")) {
      const partes = cleaned.split(",");

      // ❌ REJEITA múltiplas vírgulas
      if (partes.length > 2) return "";

      // ❌ REJEITA mais de 2 casas decimais
      if (partes[1]?.length > 2) return "";

      return cleaned; // Mantém no formato "1200,45"
    }

    // Sem vírgula = valor inteiro
    return cleaned; // "1200"
  };

  /**
   * Converte valor em BRL (com vírgula) para formato decimal (com ponto)
   * Usado apenas na API/Banco de dados
   * @param {string} valor - "1200,45"
   * @returns {number} - 1200.45
   */
  const converterParaDecimalAPI = (valor) => {
    if (!valor) return 0;
    return parseFloat(valor.replace(",", "."));
  };

  // TRAVA DE SEGURANÇA: Impede que o Supervisor acesse a rota pela URL direta
  if (cargoLogado === "SUPERVISOR") {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (!user) return;

    // 1. Busca as métricas (motivos) reais do Django para qualquer usuário
    const fetchMotivos = async () => {
      try {
        const response = await api.get("/api/core/metricas/");
        const listaMotivos = response.data.results || response.data;
        setMotivos(listaMotivos);
      } catch (err) {
        console.error("Erro ao buscar motivos:", err);
      }
    };
    fetchMotivos();

    // Lógica dos Vendedores
    if (cargoLogado === "VENDEDOR") {
      // Vendedor pula direto pro passo 2 e registra em seu próprio nome
      setFormData((prev) => ({
        ...prev,
        vendedorId: user.id,
        vendedorNome:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username,
      }));
      setStep(2);
    } else {
      // Dispositivo/Admin busca a lista real de vendedores
      const fetchVendedores = async () => {
        try {
          setLoading(true);
          const response = await api.get("/api/users/vendedores/");

          const listaVendedores = response.data.results || response.data;
          setVendedores(listaVendedores);
        } catch (err) {
          console.error("Erro ao buscar vendedores:", err);
          setError("Não foi possível carregar a lista de vendedores.");
        } finally {
          setLoading(false);
        }
      };

      fetchVendedores();
    }
  }, [user, cargoLogado]);

  // ==========================================
  // 4. ENVIO DOS DADOS
  // ==========================================
  const handleFinish = async () => {
    setError("");

    // VALIDAÇÃO: Se venda fechada, exige valor válido
    if (formData.vendaFechada) {
      const valorDecimal = converterParaDecimalAPI(formData.valor);
      if (!formData.valor || valorDecimal <= 0) {
        setError("O valor da venda deve ser maior que zero.");
        return;
      }
    }

    // VALIDAÇÃO: Se não fechou venda, exige motivo
    if (formData.vendaFechada === false && !formData.motivoId) {
      setError("Selecione o motivo da perda.");
      return;
    }

    // VALIDAÇÃO: Se dispositivo, exige PIN
    if (isDispositivo && !formData.pin) {
      setError("O PIN é obrigatório.");
      return;
    }

    setLoading(true);

    // LÓGICA DA DATA E HORA: Usa a inserida ou gera a atual
    let dataHoraFinal = formData.dataHora;
    if (!dataHoraFinal) {
      const agora = new Date();
      // Ajusta o fuso horário local para o formato ISO aceito pelo Django (YYYY-MM-DDTHH:MM)
      const offset = agora.getTimezoneOffset() * 60000;
      dataHoraFinal = new Date(agora.getTime() - offset)
        .toISOString()
        .substring(0, 16);
    }

    try {
      const payload = {
        vendedor: Number(formData.vendedorId),
        venda_fechada: formData.vendaFechada,
        // Converte "1200,45" → 1200.45 para a API
        valor_venda: formData.vendaFechada
          ? converterParaDecimalAPI(formData.valor)
          : 0,
        metrica: !formData.vendaFechada ? Number(formData.motivoId) : null,
        cliente_nome: formData.clienteNome || "Não informado",
        observacoes: formData.observacoes || "",
        data_hora: dataHoraFinal,
        ...(isDispositivo && { pin: formData.pin }),
      };

      await api.post("/api/core/atendimentos/", payload);
      alert("Sucesso! O banco aceitou o registro.");

      if (isDispositivo) {
        setFormData({
          vendedorId: null,
          vendedorNome: "",
          vendaFechada: null,
          valor: "",
          motivoId: null,
          clienteNome: "",
          observacoes: "",
          pin: "",
          dataHora: "",
        });
        setStep(1);
        navigate("/registrarvenda", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Erro no Django:", err.response?.data);
      setError(
        "Erro 400: Não foi possível salvar. Verifique os dados ou o PIN.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-2xl border border-blue-50 overflow-hidden">
        {/* Header */}
        <div className="bg-[#4D7BAB]/5 px-10 py-8 border-b border-blue-50 flex items-center gap-5">
          <div className="p-4 bg-[#4D7BAB] rounded-2xl text-white shadow-lg">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Registro de Atendimento
            </h1>
            <p className="text-sm text-slate-500">Fluxo Dinâmico</p>
          </div>
        </div>

        {error && (
          <div className="mx-10 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <div className="p-10 min-h-[400px] flex flex-col justify-center">
          {/* PASSO 1 */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-8">
              <h3 className="text-2xl font-semibold text-slate-800">
                Selecione o Vendedor
              </h3>
              {vendedores.length === 0 && !loading && (
                <p className="text-slate-500">Nenhum vendedor encontrado.</p>
              )}
              {vendedores.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      vendedorId: v.id,
                      vendedorNome: v.first_name,
                    });
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-6 bg-blue-50 border-2 border-[#4D7BAB] rounded-2xl w-full max-w-md hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <User size={32} className="text-[#4D7BAB]" />
                  <span className="font-bold text-xl">
                    {v.first_name} {v.last_name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* PASSO 2 */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, vendaFechada: true });
                  setStep(3);
                }}
                className="p-10 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex flex-col items-center gap-4 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <CheckCircle2 size={48} className="text-emerald-500" />
                <span className="text-xl font-bold text-emerald-800">
                  Venda Fechada
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, vendaFechada: false });
                  setStep(3);
                }}
                className="p-10 bg-rose-50 border-2 border-rose-100 rounded-3xl flex flex-col items-center gap-4 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <XCircle size={48} className="text-rose-500" />
                <span className="text-xl font-bold text-rose-800">
                  Não houve venda
                </span>
              </button>
            </div>
          )}

          {/* PASSO 3 */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto w-full space-y-8">
              {formData.vendaFechada ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-200 shadow-sm">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-emerald-600">R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        placeholder="0,00"
                        className="flex-1 text-5xl font-bold bg-transparent outline-none text-slate-900 placeholder-slate-300"
                        value={formData.valor}
                        onChange={(e) => {
                          const novoValor = normalizarValorBRL(e.target.value);
                          setFormData({ ...formData, valor: novoValor });
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "." ||
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E"
                          ) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    {formData.valor && (
                      <div className="mt-4 pt-4 border-t border-emerald-200">
                        <p className="text-sm text-emerald-600 font-medium">
                          ✓ Valor válido
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xl font-bold text-slate-700">
                    Selecione o motivo:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {motivos.length === 0 && (
                      <p className="text-slate-500 text-center">
                        Carregando motivos...
                      </p>
                    )}
                    {motivos.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, motivoId: m.id })
                        }
                        className={`p-6 text-center rounded-2xl border-2 transition-all cursor-pointer ${
                          formData.motivoId === m.id
                            ? "border-[#4D7BAB] bg-blue-50 text-[#4D7BAB] font-bold"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DATA E HORA RETROATIVA (SOMENTE HORA) */}
              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={20} className="text-[#4D7BAB]" /> Hora do
                  Atendimento:
                </label>
                <input
                  type="time"
                  className="w-full p-4 border-2 rounded-2xl outline-none focus:border-[#4D7BAB]"
                  // Extrai apenas a parte da hora "HH:mm" do estado para mostrar no input
                  value={
                    formData.dataHora ? formData.dataHora.substring(11, 16) : ""
                  }
                  onChange={(e) => {
                    const horaDigitada = e.target.value; // Vem no formato "HH:mm"

                    if (!horaDigitada) {
                      setFormData({ ...formData, dataHora: "" });
                    } else {
                      // Pega a data exata de hoje no fuso local (YYYY-MM-DD)
                      const hoje = new Date();
                      const offset = hoje.getTimezoneOffset() * 60000;
                      const dataLocal = new Date(hoje.getTime() - offset)
                        .toISOString()
                        .split("T")[0];

                      // Junta a data de hoje com a hora que o usuário escolheu
                      setFormData({
                        ...formData,
                        dataHora: `${dataLocal}T${horaDigitada}`,
                      });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700">
                  Nome do Cliente:
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full p-4 border-2 rounded-2xl outline-none focus:border-[#4D7BAB]"
                  value={formData.clienteNome}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteNome: e.target.value })
                  }
                />
              </div>

              {isDispositivo && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center gap-6">
                  <Lock size={32} className="text-amber-600" />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="PIN"
                    className="w-24 text-center text-2xl p-3 border-2 rounded-xl focus:border-amber-500 outline-none"
                    value={formData.pin}
                    onChange={(e) =>
                      setFormData({ ...formData, pin: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700">
                  Observações:
                </label>
                <textarea
                  rows="3"
                  placeholder="Ex: Cliente prometeu voltar sábado, detalhe sobre a joia..."
                  className="w-full p-4 border-2 rounded-2xl outline-none focus:border-[#4D7BAB] resize-none"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                />
              </div>

              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className={clsx(
                  "w-full py-6 rounded-3xl font-bold text-xl shadow-lg transition-all bg-[#4D7BAB] text-white hover:bg-[#3a5d82] cursor-pointer",
                  loading && "opacity-50 cursor-not-allowed",
                )}
              >
                {loading ? "Processando..." : "Confirmar Registro"}
              </button>
            </div>
          )}
        </div>

        {step > 1 && (
          <div className="px-10 py-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-700 cursor-pointer bg-transparent border-none outline-none"
            >
              <ChevronLeft size={20} /> Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAttendance;