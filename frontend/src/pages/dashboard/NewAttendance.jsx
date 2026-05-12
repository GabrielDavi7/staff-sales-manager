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
  MessageSquare,
  ClipboardCheck,
  Building,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";

const MOTIVOS = [
  "Cliente não encontrou o produto",
  "Cliente não encontrou o tamanho",
  "Cliente não gostou do modelo",
  "Cliente não concordou com o plano de pagamento",
  "Cliente achou o preço alto",
  "A peça foi reservada",
  "Pesquisa do cliente",
  "Cliente não respondeu mais",
  "Troca de peça (De/Para)",
  "Atendimento via WhatsApp",
];

// --- AJUSTE O ID ABAIXO PARA O ID REAL QUE VOCÊ VIU NA URL DO ADMIN ---
const VENDEDOR_TESTE = [
  {
    id: 4,
    first_name: "Vendedor Teste",
    last_name: "Real",
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
    motivo: "",
    clienteNome: "",
    observacoes: "",
    pin: "",
  });

  // Lógica para definir se é dispositivo (independente de maiúsculas/minúsculas)
  const isSupervisor = user?.cargo?.toUpperCase() === "SUPERVISOR";
  const isDispositivo = user?.cargo?.toUpperCase() === "DISPOSITIVO";

  useEffect(() => {
    if (!user) return;

    // Se quem logou já é VENDEDOR, ele pula a seleção
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
      // Como a rota /api/users/ dá 404, usamos o vendedor com ID real do banco
      setVendedores(VENDEDOR_TESTE);
    }
  }, [user]);

  const handleFinish = async () => {
    setError("");

    if (formData.vendaFechada && !formData.valor) {
      setError("Por favor, informe o valor da venda.");
      return;
    }
    if (formData.vendaFechada === false && !formData.motivo) {
      setError("Por favor, selecione o motivo do não fechamento.");
      return;
    }
    if (isDispositivo && !formData.pin) {
      setError("O PIN de segurança é obrigatório.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendedor: Number(formData.vendedorId),
        venda_fechada: formData.vendaFechada,
        valor_venda: formData.vendaFechada ? parseFloat(formData.valor) : 0,
        metricanome: !formData.vendaFechada
          ? formData.motivo || "Não informado"
          : "Venda concretizada",
        cliente_nome: formData.clienteNome || "Consumidor",
        observacoes: formData.observacoes || "",
        ...(isDispositivo && { pin: formData.pin }),
      };

      await api.post("/api/core/atendimentos/", payload);

      alert("Atendimento registrado com sucesso!");

      if (isDispositivo) {
        setFormData({
          vendedorId: null,
          vendedorNome: "",
          vendaFechada: null,
          valor: "",
          motivo: "",
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
        "Erro ao salvar. Verifique se o ID do vendedor e o PIN estão corretos.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-blue-50 overflow-hidden">
        {/* Header */}
        <div className="bg-[#4D7BAB]/5 px-10 py-8 border-b border-blue-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#4D7BAB] rounded-2xl text-white shadow-lg">
              <ClipboardCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Registro de Atendimento
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Sincronizado com o Banco de Dados.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-10 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <div className="p-10 min-h-[450px] flex flex-col justify-center bg-white">
          {/* PASSO 1: Seleção do Vendedor */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-2xl mx-auto">
                <Building
                  className="mx-auto text-[#4D7BAB]/40 mb-4"
                  size={48}
                  strokeWidth={1}
                />
                <h3 className="text-2xl font-semibold text-slate-800">
                  Selecione o vendedor:
                </h3>
              </div>
              <div className="flex justify-center">
                {vendedores.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        vendedorId: v.id,
                        vendedorNome: `${v.first_name} ${v.last_name}`,
                      });
                      setStep(2);
                    }}
                    className="flex items-center gap-4 p-8 bg-blue-50 border-2 border-[#4D7BAB] rounded-2xl hover:bg-blue-100 transition-all text-left shadow-lg"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#4D7BAB] text-white flex items-center justify-center">
                      <User size={32} />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 text-xl">
                        {v.first_name}
                      </span>
                      <span className="text-sm text-slate-500">ID: {v.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 2: Resultado */}
          {step === 2 && (
            <div className="space-y-10 text-center animate-in slide-in-from-right duration-300">
              <h3 className="text-3xl font-bold text-slate-800">
                Resultado do Atendimento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <button
                  onClick={() => {
                    setFormData({ ...formData, vendaFechada: true });
                    setStep(3);
                  }}
                  className="group flex flex-col items-center gap-6 p-10 bg-emerald-50 border-2 border-emerald-100 rounded-3xl hover:border-emerald-500 hover:shadow-xl transition-all"
                >
                  <CheckCircle2
                    size={64}
                    className="text-emerald-500"
                    strokeWidth={1.5}
                  />
                  <span className="text-2xl font-extrabold text-emerald-800 block">
                    Venda Realizada!
                  </span>
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...formData, vendaFechada: false });
                    setStep(3);
                  }}
                  className="group flex flex-col items-center gap-6 p-10 bg-rose-50 border-2 border-rose-100 rounded-3xl hover:border-rose-500 hover:shadow-xl transition-all"
                >
                  <XCircle
                    size={64}
                    className="text-rose-500"
                    strokeWidth={1.5}
                  />
                  <span className="text-2xl font-extrabold text-rose-800 block">
                    Não houve venda
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3: Valor, Motivo e PIN */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-300 max-w-4xl mx-auto w-full space-y-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-slate-800">
                  Finalizar Atendimento
                </h3>
                <p className="text-lg text-slate-500">
                  Vendedor:{" "}
                  <span className="font-bold text-[#4D7BAB]">
                    {formData.vendedorNome}
                  </span>
                </p>
              </div>

              {formData.vendaFechada ? (
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
                  <label className="text-xl font-semibold text-slate-700 flex items-center gap-4">
                    <DollarSign className="text-emerald-500" size={32} /> Valor
                    Total:
                  </label>
                  <input
                    type="number"
                    autoFocus
                    className="w-full text-5xl font-extrabold p-8 bg-white border-2 border-slate-200 rounded-3xl focus:border-[#4D7BAB] outline-none text-[#4D7BAB]"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <label className="text-xl font-semibold text-slate-700 flex items-center gap-4">
                    <MessageSquare className="text-rose-500" size={32} />{" "}
                    Selecione o motivo:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {MOTIVOS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setFormData({ ...formData, motivo: m })}
                        className={`p-4 text-left text-sm rounded-xl border-2 transition-all ${formData.motivo === m ? "border-[#4D7BAB] bg-blue-50 text-[#4D7BAB] font-bold" : "border-slate-100 bg-white"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CAMPO DO PIN (Exibido apenas para Dispositivo) */}
              {isDispositivo && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 mt-6 shadow-sm">
                  <div className="flex items-center gap-4 text-amber-700">
                    <Lock size={32} />
                    <div>
                      <p className="font-bold">Assinatura Digital</p>
                      <p className="text-xs">
                        Confirme com o PIN de 4 dígitos do tablet.
                      </p>
                    </div>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="****"
                    className="w-full sm:w-32 text-center text-3xl font-bold p-4 bg-white border-2 border-amber-200 rounded-2xl focus:border-amber-500 outline-none tracking-widest"
                    value={formData.pin}
                    onChange={(e) =>
                      setFormData({ ...formData, pin: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="pt-8 text-center">
                <button
                  onClick={handleFinish}
                  disabled={loading || isSupervisor}
                  className="px-12 py-6 bg-[#4D7BAB] text-white rounded-3xl font-bold text-xl shadow-xl hover:bg-[#3a5d82] disabled:opacity-50 transition-all w-full md:w-auto"
                >
                  {loading ? "Gravando..." : "Confirmar e Salvar"}
                </button>
              </div>
            </div>
          )}
        </div>

        {step > 1 &&
          !(step === 2 && user?.cargo?.toUpperCase() === "VENDEDOR") && (
            <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100">
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-slate-500 hover:text-[#4D7BAB] font-bold"
              >
                <ChevronLeft size={22} /> Voltar
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default NewAttendance;
