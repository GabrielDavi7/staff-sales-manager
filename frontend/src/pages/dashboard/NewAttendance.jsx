import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios"; // Ajuste o caminho se necessário
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

// Mock de fallback caso a API de usuários não esteja pronta
const MOCK_VENDEDORES = [
  { id: 1, first_name: "Gabriel", last_name: "Davi" },
  { id: 2, first_name: "Caio", last_name: "Dias" },
  { id: 3, first_name: "Pedro", last_name: "Braga" },
];

const MOTIVOS = [
  "Apenas pesquisando",
  "Preço alto",
  "Falta de estoque",
  "Não gostou do modelo",
  "Volta depois",
  "Condição de pagamento",
  "Atendimento rápido/Dúvida",
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
    pin: "", // Exclusivo para DISPOSITIVO
  });

  // Configuração inicial baseada no cargo
  useEffect(() => {
    // Se o usuário ainda não carregou, não faz nada
    if (!user) return;

    // Lógica para VENDEDOR
    if (user.cargo === "VENDEDOR") {
      setFormData((prev) => ({
        ...prev,
        vendedorId: user.id,
        vendedorNome: user.nome,
      }));
      setStep(2); // Pula direto para Venda Concretizada/Não
    }
    // Lógica para outros cargos que precisam da lista
    else {
      const carregarVendedores = async () => {
        try {
          const res = await api.get("/api/users/");
          setVendedores(res.data);
        } catch (err) {
          console.error("Erro ao carregar vendedores, usando mock...");
          setVendedores(MOCK_VENDEDORES);
        }
      };
      carregarVendedores();
    }
  }, [user]); // Remova o 'api' da dependência para evitar loops

  const handleFinish = async () => {
    setError("");

    // Validações
    if (formData.vendaFechada && !formData.valor) {
      setError("Por favor, informe o valor da venda.");
      return;
    }
    if (formData.vendaFechada === false && !formData.motivo) {
      setError("Por favor, selecione o motivo do não fechamento.");
      return;
    }
    if (user?.cargo === "DISPOSITIVO" && !formData.pin) {
      setError("O PIN de segurança é obrigatório neste dispositivo.");
      return;
    }

    setLoading(true);

    try {
      // Monta o payload conforme esperado pelo backend
      // No seu handleFinish, tente mudar o payload para garantir que nada vá nulo:
      const payload = {
        vendedor_id: formData.vendedorId,
        venda_fechada: formData.vendaFechada,
        valor_venda: formData.vendaFechada ? parseFloat(formData.valor) : 0, // Mande 0
        metricanome: formData.vendaFechada
          ? "Venda Concretizada"
          : formData.motivo || "Não informado",
        cliente_nome: formData.clienteNome || "Nao identificado",
        observacoes: formData.observacoes || "",
      };

      await api.post("/api/core/atendimentos/", payload);

      alert("Atendimento registrado com sucesso!");
      navigate(user?.cargo === "DISPOSITIVO" ? "/registrar" : "/dashboard", {
        replace: true,
      });
      // Reseta o form para o dispositivo
      if (user?.cargo === "DISPOSITIVO") {
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
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erro ao registrar atendimento. Verifique os dados.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isSupervisor = user?.cargo === "SUPERVISOR";
  const isDispositivo = user?.cargo === "DISPOSITIVO";

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-blue-50 overflow-hidden">
        {/* Header do Card */}
        <div className="bg-[#4D7BAB]/5 px-10 py-8 border-b border-blue-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#4D7BAB] rounded-2xl text-white shadow-lg shadow-blue-900/20">
              <ClipboardCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Registro de Atendimento
              </h1>
              <p className="text-base text-slate-500 mt-1">
                Preencha os dados para documentar a visita.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-full shadow-inner hidden sm:flex">
            <span
              className={clsx(
                "w-3 h-3 rounded-full",
                step >= 1 ? "bg-[#4D7BAB]" : "bg-slate-200",
              )}
            ></span>
            <span
              className={clsx(
                "w-3 h-3 rounded-full",
                step >= 2 ? "bg-[#4D7BAB]" : "bg-slate-200",
              )}
            ></span>
            <span
              className={clsx(
                "w-3 h-3 rounded-full",
                step >= 3 ? "bg-[#4D7BAB]" : "bg-slate-200",
              )}
            ></span>
            <span className="text-sm font-semibold text-[#4D7BAB] ml-2">
              Passo {step} de 3
            </span>
          </div>
        </div>

        {/* Mensagem de Erro Global */}
        {error && (
          <div className="mx-10 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Área de Conteúdo */}
        <div className="p-10 min-h-[400px] flex flex-col justify-center bg-white">
          {/* PASSO 1: SELEÇÃO DE VENDEDOR (Oculto para Vendedor) */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-2xl mx-auto">
                <Building
                  className="mx-auto text-[#4D7BAB]/40 mb-4"
                  size={48}
                  strokeWidth={1}
                />
                <h3 className="text-2xl font-semibold text-slate-800">
                  Quem está realizando o atendimento?
                </h3>
                <p className="text-slate-500 mt-2">
                  Selecione o seu nome na lista abaixo para iniciar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#4D7BAB] hover:bg-blue-50/50 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#4D7BAB] group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <span className="font-semibold text-slate-700 text-lg group-hover:text-[#4D7BAB]">
                      {v.first_name} {v.last_name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 2: RESULTADO (SIM/NÃO) */}
          {step === 2 && (
            <div className="space-y-10 text-center animate-in slide-in-from-right duration-300">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-slate-800">
                  Qual foi o desfecho da visita?
                </h3>
              </div>
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
                  <div>
                    <span className="text-2xl font-extrabold text-emerald-800 block">
                      Sim, Venda Concretizada! 💎
                    </span>
                    <span className="text-emerald-600 mt-1 block">
                      O cliente levou o produto.
                    </span>
                  </div>
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
                  <div>
                    <span className="text-2xl font-extrabold text-rose-800 block">
                      Não houve venda
                    </span>
                    <span className="text-rose-600 mt-1 block">
                      Cliente pesquisou ou não gostou.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3: FINALIZAÇÃO */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-300 max-w-4xl mx-auto w-full space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-slate-800">
                  Detalhes Finais
                </h3>
                <p className="text-lg text-slate-500">
                  Vendedor:{" "}
                  <span className="font-semibold text-[#4D7BAB]">
                    {formData.vendedorNome}
                  </span>
                </p>
              </div>

              {formData.vendaFechada ? (
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
                  <div className="flex items-center gap-4">
                    <DollarSign className="text-emerald-500" size={32} />
                    <label className="text-xl font-semibold text-slate-700">
                      Valor total da venda:
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-slate-400 font-bold">
                      R$
                    </span>
                    <input
                      type="number"
                      autoFocus
                      className="w-full text-5xl font-extrabold p-8 pl-24 bg-white border-2 border-slate-200 rounded-3xl focus:border-[#4D7BAB] focus:ring-4 outline-none text-[#4D7BAB]"
                      value={formData.valor}
                      onChange={(e) =>
                        setFormData({ ...formData, valor: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <MessageSquare className="text-rose-500" size={32} />
                    <label className="text-xl font-semibold text-slate-700">
                      Qual foi o motivo principal?
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {MOTIVOS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setFormData({ ...formData, motivo: m })}
                        className={`p-5 text-left text-lg rounded-2xl border-2 transition-all ${formData.motivo === m ? "border-[#4D7BAB] bg-blue-50 text-[#4D7BAB] font-bold" : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DADOS DE CRM E PIN */}
              <div className="mt-10 pt-10 border-t border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Nome do Cliente (Opcional)
                    </label>
                    <div className="relative group">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#4D7BAB] outline-none"
                        value={formData.clienteNome}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clienteNome: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Observações (Opcional)
                    </label>
                    <div className="relative group">
                      <MessageSquare
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#4D7BAB] outline-none"
                        value={formData.observacoes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            observacoes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Exclusivo para DISPOSITIVO: Campo de PIN */}
                {isDispositivo && (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 mt-6">
                    <div className="flex items-center gap-3 text-amber-700">
                      <Lock size={28} />
                      <div>
                        <p className="font-bold">Confirmação de Identidade</p>
                        <p className="text-sm">
                          Insira seu PIN de 4 dígitos para assinar este
                          registro.
                        </p>
                      </div>
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="****"
                      className="w-full sm:w-32 text-center text-2xl tracking-widest font-bold py-3 bg-white border-2 border-amber-200 rounded-xl focus:border-amber-500 outline-none"
                      value={formData.pin}
                      onChange={(e) =>
                        setFormData({ ...formData, pin: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Botão Finalizar */}
              <div className="pt-8 text-center">
                <button
                  onClick={handleFinish}
                  disabled={loading || isSupervisor}
                  className="px-12 py-6 bg-[#4D7BAB] text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-[#3a5d82] active:scale-[0.98] w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Concluir Registro do Atendimento"
                  )}
                </button>
                {isSupervisor && (
                  <p className="text-sm text-slate-400 mt-3">
                    Supervisores possuem acesso apenas de leitura.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de navegação */}
        {step > 1 && !(step === 2 && user?.cargo === "VENDEDOR") && (
          <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-start">
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2.5 text-slate-500 hover:text-[#4D7BAB] font-semibold text-base transition-colors p-2 rounded-lg hover:bg-white"
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
