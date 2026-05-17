import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CriarLoja from "./CriarLoja";
import GerenciarStatus from "./GerenciarStatus";
import api from "../../api/axios";

// =========================================================
// MOCKS GLOBAIS
// =========================================================
vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const renderWithProviders = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("Painel Admin - Gestão de Lojas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------
  // CRIAÇÃO (CriarLoja.jsx)
  // ---------------------------------------------------------
  describe("Criação de Loja", () => {
    it("Deve preencher formulário, criar loja (POST 201) e chamar onBack", async () => {
      const mockOnBack = vi.fn();
      api.post.mockResolvedValueOnce({ status: 201 });
      window.alert = vi.fn();

      renderWithProviders(<CriarLoja onBack={mockOnBack} />);

      // Preenche formulário
      fireEvent.change(
        screen.getByPlaceholderText("Ex: Loja Diamond - Shopping Sul"),
        { target: { value: "Loja Teste" } },
      );
      fireEvent.change(screen.getByPlaceholderText("Ex: Montes Claros"), {
        target: { value: "Belo Horizonte" },
      });

      // Submete
      fireEvent.click(screen.getByRole("button", { name: /Salvar Loja/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/api/admin/lojas/", {
          nome: "Loja Teste",
          cidade: "Belo Horizonte",
        });
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("cadastrada com sucesso"),
        );
        expect(mockOnBack).toHaveBeenCalled();
      });
    });
  });

  describe("Listagem e Soft Delete de Lojas", () => {
    beforeEach(() => {
      api.get.mockImplementation((url) => {
        if (url === "/api/admin/lojas/")
          return Promise.resolve({
            data: [
              {
                id: 10,
                nome: "Loja Matriz",
                cidade: "Montes Claros",
                ativo: true,
              },
            ],
          });
        return Promise.resolve({ data: [] });
      });
    });

    it("Deve listar as lojas corretamente na aba Lojas", async () => {
      renderWithProviders(<GerenciarStatus onBack={vi.fn()} />);

      const btnLojas = await screen.findByRole("button", { name: /Lojas/i });
      fireEvent.click(btnLojas);

      await waitFor(() => {
        expect(screen.getByText("Loja Matriz")).toBeInTheDocument();
        expect(screen.getByText("Montes Claros")).toBeInTheDocument();
      });
    });

    it("Deve ativar/desativar loja via PATCH (Soft Delete)", async () => {
      api.patch.mockResolvedValueOnce({ status: 200 });

      renderWithProviders(<GerenciarStatus onBack={vi.fn()} />);

      const btnLojas = await screen.findByRole("button", { name: /Lojas/i });
      fireEvent.click(btnLojas);

      await waitFor(() =>
        expect(screen.getByText("Loja Matriz")).toBeInTheDocument(),
      );

      const toggleBtns = screen.getAllByRole("button");
      const btnToggle = toggleBtns.find(
        (btn) =>
          btn.innerHTML.includes("lucide-toggle-right") ||
          btn.innerHTML.includes("lucide-toggle-left"),
      );

      fireEvent.click(btnToggle);

      await waitFor(() =>
        expect(screen.getByText(/desativar a entidade/i)).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith("/api/admin/lojas/10/", {
          ativo: false,
        });
      });
    });
  });
});
