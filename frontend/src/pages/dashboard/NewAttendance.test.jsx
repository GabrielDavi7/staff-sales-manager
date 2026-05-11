import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewAttendance from "./NewAttendance";
import { useAuth } from "../../contexts/AuthContext";
import { server } from "../../test/mocks/server";
import { http, HttpResponse } from "msw";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Página de Registro de Atendimento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve pular o passo 1 se for VENDEDOR e ir direto para o desfecho", () => {
    useAuth.mockReturnValue({
      user: { id: 1, nome: "Vendedor Teste", cargo: "VENDEDOR" },
    });
    render(
      <MemoryRouter>
        <NewAttendance />
      </MemoryRouter>,
    );

    expect(
      screen.queryByText(/Quem está realizando o atendimento/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Qual foi o desfecho da visita/i),
    ).toBeInTheDocument();
  });

  it("deve exibir o campo de PIN apenas para DISPOSITIVO e bloquear submissão sem ele", async () => {
    useAuth.mockReturnValue({ user: { cargo: "DISPOSITIVO" } });
    render(
      <MemoryRouter>
        <NewAttendance />
      </MemoryRouter>,
    );

    // Mock clicando no fallback de vendedor
    await waitFor(() => screen.getByText(/Gabriel/i));
    fireEvent.click(screen.getByText(/Gabriel/i));

    // Passo 2: Clica em venda não realizada
    fireEvent.click(screen.getByText(/Não houve venda/i));

    // Passo 3: O PIN deve aparecer
    expect(screen.getByText(/Confirmação de Identidade/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Preço alto/i));

    // Tenta submeter sem PIN
    fireEvent.click(screen.getByText(/Concluir Registro/i));
    expect(
      await screen.findByText(/O PIN de segurança é obrigatório/i),
    ).toBeInTheDocument();
  });

  it("deve alternar campos corretamente entre venda fechada e não fechada", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, nome: "Vendedor Teste", cargo: "VENDEDOR" },
    });
    render(
      <MemoryRouter>
        <NewAttendance />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/Sim, Venda Concretizada!/i));
    expect(screen.getByText(/Valor total da venda/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Qual foi o motivo principal/i),
    ).not.toBeInTheDocument();

    // Volta e seleciona Não
    fireEvent.click(screen.getByText(/Voltar/i));
    fireEvent.click(screen.getByText(/Não houve venda/i));
    expect(
      screen.getByText(/Qual foi o motivo principal/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Valor total da venda/i)).not.toBeInTheDocument();
  });

  it("botão de concluir deve ficar desabilitado para SUPERVISOR", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, nome: "Sup Teste", cargo: "SUPERVISOR" },
    });
    render(
      <MemoryRouter>
        <NewAttendance />
      </MemoryRouter>,
    );

    // Seleciona um vendedor qualquer
    await waitFor(() => screen.getByText(/Gabriel/i));
    fireEvent.click(screen.getByText(/Gabriel/i));

    fireEvent.click(screen.getByText(/Sim, Venda Concretizada!/i));

    const button = screen.getByRole("button", {
      name: /Concluir Registro do Atendimento/i,
    });
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/Supervisores possuem acesso apenas de leitura/i),
    ).toBeInTheDocument();
  });
});
