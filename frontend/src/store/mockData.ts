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

export const INITIAL_DATA: Attendance[] = [
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "11:00",
    salesperson: "Caio Dias",
    client: "Fernanda Souza",
    phone: "(21) 99876-1234",
    value: 8200,
    status: "Venda concretizada",
    observations:
      "Compra de anel de ouro 18k. Cliente pediu embalagem para presente.",
  },
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "14:20",
    salesperson: "Caio Dias",
    client: "Ricardo Alves",
    phone: "(31) 91234-5678",
    value: 5600,
    status: "Cliente não respondeu mais",
    observations:
      "Cliente interessado em pulseira masculina. Aguardando retorno.",
  },

  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "09:45",
    salesperson: "Pedro Braga",
    client: "Juliana Martins",
    phone: "(41) 97654-3210",
    value: 12300,
    status: "Venda concretizada",
    observations: "Relógio importado. Cliente fidelizada.",
  },
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "16:10",
    salesperson: "Pedro Braga",
    client: "Carlos Eduardo",
    phone: "(51) 98888-7777",
    value: 4300,
    status: "Cliente não concordou com o plano de pagamento",
    observations: "Cliente desistiu por condições de parcelamento.",
  },

  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "13:30",
    salesperson: "Gabriel Davi",
    client: "Patricia Lima",
    phone: "(61) 97777-8888",
    value: 9100,
    status: "Venda concretizada",
    observations: "Brincos de diamante. Cliente elogiou atendimento.",
  },
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "17:50",
    salesperson: "Gabriel Davi",
    client: "Eduardo Nogueira",
    phone: "(71) 96666-5555",
    value: 2750,
    status: "Cliente achou o preço alto",
    observations: "Cliente avaliando opções mais baratas.",
  },

  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "10:15",
    salesperson: "Giordani Andre",
    client: "Larissa Gomes",
    phone: "(85) 95555-4444",
    value: 6700,
    status: "Venda concretizada",
    observations: "Corrente de ouro branco. Cliente pediu ajuste de tamanho.",
  },
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "15:40",
    salesperson: "Giordani Andre",
    client: "Bruno Ribeiro",
    phone: "(47) 94444-3333",
    value: 3500,
    status: "A peça foi reservada",
    observations: "Cliente vai retornar com a esposa para decisão.",
  },

  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "12:05",
    salesperson: "Lucas Santos",
    client: "Camila Freitas",
    phone: "(19) 93333-2222",
    value: 14800,
    status: "Venda concretizada",
    observations: "Aliança premium. Cliente muito satisfeita com o acabamento.",
  },
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    time: "18:25",
    salesperson: "Lucas Santos",
    client: "Rafael Teixeira",
    phone: "(27) 92222-1111",
    value: 5200,
    status: "Troca de peça (De/Para)",
    observations: "Cliente solicitou troca por outro modelo.",
  },
];

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
