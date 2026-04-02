import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  User,
  Phone,
  DollarSign,
  MessageSquare,
  Check,
  X,
  Tag,
  ArrowLeft,
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

export function EditAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { attendances, updateAttendance } = useAttendance();

  // Busca o atendimento existente
  const attendanceToEdit = attendances.find((item) => item.id === id);

  const [formData, setFormData] = useState({
    client: "",
    phone: "",
    salesperson: "",
    value: "",
    observations: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preenche o formulário quando a tela carrega
  useEffect(() => {
    if (attendanceToEdit) {
      setFormData({
        client: attendanceToEdit.client,
        phone: attendanceToEdit.phone,
        salesperson: attendanceToEdit.salesperson,
        value: attendanceToEdit.value ? attendanceToEdit.value.toString() : "",
        observations: attendanceToEdit.observations,
      });
      setSelectedStatus(attendanceToEdit.status);
    }
  }, [attendanceToEdit]);

  if (!attendanceToEdit) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Atendimento não encontrado.
      </div>
    );
  }

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleFinish = () => {
    if (!selectedStatus) return;

    updateAttendance(id as string, {
      client: formData.client,
      phone: formData.phone,
      salesperson: formData.salesperson,
      value: formData.value ? parseFloat(formData.value) : null,
      status: selectedStatus,
      observations: formData.observations,
    });

    alert("Atendimento atualizado com sucesso!");
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="p-2 -ml-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-serif text-neutral-900 tracking-tight">
          Editar Atendimento
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <form onSubmit={handleOpenModal} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="client"
                className="block text-sm font-medium text-neutral-700"
              >
                Nome do Cliente *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900"
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
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="salesperson"
                className="block text-sm font-medium text-neutral-700"
              >
                Vendedor(a) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Tag size={18} />
                </div>
                <select
                  required
                  value={formData.salesperson}
                  onChange={(e) =>
                    setFormData({ ...formData, salesperson: e.target.value })
                  }
                  className="block w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 appearance-none"
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
                Valor (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <DollarSign size={18} />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900"
                />
              </div>
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
                rows={4}
                value={formData.observations}
                onChange={(e) =>
                  setFormData({ ...formData, observations: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 resize-y"
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg hover:bg-amber-700 shadow-sm"
            >
              Reclassificar e Salvar
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-lg font-serif font-medium text-neutral-900">
                Atualizar Status
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 bg-white hover:bg-neutral-100 p-1.5 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {CLASSIFICATION_OPTIONS.map((status) => (
                  <label
                    key={status}
                    className={clsx(
                      "flex items-center justify-between p-3 border rounded-xl cursor-pointer group",
                      selectedStatus === status
                        ? "border-amber-600 bg-amber-50/30 ring-1 ring-amber-600/10 shadow-sm"
                        : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="status_edit"
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
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-neutral-300 bg-white",
                        )}
                      >
                        {selectedStatus === status && (
                          <Check size={12} strokeWidth={3} />
                        )}
                      </div>
                      <span
                        className={clsx(
                          "text-sm font-medium",
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
                className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Voltar
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg hover:bg-amber-700 shadow-sm flex items-center gap-2"
              >
                <Check size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
