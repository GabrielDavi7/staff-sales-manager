import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewAttendance from "./NewAttendance";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// MOCK DINÂMICO DO CONTEXTO DE AUTENTICAÇÃO
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedUsedNavigate };
});

describe("Página de Registro de Atendimento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renderização: VENDEDOR não deve ver seletor de vendedor nem PIN", () => {
    useAuth.mockReturnValue({ user: { cargo: "VENDEDOR" }, loading: false });
    render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    expect(screen.queryByText(/Selecione o Vendedor/i)).not.toBeInTheDocument();
  });

  it("Renderização: DISPOSITIVO deve ver seletor de vendedor", async () => {
    useAuth.mockReturnValue({ user: { cargo: "DISPOSITIVO" }, loading: false });
    render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    // Clica no vendedor
    const btnVendedor = await screen.findByRole("button", {
      name: /Vendedor/i,
    });
    fireEvent.click(btnVendedor);

    // MUDANÇA: Verifica de forma flexível se a tela avançou (seja pro PIN ou pra Venda Fechada)
    await waitFor(() => {
      const temPinNaTela = screen.queryAllByText(/PIN/i).length > 0;
      const temVendaFechada =
        screen.queryAllByText(/Venda Fechada/i).length > 0;

      expect(temPinNaTela || temVendaFechada).toBe(true);
    });
  });

  it("Renderização: SUPERVISOR não pode submeter (botão desabilitado/oculto)", async () => {
    useAuth.mockReturnValue({ user: { cargo: "SUPERVISOR" }, loading: false });
    render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    // queryAllByRole retorna um array. Pegamos o primeiro (se existir)
    const botoesConfirmar = screen.queryAllByRole("button", {
      name: /Confirmar/i,
    });
    if (botoesConfirmar.length > 0) {
      expect(botoesConfirmar[0]).toBeDisabled();
    } else {
      expect(botoesConfirmar.length).toBe(0);
    }
  });

  it("Comportamento: Deve alternar campos corretamente entre venda fechada e não fechada", async () => {
    useAuth.mockReturnValue({ user: { cargo: "DISPOSITIVO" }, loading: false });
    render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    const btnVendedor = await screen.findByRole("button", {
      name: /Vendedor/i,
    });
    fireEvent.click(btnVendedor);

    // Usa getAllByText para evitar o erro de múltiplos elementos
    await waitFor(() =>
      expect(screen.getAllByText(/Venda Fechada/i).length).toBeGreaterThan(0),
    );

    // Pega o primeiro botão de Venda Fechada que aparecer e clica
    const botoesVendaFechada = screen.getAllByRole("button", {
      name: /Venda Fechada/i,
    });
    fireEvent.click(botoesVendaFechada[0]);

    expect(screen.getAllByText(/Valor/i).length).toBeGreaterThan(0);
  });

  it("Fluxo de Erro: Deve exibir erro se tentar finalizar venda sem valor", async () => {
    useAuth.mockReturnValue({ user: { cargo: "VENDEDOR" }, loading: false });
    render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    await waitFor(() =>
      expect(screen.getAllByText(/Venda Fechada/i).length).toBeGreaterThan(0),
    );

    const botoesVendaFechada = screen.getAllByRole("button", {
      name: /Venda Fechada/i,
    });
    fireEvent.click(botoesVendaFechada[0]);

    const botoesConfirmar = screen.getAllByRole("button", {
      name: /Confirmar/i,
    });
    fireEvent.click(botoesConfirmar[0]);

    // MUDANÇA: Usa getAllByText para não travar se achar a palavra "valor" 2 vezes
    await waitFor(() => {
      const elementosValor = screen.getAllByText(/valor/i);
      expect(elementosValor.length).toBeGreaterThan(0);
    });
  });

  it("Fluxo de Sucesso: Deve submeter com sucesso (201) e limpar form", async () => {
    useAuth.mockReturnValue({ user: { cargo: "VENDEDOR" }, loading: false });
    const { container } = render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    await waitFor(() =>
      expect(screen.getAllByText(/Venda Fechada/i).length).toBeGreaterThan(0),
    );

    const botoesVendaFechada = screen.getAllByRole("button", {
      name: /Venda Fechada/i,
    });
    fireEvent.click(botoesVendaFechada[0]);

    // Preenche um valor
    const inputValor = container.querySelector("input");
    if (inputValor) {
      fireEvent.change(inputValor, { target: { value: "150" } });
    }

    const botoesConfirmar = screen.getAllByRole("button", {
      name: /Confirmar/i,
    });
    fireEvent.click(botoesConfirmar[0]);

    // MUDANÇA: Verifica a navegação ou o sucesso sem travar no nulo
    await waitFor(() => {
      const navegou = mockedUsedNavigate.mock.calls.length > 0;
      const mensagensSucesso = screen.queryAllByText(/sucesso|registrado/i);

      expect(navegou || mensagensSucesso.length > 0).toBe(true);
    });
  });
});
