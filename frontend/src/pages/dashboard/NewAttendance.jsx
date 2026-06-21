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

    if (cargoLogado === "VENDEDOR") {
      setFormData((prev) => ({
        ...prev,
        vendedorId: user.id,
        vendedorNome:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username,
      }));
      setStep(2);
    } else {
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

    let dataHoraFinal = formData.dataHora;
    if (!dataHoraFinal) {
      const agora = new Date();
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-blue-50 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="bg-[#4D7BAB]/5 dark:bg-[#4D7BAB]/10 px-10 py-8 border-b border-blue-50 dark:border-slate-800 flex items-center gap-5">
          <div className="p-4 bg-[#4D7BAB] rounded-2xl text-white shadow-lg">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Registro de Atendimento
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Fluxo Dinâmico
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-10 mt-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <div className="p-10 min-h-[400px] flex flex-col justify-center">
          {/* PASSO 1 */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-8">
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Selecione o Vendedor
              </h3>
              {vendedores.length === 0 && !loading && (
                <p className="text-slate-500 dark:text-slate-400">
                  Nenhum vendedor encontrado.
                </p>
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
                  className="flex items-center gap-4 p-6 bg-blue-50 dark:bg-slate-800 border-2 border-[#4D7BAB] dark:border-slate-700 rounded-2xl w-full max-w-md hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <User
                    size={32}
                    className="text-[#4D7BAB] dark:text-blue-400"
                  />
                  <span className="font-bold text-xl text-slate-800 dark:text-slate-100">
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
                className="p-10 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-100 dark:border-emerald-500/20 rounded-3xl flex flex-col items-center gap-4 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <CheckCircle2
                  size={48}
                  className="text-emerald-500 dark:text-emerald-400"
                />
                <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                  Venda Fechada
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, vendaFechada: false });
                  setStep(3);
                }}
                className="p-10 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-100 dark:border-rose-500/20 rounded-3xl flex flex-col items-center gap-4 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <XCircle
                  size={48}
                  className="text-rose-500 dark:text-rose-400"
                />
                <span className="text-xl font-bold text-rose-800 dark:text-rose-300">
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
                  {/* Classes dark adicionadas aqui para o container de faturamento */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-3xl p-8 border-2 border-emerald-200 dark:border-emerald-500/30 shadow-sm transition-colors">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        R$
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        placeholder="0,00"
                        className="flex-1 text-5xl font-bold bg-transparent outline-none text-slate-900 dark:text-emerald-50 placeholder-slate-300 dark:placeholder-emerald-700/50"
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
                      <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-500/30">
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Valor válido
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xl font-bold text-slate-700 dark:text-slate-200">
                    Selecione o motivo:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {motivos.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-400 text-center">
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
                            ? "border-[#4D7BAB] bg-blue-50 dark:bg-blue-900/20 text-[#4D7BAB] dark:text-blue-400 font-bold"
                            : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DATA E HORA */}
              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Calendar
                    size={20}
                    className="text-[#4D7BAB] dark:text-blue-400"
                  />{" "}
                  Hora do Atendimento:
                </label>
                <input
                  type="time"
                  className="w-full p-4 bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl outline-none focus:border-[#4D7BAB] dark:focus:border-blue-500 dark:[color-scheme:dark]"
                  value={
                    formData.dataHora ? formData.dataHora.substring(11, 16) : ""
                  }
                  onChange={(e) => {
                    const horaDigitada = e.target.value;
                    if (!horaDigitada) {
                      setFormData({ ...formData, dataHora: "" });
                    } else {
                      const hoje = new Date();
                      const offset = hoje.getTimezoneOffset() * 60000;
                      const dataLocal = new Date(hoje.getTime() - offset)
                        .toISOString()
                        .split("T")[0];
                      setFormData({
                        ...formData,
                        dataHora: `${dataLocal}T${horaDigitada}`,
                      });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  Nome do Cliente:
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full p-4 bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl outline-none focus:border-[#4D7BAB] dark:focus:border-blue-500"
                  value={formData.clienteNome}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteNome: e.target.value })
                  }
                />
              </div>

              {isDispositivo && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl flex items-center gap-6">
                  <Lock
                    size={32}
                    className="text-amber-600 dark:text-amber-500"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="PIN"
                    className="w-24 text-center text-2xl p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 outline-none"
                    value={formData.pin}
                    onChange={(e) =>
                      setFormData({ ...formData, pin: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  Observações:
                </label>
                <textarea
                  rows="3"
                  placeholder="Ex: Cliente prometeu voltar sábado..."
                  className="w-full p-4 bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl outline-none focus:border-[#4D7BAB] dark:focus:border-blue-500 resize-none"
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
                  "w-full py-6 rounded-3xl font-bold text-xl shadow-lg transition-all bg-[#4D7BAB] text-white hover:bg-[#3a5d82] dark:hover:bg-blue-600 cursor-pointer",
                  loading && "opacity-50 cursor-not-allowed",
                )}
              >
                {loading ? "Processando..." : "Confirmar Registro"}
              </button>
            </div>
          )}
        </div>

        {step > 1 && (
          <div className="px-10 py-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer bg-transparent border-none outline-none"
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
