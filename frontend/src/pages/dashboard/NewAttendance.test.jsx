import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NewAttendance from "./NewAttendance";
import { BrowserRouter } from "react-router-dom";

// MOCK DO USUÁRIO
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, cargo: "DISPOSITIVO" },
    loading: false,
  }),
}));

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedUsedNavigate };
});

describe("Página de Registro de Atendimento", () => {
  it("deve alternar campos corretamente entre venda fechada e não fechada", async () => {
    render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    // MUDANÇA AQUI: Procurando pelo "Botão" em vez do texto exato
    const btnVendedor = await screen.findByRole("button", {
      name: /Vendedor/i,
    });
    fireEvent.click(btnVendedor);

    // Espera a troca de tela
    await waitFor(() => {
      expect(screen.getByText(/Venda Fechada/i)).toBeInTheDocument();
    });

    // Clica no botão de venda fechada
    const btnVendaFechada = screen.getByRole("button", {
      name: /Venda Fechada/i,
    });
    fireEvent.click(btnVendaFechada);

    expect(screen.getByText(/Valor da Venda/i)).toBeInTheDocument();
  });

  it("deve exibir erro se tentar finalizar venda sem valor", async () => {
    render(
      <BrowserRouter>
        <NewAttendance />
      </BrowserRouter>,
    );

    const btnVendedor = await screen.findByRole("button", {
      name: /Vendedor/i,
    });
    fireEvent.click(btnVendedor);

    await waitFor(() => screen.getByText(/Venda Fechada/i));

    const btnVendaFechada = screen.getByRole("button", {
      name: /Venda Fechada/i,
    });
    fireEvent.click(btnVendaFechada);

    const btnConfirmar = screen.getByRole("button", {
      name: /Confirmar Registro/i,
    });
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(screen.getByText(/Informe o valor da venda/i)).toBeInTheDocument();
    });
  });
});
