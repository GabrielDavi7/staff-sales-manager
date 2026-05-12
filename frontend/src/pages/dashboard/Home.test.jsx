import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Home } from "./Home"; // <-- CHAVES ADICIONADAS AQUI!
import { BrowserRouter } from "react-router-dom";

// FORÇAR O USUÁRIO LOGADO PARA O TESTE NÃO FICAR PRESO NO LOADING
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, first_name: "Gabriel", cargo: "ADMIN" },
    loading: false,
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

const renderWithProviders = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Página Dashboard (Home)", () => {
  it("deve carregar e exibir o painel gerencial", async () => {
    renderWithProviders(<Home />);

    // Agora ele vai encontrar, pois o user.cargo 'ADMIN' está mockado
    await waitFor(
      () => {
        expect(screen.getByText(/Painel Gerencial/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("deve exibir mensagem de erro caso a API falhe", async () => {
    // Para este teste, vamos importar o server dinamicamente
    const { server } = await import("../../test/mocks/server");
    const { http, HttpResponse } = await import("msw");

    server.use(
      http.get("*/api/analytics/*", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText(/Não foi possível carregar as métricas/i),
      ).toBeInTheDocument();
    });
  });
});
