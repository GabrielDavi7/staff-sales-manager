import { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Clock,
  User,
  Phone,
  DollarSign,
  MessageSquare,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { getStatusColors } from "../store/mockData";
import { useAttendance } from "../store/AttendanceContext";
import { MetricCard } from "../components/MetricCard";
import { clsx } from "clsx";

export function Dashboard() {
  const [search, setSearch] = useState("");
  const { attendances, deleteAttendance } = useAttendance();

  const filteredData = attendances.filter(
    (item) =>
      item.client.toLowerCase().includes(search.toLowerCase()) ||
      item.salesperson.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase()),
  );

  const totalValue = filteredData.reduce(
    (acc, curr) => acc + (curr.value || 0),
    0,
  );
  const conversionRate =
    filteredData.length > 0
      ? Math.round(
          (filteredData.filter((d) => d.status === "Venda concretizada")
            .length /
            filteredData.length) *
            100,
        )
      : 0;

  const handleDelete = (id: string, clientName: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o atendimento de ${clientName}?`,
      )
    ) {
      deleteAttendance(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 font-medium tracking-tight">
            Atendimentos do Dia
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gerencie os registros de vendas e intenções de compra.
          </p>
        </div>
        <Link
          to="/novo-atendimento"
          className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow active:scale-95"
        >
          <Plus size={18} />
          Novo Atendimento
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total em Vendas (Dia)"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalValue)}
        />
        <MetricCard title="Total de Atendimentos" value={filteredData.length} />
        <MetricCard title="Taxa de Conversão" value={`${conversionRate}%`} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50/50">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por cliente, vendedor ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors w-full sm:w-auto justify-center shadow-sm">
            <Filter size={16} />
            Filtros
            <ChevronDown size={14} className="ml-1 text-neutral-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80">
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider w-[80px]">
                  Hora
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider min-w-[150px]">
                  Vendedor
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider min-w-[160px]">
                  Cliente
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider min-w-[140px]">
                  Telefone
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider min-w-[130px]">
                  Valor
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider min-w-[200px]">
                  Status
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Observação
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right w-[120px]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-neutral-500"
                  >
                    <Search
                      className="mx-auto mb-3 text-neutral-300"
                      size={32}
                    />
                    Nenhum atendimento encontrado.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-neutral-50/50 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-sm text-neutral-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-neutral-400" />
                        {row.time}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500">
                          <User size={12} />
                        </div>
                        <span className="text-sm font-medium text-neutral-900">
                          {row.salesperson}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-sm text-neutral-700 font-medium">
                      {row.client}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-neutral-400" />
                        {row.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {row.value && row.value > 0 ? (
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-emerald-500" />
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(row.value)}
                        </div>
                      ) : (
                        <span className="text-neutral-400 font-normal ml-5">
                          -
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset shadow-sm",
                          getStatusColors(row.status),
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-neutral-500 max-w-[250px]">
                      <div className="flex items-start gap-2">
                        <MessageSquare
                          size={14}
                          className="text-neutral-400 shrink-0 mt-0.5"
                        />
                        <span
                          className="truncate group-hover:whitespace-normal group-hover:break-words transition-all duration-300"
                          title={row.observations}
                        >
                          {row.observations || (
                            <span className="text-neutral-300 italic">
                              Sem observações
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* 👇 Aqui está a nova área de botões clicáveis 👇 */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/atendimento/${row.id}`}
                          className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/editar-atendimento/${row.id}`}
                          className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(row.id, row.client)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    {/* 👆 Fim da nova área 👆 */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-neutral-100 px-4 py-3 bg-neutral-50/50 flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            Mostrando{" "}
            <span className="font-medium text-neutral-900">
              {filteredData.length}
            </span>{" "}
            atendimentos
          </span>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 border border-neutral-200 rounded-md bg-white text-sm text-neutral-600 shadow-sm disabled:opacity-50"
              disabled
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 border border-neutral-200 rounded-md bg-white text-sm text-neutral-600 shadow-sm disabled:opacity-50"
              disabled
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
