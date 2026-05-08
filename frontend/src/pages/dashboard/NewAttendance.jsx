import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  DollarSign,
  MessageSquare,
  ClipboardCheck,
  Building,
} from "lucide-react";

// Mock de dados (depois substituiremos pela API)
const MOTIVOS = [
  "Apenas pesquisando",
  "Preço alto",
  "Falta de estoque",
  "Não gostou do modelo",
  "Volta depois",
  "Condição de pagamento",
  "Atendimento rápido/Dúvida",
];

const VENDEDORES = [
  { id: 1, nome: "Gabriel Davi" },
  { id: 2, nome: "Caio Dias" },
  { id: 3, nome: "Pedro Braga" },
  { id: 4, nome: "Lucas Santos" },
  { id: 5, nome: "Ana Silva" },
  { id: 6, nome: "Bia Souza" },
];

const NewAttendance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vendedorId: null,
    vendedorNome: "",
    vendaFechada: null,
    valor: "",
    motivo: "",
    clienteNome: "",
    observacoes: "",
  });

  const handleFinish = () => {
    // Validação básica apenas para os campos obrigatórios
    if (formData.vendaFechada && !formData.valor) {
      alert("Por favor, informe o valor da venda.");
      return;
    }
    if (formData.vendaFechada === false && !formData.motivo) {
      alert("Por favor, selecione o motivo do não fechamento.");
      return;
    }

    console.log("Enviando para API:", formData);
    alert("Atendimento registrado com sucesso!");
    navigate("/"); // Volta para o Dashboard
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Card Principal */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-blue-50 overflow-hidden">
        {/* Header do Card */}
        <div className="bg-primary/5 px-10 py-8 border-b border-blue-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
              <ClipboardCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Registro de Atendimento
              </h1>
              <p className="text-base text-slate-500 mt-1">
                Preencha os dados passo a passo para documentar a visita.
              </p>
            </div>
          </div>
          {/* Indicador de Progresso Visual */}
          <div className="flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-full shadow-inner">
            <span
              className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-primary" : "bg-slate-200"}`}
            ></span>
            <span
              className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-primary" : "bg-slate-200"}`}
            ></span>
            <span
              className={`w-3 h-3 rounded-full ${step >= 3 ? "bg-primary" : "bg-slate-200"}`}
            ></span>
            <span className="text-sm font-semibold text-primary ml-2">
              Passo {step} de 3
            </span>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="p-10 min-h-[400px] flex flex-col justify-center bg-white">
          {/* PASSO 1: SELEÇÃO DE VENDEDOR */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-2xl mx-auto">
                <Building
                  className="mx-auto text-primary/40 mb-4"
                  size={48}
                  strokeWidth={1}
                />
                <h3 className="text-2xl font-semibold text-slate-800">
                  Quem está realizando o atendimento?
                </h3>
                <p className="text-slate-500 mt-2">
                  Selecione o seu nome na lista abaixo para iniciar o registro.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {VENDEDORES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        vendedorId: v.id,
                        vendedorNome: v.nome,
                      });
                      setStep(2);
                    }}
                    className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-primary hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-100/50 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                      <User size={24} />
                    </div>
                    <span className="font-semibold text-slate-700 text-lg group-hover:text-primary-dark">
                      {v.nome}
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
                <p className="text-lg text-slate-500 mt-3">
                  O cliente concretizou a compra ou foi apenas uma consulta?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <button
                  onClick={() => {
                    setFormData({ ...formData, vendaFechada: true });
                    setStep(3);
                  }}
                  className="group flex flex-col items-center gap-6 p-10 bg-emerald-50 border-2 border-emerald-100 rounded-3xl hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-100 transition-all text-center"
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
                  className="group flex flex-col items-center gap-6 p-10 bg-rose-50 border-2 border-rose-100 rounded-3xl hover:border-rose-500 hover:shadow-xl hover:shadow-rose-100 transition-all text-center"
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

          {/*FINALIZAÇÃO (VALOR OU MOTIVO + CRM) */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-300 max-w-4xl mx-auto w-full space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-slate-800">
                  Detalhes Finais
                </h3>
                <p className="text-lg text-slate-500 mt-2">
                  Vendedor:{" "}
                  <span className="font-semibold text-primary">
                    {formData.vendedorNome}
                  </span>
                </p>
              </div>

              {formData.vendaFechada ? (
                /* RAMO: VENDA REALIZADA */
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner space-y-6">
                  <div className="flex items-center gap-4">
                    <DollarSign className="text-emerald-500" size={32} />
                    <label className="block text-xl font-semibold text-slate-700">
                      Valor total da venda concretizada:
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-slate-400 font-bold">
                      R$
                    </span>
                    <input
                      type="number"
                      placeholder="0,00"
                      autoFocus
                      className="w-full text-5xl font-extrabold p-8 pl-24 bg-white border-2 border-slate-200 rounded-3xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-primary tracking-tight shadow-sm"
                      value={formData.valor}
                      onChange={(e) =>
                        setFormData({ ...formData, valor: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : (
                /* RAMO: VENDA NÃO REALIZADA */
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <MessageSquare className="text-rose-500" size={32} />
                    <label className="block text-xl font-semibold text-slate-700">
                      Qual foi o motivo principal?
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {MOTIVOS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setFormData({ ...formData, motivo: m })}
                        className={`p-5 text-left text-lg rounded-2xl border-2 transition-all shadow-sm ${formData.motivo === m ? "border-primary bg-blue-50 text-primary font-bold ring-2 ring-primary/20" : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DADOS ADICIONAIS DE CRM (Opcionais) */}
              <div className="mt-10 pt-10 border-t border-slate-100 space-y-6">
                <h4 className="text-xl font-semibold text-slate-800">
                  Dados do Cliente{" "}
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    (Opcional)
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome do Cliente */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                      Nome
                    </label>
                    <div className="relative group">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Ex: Maria Antonieta"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-slate-700 font-medium"
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

                  {/* Observações */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                      Observações da Visita
                    </label>
                    <div className="relative group">
                      <MessageSquare
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Ex: Mostrou interesse em alianças de ouro"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-slate-700 font-medium"
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
              </div>

              {/* Botão Finalizar */}
              <div className="pt-8 text-center">
                <button
                  onClick={handleFinish}
                  className="px-12 py-6 bg-primary text-white rounded-2xl font-bold text-xl shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all active:scale-[0.98] w-full md:w-auto"
                >
                  Concluir Registro do Atendimento
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de navegação */}
        {step > 1 && (
          <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-start">
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2.5 text-slate-500 hover:text-primary font-semibold text-base transition-colors p-2 rounded-lg hover:bg-white"
            >
              <ChevronLeft size={22} />
              Voltar e corrigir passo anterior
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAttendance;
