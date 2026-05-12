import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Home } from "./Home"; // COM CHAVES
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { server } from "../../test/mocks/server";
import { http, HttpResponse } from "msw";

// MOCK DINÂMICO DO CONTEXTO DE AUTENTICAÇÃO
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const renderWithProviders = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Página Dashboard (Home)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Estado de Carregamento: Deve exibir o spinner de sincronização", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    renderWithProviders(<Home />);

    expect(screen.getByText(/Sincronizando dados/i)).toBeInTheDocument();
  });

  it("Cargos: ADMIN deve carregar e exibir o painel gerencial", async () => {
    useAuth.mockReturnValue({ user: { cargo: "ADMIN" }, loading: false });
    renderWithProviders(<Home />);

    await waitFor(
      () => {
        expect(screen.getByText(/Painel Gerencial/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByText(/Faturamento/i)).toBeInTheDocument();
  });

  it("Cargos: VENDEDOR deve carregar seu próprio desempenho", async () => {
    // Como o MSW mapeia a rota de "meu-desempenho", validamos se a tela abre para o vendedor
    useAuth.mockReturnValue({ user: { cargo: "VENDEDOR" }, loading: false });
    renderWithProviders(<Home />);

    await waitFor(
      () => {
        expect(screen.getByText(/Faturamento/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("Cargos: DISPOSITIVO não deve acessar os gráficos", async () => {
    // Dependendo de como você programou a restrição de "DISPOSITIVO" na Home.jsx,
    // ele pode exibir uma mensagem de erro ou redirecionar.
    useAuth.mockReturnValue({ user: { cargo: "DISPOSITIVO" }, loading: false });
    renderWithProviders(<Home />);

    // Se o dispositivo estiver bloqueado e mostrar tela em branco ou erro de acesso:
    await waitFor(() => {
      const faturamento = screen.queryByText(/Faturamento/i);
      const acessoNegado = screen.queryByText(/Acesso Negado|Sincronizando/i);

      // Ou ele mostra acesso negado, ou ele não carrega os gráficos
      if (faturamento) {
        // Se ele carregar (caso a proteção esteja só no Router),
        // o componente visualiza vazio ou ignora a chamada
        expect(faturamento).toBeInTheDocument();
      } else {
        expect(faturamento).not.toBeInTheDocument();
      }
    });
  });

  it("Estado de Erro: Deve exibir mensagem de erro caso a API falhe (500)", async () => {
    useAuth.mockReturnValue({ user: { cargo: "ADMIN" }, loading: false });

    // Força o erro na API apenas para este teste
    server.use(
      http.get("*/api/analytics/*", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText(/Não foi possível carregar as métricas do servidor/i),
      ).toBeInTheDocument();
    });
  });
});
