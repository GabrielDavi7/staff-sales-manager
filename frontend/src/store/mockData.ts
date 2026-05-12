export type AttendanceStatus =
  | "Venda concretizada"
  | "Cliente não encontrou o produto"
  | "Cliente não encontrou o tamanho"
  | "Cliente não gostou do modelo"
  | "Cliente não concordou com o plano de pagamento"
  | "Cliente achou o preço alto"
  | "A peça foi reservada"
  | "Pesquisa do cliente"
  | "Cliente não respondeu mais"
  | "Troca de peça (De/Para)"
  | "Atendimento via WhatsApp";

export interface Attendance {
  id: string;
  date: string;
  time: string;
  salesperson: string;
  client: string;
  phone: string;
  value: number | null;
  status: AttendanceStatus;
  observations: string;
}

export const getStatusColors = (status: AttendanceStatus) => {
  switch (status) {
    case "Venda concretizada":
      return "bg-green-50 text-green-700 border-green-200 ring-green-600/20";
    case "A peça foi reservada":
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
    case "Cliente achou o preço alto":
    case "Cliente não concordou com o plano de pagamento":
      return "bg-red-50 text-red-700 border-red-200 ring-red-600/20";
    case "Cliente não encontrou o produto":
    case "Cliente não encontrou o tamanho":
    case "Cliente não gostou do modelo":
      return "bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20";
    case "Pesquisa do cliente":
      return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
    case "Atendimento via WhatsApp":
      return "bg-teal-50 text-teal-700 border-teal-200 ring-teal-600/20";
    case "Troca de peça (De/Para)":
      return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20";
    case "Cliente não respondeu mais":
      return "bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20";
  }
};
