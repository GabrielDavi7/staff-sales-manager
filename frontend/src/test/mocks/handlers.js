import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock da listagem de usuários/vendedores
  http.get("*/api/users/", () => {
    return HttpResponse.json([
      { id: 1, first_name: "Gabriel", last_name: "Davi" },
      { id: 4, first_name: "Caio", last_name: "Dias" }, // Usei ID 4 para bater com seu teste anterior
    ]);
  }),

  // Mock do envio de atendimento (Sucesso 201)
  http.post("*/api/core/atendimentos/", () => {
    return HttpResponse.json(
      { message: "Atendimento registrado" },
      { status: 201 },
    );
  }),

  // Mock de Analytics - VENDEDOR (Meu Desempenho)
  http.get("*/api/analytics/meu-desempenho/", () => {
    return HttpResponse.json({
      kpis: {
        total_vendas_valor: 15000,
        vendas_concluidas_count: 12,
        vendas_nao_concluidas_count: 3,
      },
      tabela: [
        {
          id: 1,
          data_hora: "2026-05-11T10:30:00Z",
          vendedor_first_name: "Gabriel",
          metrica_nome: "Apenas pesquisando",
          venda_fechada: false,
          valor_venda: null,
        },
      ],
    });
  }),

  // Mock de Analytics - SUPERVISOR (Loja)
  http.get("*/api/analytics/loja/", () => {
    return HttpResponse.json({
      kpis: {
        total_vendas_valor: 45000,
        vendas_concluidas_count: 35,
        vendas_nao_concluidas_count: 8,
      },
      tabela: [],
      ranking_vendedores: [],
    });
  }),

  // Mock de Analytics - ADMIN (Geral)
  http.get("*/api/analytics/geral/", () => {
    return HttpResponse.json({
      kpis: {
        total_vendas_valor: 120000,
        vendas_concluidas_count: 90,
        vendas_nao_concluidas_count: 15,
      },
      tabela: [],
      comparativo_lojas: [],
    });
  }),
];
