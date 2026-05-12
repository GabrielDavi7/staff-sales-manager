import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  User,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  DollarSign,
  ClipboardCheck,
  Building,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";

// Deletamos as fakes e deixamos apenas uma para o teste de ID
const MOTIVOS_TESTE = [{ id: 1, nome: "Motivo de Teste (ID 1)" }];

const VENDEDOR_TESTE = [
  {
    id: 4,
    first_name: "Vendedor",
    last_name: "Teste",
    cargo: "Vendedor",
  },
];

const NewAttendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vendedorId: null,
    vendedorNome: "",
    vendaFechada: null,
    valor: "",
    motivoId: null, // Agora guardamos o ID
    clienteNome: "",
    observacoes: "",
    pin: "",
  });

  const isSupervisor = user?.cargo?.toUpperCase() === "SUPERVISOR";
  const isDispositivo = user?.cargo?.toUpperCase() === "DISPOSITIVO";

  useEffect(() => {
    if (!user) return;
    if (user.cargo?.toUpperCase() === "VENDEDOR") {
      setFormData((prev) => ({
        ...prev,
        vendedorId: user.id,
        vendedorNome:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username,
      }));
      setStep(2);
    } else {
      setVendedores(VENDEDOR_TESTE);
    }
  }, [user]);

  const handleFinish = async () => {
    setError("");

    if (formData.vendaFechada && !formData.valor) {
      setError("Informe o valor da venda.");
      return;
    }
    if (formData.vendaFechada === false && !formData.motivoId) {
      setError("Selecione o motivo de teste.");
      return;
    }
    if (isDispositivo && !formData.pin) {
      setError("O PIN é obrigatório.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendedor: Number(formData.vendedorId),
        venda_fechada: formData.vendaFechada,
        valor_venda: formData.vendaFechada ? parseFloat(formData.valor) : 0,

        // AQUI ESTÁ A MUDANÇA: Enviando o ID 1 fixo para o teste
        metrica: !formData.vendaFechada ? 1 : null,

        cliente_nome: formData.clienteNome || "Consumidor",
        observacoes: formData.observacoes || "",
        ...(isDispositivo && { pin: formData.pin }),
      };

      await api.post("/api/core/atendimentos/", payload);
      alert("Sucesso! O banco aceitou a métrica ID 1.");

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
        });
        setStep(1);
        navigate("/registrarvenda", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Erro no Django:", err.response?.data);
      setError(
        "Erro 400: Verifique se o ID 1 existe na tabela de Métricas do Admin.",
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
            <p className="text-sm text-slate-500">Teste de Métrica ID 1</p>
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
              {vendedores.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      vendedorId: v.id,
                      vendedorNome: v.first_name,
                    });
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-6 bg-blue-50 border-2 border-[#4D7BAB] rounded-2xl w-full max-w-md"
                >
                  <User size={32} className="text-[#4D7BAB]" />
                  <span className="font-bold text-xl">
                    {v.first_name} (ID: {v.id})
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* PASSO 2 */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
              <button
                onClick={() => {
                  setFormData({ ...formData, vendaFechada: true });
                  setStep(3);
                }}
                className="p-10 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex flex-col items-center gap-4"
              >
                <CheckCircle2 size={48} className="text-emerald-500" />
                <span className="text-xl font-bold text-emerald-800">
                  Venda Fechada
                </span>
              </button>
              <button
                onClick={() => {
                  setFormData({ ...formData, vendaFechada: false });
                  setStep(3);
                }}
                className="p-10 bg-rose-50 border-2 border-rose-100 rounded-3xl flex flex-col items-center gap-4"
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
                <div className="space-y-4">
                  <label className="text-xl font-bold text-slate-700">
                    Valor da Venda:
                  </label>
                  <input
                    type="number"
                    autoFocus
                    className="w-full text-4xl p-6 border-2 rounded-2xl outline-none focus:border-[#4D7BAB]"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xl font-bold text-slate-700">
                    Selecione o motivo de teste:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {MOTIVOS_TESTE.map((m) => (
                      <button
                        key={m.id}
                        onClick={() =>
                          setFormData({ ...formData, motivoId: m.id })
                        }
                        className={`p-6 text-center rounded-2xl border-2 transition-all ${formData.motivoId === m.id ? "border-[#4D7BAB] bg-blue-50 text-[#4D7BAB] font-bold" : "border-slate-100 bg-white"}`}
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-full py-6 bg-[#4D7BAB] text-white rounded-3xl font-bold text-xl shadow-lg"
              >
                {loading ? "Processando..." : "Confirmar Registro"}
              </button>
            </div>
          )}
        </div>

        {step > 1 && (
          <div className="px-10 py-6 border-t border-slate-100">
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-slate-500 font-bold"
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
