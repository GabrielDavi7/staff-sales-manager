import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Phone,
  DollarSign,
  MessageSquare,
  Check,
  X,
  Tag,
} from "lucide-react";
import { AttendanceStatus, getStatusColors } from "../store/mockData";
import { useAttendance } from "../store/AttendanceContext";
import { clsx } from "clsx";

const CLASSIFICATION_OPTIONS: AttendanceStatus[] = [
  "Venda concretizada",
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

const SALESPERSONS = [
  "Caio Dias",
  "Pedro Braga",
  "Gabriel Davi",
  "Giordani Andre",
  "Lucas Santos",
];

export function NewAttendance() {
  const navigate = useNavigate();
  const { addAttendance } = useAttendance();
  const [formData, setFormData] = useState({
    client: "",
    phone: "",
    salesperson: "",
    value: "",
    observations: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(
    null,
  );

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || !formData.salesperson) {
      alert("Por favor, preencha o Nome do Cliente e o Vendedor.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleFinish = () => {
    if (!selectedStatus) {
      alert("Selecione um status de atendimento para continuar.");
      return;
    }

    const newEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      client: formData.client,
      phone: formData.phone,
      salesperson: formData.salesperson,
      value: formData.value ? parseFloat(formData.value) : null,
      status: selectedStatus,
      observations: formData.observations,
    };

    addAttendance(newEntry);
    alert("Atendimento registrado com sucesso!");
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-neutral-50/80 px-8 py-6 border-b border-neutral-100 flex flex-col gap-1">
          <h1 className="text-2xl font-serif text-neutral-900 tracking-tight">
            Registro de Atendimento
          </h1>
          <p className="text-sm text-neutral-500">
            Preencha os dados abaixo para documentar o atendimento atual.
          </p>
        </div>

        <form onSubmit={handleOpenModal} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="client"
                className="block text-sm font-medium text-neutral-700"
              >
                Nome do Cliente <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  id="client"
                  required
                  placeholder="Ex: Maria Antonieta"
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-neutral-700"
              >
                WhatsApp / Contato
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="salesperson"
                className="block text-sm font-medium text-neutral-700"
              >
                Vendedor(a) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Tag size={18} />
                </div>
                <select
                  id="salesperson"
                  required
                  value={formData.salesperson}
                  onChange={(e) =>
                    setFormData({ ...formData, salesperson: e.target.value })
                  }
                  className="block w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors appearance-none"
                >
                  <option value="" disabled>
                    Selecione um vendedor
                  </option>
                  {SALESPERSONS.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="value"
                className="block text-sm font-medium text-neutral-700"
              >
                Valor (R$){" "}
                <span className="text-neutral-400 font-normal ml-1">
                  (Opcional)
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <DollarSign size={18} />
                </div>
                <input
                  type="number"
                  id="value"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                />
              </div>
              <p className="text-xs text-neutral-500">
                Preencha se houver venda ou orçamento.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label
              htmlFor="observations"
              className="block text-sm font-medium text-neutral-700"
            >
              Observações Gerais
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none text-neutral-400">
                <MessageSquare size={18} />
              </div>
              <textarea
                id="observations"
                rows={4}
                placeholder="Detalhes sobre a preferência do cliente, peças mostradas, ou motivo da visita..."
                value={formData.observations}
                onChange={(e) =>
                  setFormData({ ...formData, observations: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors resize-y"
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 border border-transparent rounded-lg hover:bg-neutral-800 focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-colors shadow-sm"
            >
              Salvar e Classificar
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-lg font-serif font-medium text-neutral-900">
                Classificar Atendimento
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white hover:bg-neutral-100 p-1.5 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm font-medium text-neutral-800 mb-4 flex flex-col">
                Qual foi o resultado deste atendimento?
                <span className="text-xs text-neutral-500 font-normal mt-1">
                  Selecione a opção que melhor descreve o desfecho.
                </span>
              </p>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {CLASSIFICATION_OPTIONS.map((status) => (
                  <label
                    key={status}
                    className={clsx(
                      "flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all duration-200 group",
                      selectedStatus === status
                        ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10 shadow-sm"
                        : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="status_atendimento"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "flex items-center justify-center w-5 h-5 rounded-full border transition-colors",
                          selectedStatus === status
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 bg-white",
                        )}
                      >
                        {selectedStatus === status && (
                          <Check size={12} strokeWidth={3} />
                        )}
                      </div>
                      <span
                        className={clsx(
                          "text-sm font-medium transition-colors",
                          selectedStatus === status
                            ? "text-neutral-900"
                            : "text-neutral-700",
                        )}
                      >
                        {status}
                      </span>
                    </div>

                    <span
                      className={clsx(
                        "w-3 h-3 rounded-full opacity-60",
                        getStatusColors(status).split(" ")[0],
                      )}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={!selectedStatus}
                className="px-6 py-2 text-sm font-medium text-white bg-neutral-900 border border-transparent rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
              >
                <Check size={16} />
                Finalizar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
