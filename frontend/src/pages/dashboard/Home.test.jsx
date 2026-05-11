import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Home } from "./Home";
import { useAuth } from "../../contexts/AuthContext";
import { server } from "../../test/mocks/server";
import { http, HttpResponse } from "msw";

// Mock do react-router-dom e AuthContext
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Página Dashboard (Home)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve redirecionar se o cargo for DISPOSITIVO", () => {
    useAuth.mockReturnValue({ user: { cargo: "DISPOSITIVO" } });
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/registrar", {
      replace: true,
    });
  });

  it("deve exibir o spinner de carregamento inicialmente", () => {
    useAuth.mockReturnValue({ user: { cargo: "VENDEDOR" } });
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/carregando painel de métricas/i),
    ).toBeInTheDocument();
  });

  it("deve exibir os dados da API para um VENDEDOR", async () => {
    useAuth.mockReturnValue({ user: { cargo: "VENDEDOR" } });
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // Aguarda o loading sumir e a tela carregar os dados do mock (15000 = R$ 15.000,00)
    await waitFor(() => {
      expect(screen.getByText("Visão Geral")).toBeInTheDocument();
    });

    expect(screen.getByText(/R\$\s*15\.000,00/i)).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument(); // 12 concluidas + 3 perdidas
    expect(screen.getByText("80%")).toBeInTheDocument(); // 12 / 15 * 100
  });

  it("deve exibir mensagem de erro caso a API falhe (500)", async () => {
    useAuth.mockReturnValue({ user: { cargo: "ADMIN" } });

    // Sobrescreve o MSW apenas para este teste
    server.use(
      http.get("*/api/analytics/geral/", () => {
        return HttpResponse.json({ message: "Erro interno" }, { status: 500 });
      }),
    );

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro na Comunicação/i)).toBeInTheDocument();
    });
  });
});
