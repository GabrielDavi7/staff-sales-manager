import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  User,
  Phone,
  DollarSign,
  Clock,
  Calendar,
  MessageSquare,
  Tag,
  Search,
} from "lucide-react";
import { getStatusColors } from "../store/mockData";
import { useAttendance } from "../store/AttendanceContext";
import { clsx } from "clsx";

export function AttendanceDetails() {
  const { id } = useParams();
  const { attendances } = useAttendance();
  const attendance = attendances.find((item) => item.id === id);

  if (!attendance) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mb-4">
          <Search size={24} />
        </div>
        <h2 className="text-xl font-serif text-neutral-900 font-medium">
          Atendimento não encontrado
        </h2>
        <p className="text-sm text-neutral-500 mt-2 text-center max-w-sm">
          O registro que você está tentando acessar não existe ou foi removido.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 -ml-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 font-medium tracking-tight">
            Detalhes do Atendimento
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-2">
            ID: {attendance.id} • Registrado em{" "}
            {attendance.date.split("-").reverse().join("/")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span
            className={clsx(
              "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-inset shadow-sm",
              getStatusColors(attendance.status),
            )}
          >
            {attendance.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                Informações do Cliente
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                    Nome
                  </p>
                  <p className="text-base text-neutral-900 font-medium mt-0.5">
                    {attendance.client}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                    Contato
                  </p>
                  <p className="text-base text-neutral-900 font-medium mt-0.5">
                    {attendance.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                Observações do Atendimento
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <MessageSquare
                  className="text-neutral-400 mt-1 shrink-0"
                  size={20}
                />
                <p className="text-neutral-700 leading-relaxed">
                  {attendance.observations || (
                    <span className="text-neutral-400 italic">
                      Nenhuma observação registrada.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                Detalhes Comerciais
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium flex items-center gap-1.5 mb-1">
                  <DollarSign size={14} /> Valor
                </p>
                <p className="text-2xl font-serif text-neutral-900">
                  {attendance.value ? (
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(attendance.value)
                  ) : (
                    <span className="text-neutral-400 text-lg">-</span>
                  )}
                </p>
              </div>

              <hr className="border-neutral-100" />

              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium flex items-center gap-1.5 mb-1">
                  <Tag size={14} /> Vendedor Responsável
                </p>
                <p className="text-sm text-neutral-900 font-medium">
                  {attendance.salesperson}
                </p>
              </div>

              <hr className="border-neutral-100" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium flex items-center gap-1.5 mb-1">
                    <Calendar size={14} /> Data
                  </p>
                  <p className="text-sm text-neutral-900 font-medium">
                    {attendance.date.split("-").reverse().join("/")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium flex items-center gap-1.5 mb-1">
                    <Clock size={14} /> Hora
                  </p>
                  <p className="text-sm text-neutral-900 font-medium">
                    {attendance.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
