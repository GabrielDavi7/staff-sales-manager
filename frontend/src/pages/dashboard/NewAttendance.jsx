import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  User,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ClipboardCheck,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";

const NewAttendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [vendedores, setVendedores] = useState([]);
  const [motivos, setMotivos] = useState([]); // <-- AQUI: Estado para guardar os motivos reais
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
  });

  const isSupervisor = user?.cargo?.toUpperCase() === "SUPERVISOR";
  const isDispositivo = user?.cargo?.toUpperCase() === "DISPOSITIVO";

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

    // 2. Lógica dos Vendedores
    if (user.cargo?.toUpperCase() === "VENDEDOR") {
      // Vendedor pula direto pro passo 2
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
  }, [user]);

  // ==========================================
  // 4. ENVIO DOS DADOS
  // ==========================================
  const handleFinish = async () => {
    setError("");

    if (formData.vendaFechada && !formData.valor) {
      setError("Informe o valor da venda.");
      return;
    }
    if (formData.vendaFechada === false && !formData.motivoId) {
      setError("Selecione o motivo da perda."); // Mudei a mensagem de erro
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

        // AQUI: Pegando o ID real que o usuário clicou em vez de 1
        metrica: !formData.vendaFechada ? Number(formData.motivoId) : null,

        cliente_nome: formData.clienteNome || "Não informado",
        observacoes: formData.observacoes || "",
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
                  onClick={() => {
                    setFormData({
                      ...formData,
                      vendedorId: v.id,
                      vendedorNome: v.first_name,
                    });
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-6 bg-blue-50 border-2 border-[#4D7BAB] rounded-2xl w-full max-w-md hover:bg-blue-100 transition-colors"
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
                onClick={() => {
                  setFormData({ ...formData, vendaFechada: true });
                  setStep(3);
                }}
                className="p-10 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex flex-col items-center gap-4 hover:bg-emerald-100 transition-colors"
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
                className="p-10 bg-rose-50 border-2 border-rose-100 rounded-3xl flex flex-col items-center gap-4 hover:bg-rose-100 transition-colors"
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
                    Selecione o motivo:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* AQUI: Mapeando os motivos reais do banco */}
                    {motivos.length === 0 && (
                      <p className="text-slate-500 text-center">
                        Carregando motivos...
                      </p>
                    )}
                    {motivos.map((m) => (
                      <button
                        key={m.id}
                        onClick={() =>
                          setFormData({ ...formData, motivoId: m.id })
                        }
                        className={`p-6 text-center rounded-2xl border-2 transition-all ${
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
              {/* --- NOVO CAMPO: Nome do Cliente --- */}
              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700">
                  Nome do Cliente (Opcional):
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
              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-700">
                  Observações (Opcional):
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
                onClick={handleFinish}
                disabled={loading || isSupervisor}
                className={clsx(
                  "w-full py-6 rounded-3xl font-bold text-xl shadow-lg transition-all",
                  isSupervisor
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-[#4D7BAB] text-white hover:bg-[#3a5d82]",
                )}
              >
                {isSupervisor
                  ? "Acesso restrito a vendas"
                  : loading
                    ? "Processando..."
                    : "Confirmar Registro"}
              </button>
            </div>
          )}
        </div>

        {step > 1 && (
          <div className="px-10 py-6 border-t border-slate-100">
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-700"
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
