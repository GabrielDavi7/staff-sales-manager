import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock do POST de Atendimentos
  http.post("*/api/core/atendimentos/", () => {
    return HttpResponse.json(
      { message: "Atendimento registrado" },
      { status: 201 },
    );
  }),

  // Mock do Vendedor (Meu Desempenho)
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
          vendedorfirst_name: "Gabriel",
          metricanome: "Apenas pesquisando",
          venda_fechada: false,
          valor_venda: null,
        },
      ],
    });
  }),

  // Mock do Supervisor (Loja)
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

  // Mock do Admin (Geral)
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
