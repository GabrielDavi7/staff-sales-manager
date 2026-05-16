import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter, Navigate } from "react-router-dom";
import CriarUsuario from "./CriarUsuario";
import GerenciarStatus from "./GerenciarStatus";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

// =========================================================
// MOCKS GLOBAIS
// =========================================================
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: vi.fn(() => <div>Redirecionando...</div>),
  };
});

const renderWithProviders = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

// =========================================================
// SUÍTE DE TESTES: USUÁRIOS
// =========================================================
describe("Painel Admin - Gestão de Usuários", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 1, cargo: "ADMIN" } });
  });

  // ---------------------------------------------------------
  // RESTRIÇÃO DE ACESSO (MOCK DO ROLEGUARD)
  // ---------------------------------------------------------
  describe("Acesso Restrito", () => {
    const FakeRoleGuard = ({ allowedRoles, children }) => {
      const { user } = useAuth();
      if (!allowedRoles.includes(user.cargo)) {
        return <Navigate to="/dashboard" replace />;
      }
      return children;
    };

    it("VENDEDOR deve ser redirecionado ao tentar acessar o painel", () => {
      useAuth.mockReturnValue({ user: { cargo: "VENDEDOR" } });
      renderWithProviders(
        <FakeRoleGuard allowedRoles={["ADMIN"]}>
          <div data-testid="painel-admin">Painel</div>
        </FakeRoleGuard>,
      );
      expect(screen.getByText(/Redirecionando.../i)).toBeInTheDocument();
      expect(screen.queryByTestId("painel-admin")).not.toBeInTheDocument();
    });

    it("ADMIN acessa a listagem normalmente", () => {
      useAuth.mockReturnValue({ user: { cargo: "ADMIN" } });
      renderWithProviders(
        <FakeRoleGuard allowedRoles={["ADMIN"]}>
          <div data-testid="painel-admin">Painel</div>
        </FakeRoleGuard>,
      );
      expect(screen.getByTestId("painel-admin")).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------
  // LISTAGEM (GerenciarStatus.jsx)
  // ---------------------------------------------------------
  describe("Listagem de Usuários", () => {
    it("Deve carregar a lista de usuários via GET e exibir na tabela", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/api/admin/usuarios/")
          return Promise.resolve({
            data: [
              {
                id: 1,
                first_name: "João",
                last_name: "Silva",
                username: "joao.silva",
                cargo: "VENDEDOR",
                is_active: true,
              },
            ],
          });
        return Promise.resolve({ data: [] });
      });

      renderWithProviders(<GerenciarStatus onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
        expect(screen.getByText(/@joao.silva/i)).toBeInTheDocument();
        expect(screen.getByText(/VENDEDOR/i)).toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------------------
  // CRIAÇÃO (CriarUsuario.jsx)
  // ---------------------------------------------------------
  describe("Criação de Usuário", () => {
    beforeEach(() => {
      api.get.mockImplementation((url) => {
        if (url === "/api/admin/lojas/")
          return Promise.resolve({
            data: [{ id: 10, nome: "Loja Teste", ativo: true }],
          });
        if (url === "/api/admin/equipes/") return Promise.resolve({ data: [] });
        return Promise.resolve({ data: [] });
      });
    });

    it("Deve criar um usuário com sucesso (POST 201) e chamar onBack", async () => {
      const mockOnBack = vi.fn();
      api.post.mockResolvedValueOnce({ status: 201 });
      window.alert = vi.fn();

      renderWithProviders(<CriarUsuario onBack={mockOnBack} />);

      await waitFor(() =>
        expect(screen.getByText("Loja Teste")).toBeInTheDocument(),
      );

      fireEvent.change(screen.getByPlaceholderText("Ex: Gabriel"), {
        target: { value: "Gabriel" },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Davi"), {
        target: { value: "Davi" },
      });
      fireEvent.change(screen.getByPlaceholderText("gabriel@joias.com"), {
        target: { value: "gabriel@email.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("gabriel.davi"), {
        target: { value: "gabriel.davi" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "senha123" },
      });
      fireEvent.change(screen.getByPlaceholderText("1234"), {
        target: { value: "1234" },
      });

      const selects = screen.getAllByRole("combobox");
      fireEvent.change(selects[0], { target: { value: "VENDEDOR" } });
      fireEvent.change(selects[1], { target: { value: "10" } });

      fireEvent.click(
        screen.getByRole("button", { name: /Registrar Usuário/i }),
      );

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          "/api/admin/usuarios/",
          expect.objectContaining({
            first_name: "Gabriel",
            username: "gabriel.davi",
            pin: "1234",
            cargo: "VENDEDOR",
            loja: 10,
          }),
        );
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("cadastrado com sucesso"),
        );
        expect(mockOnBack).toHaveBeenCalled();
      });
    });

    it("Deve exibir erro de validação (Alert) se a API retornar erro", async () => {
      api.post.mockRejectedValueOnce({
        response: { data: { email: ["Email já existe."] } },
      });
      window.alert = vi.fn();

      renderWithProviders(<CriarUsuario onBack={vi.fn()} />);

      await waitFor(() =>
        expect(screen.getByText("Loja Teste")).toBeInTheDocument(),
      );

      fireEvent.change(screen.getByPlaceholderText("Ex: Gabriel"), {
        target: { value: "Teste" },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Davi"), {
        target: { value: "Teste" },
      });
      fireEvent.change(screen.getByPlaceholderText("gabriel@joias.com"), {
        target: { value: "erro@email.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("gabriel.davi"), {
        target: { value: "usuario.duplicado" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "123" },
      });
      fireEvent.change(screen.getByPlaceholderText("1234"), {
        target: { value: "123" },
      });

      const selects = screen.getAllByRole("combobox");
      fireEvent.change(selects[0], { target: { value: "VENDEDOR" } });
      fireEvent.change(selects[1], { target: { value: "10" } });

      fireEvent.click(
        screen.getByRole("button", { name: /Registrar Usuário/i }),
      );

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("Não foi possível salvar"),
        );
      });
    });
  });

  // ---------------------------------------------------------
  // EDIÇÃO E ATIVAÇÃO/DESATIVAÇÃO (GerenciarStatus.jsx)
  // ---------------------------------------------------------
  describe("Edição e Mudança de Status", () => {
    beforeEach(() => {
      api.get.mockImplementation((url) => {
        // CORREÇÃO: Adicionamos todos os campos obrigatórios no mock (last_name, email, pin)
        if (url === "/api/admin/usuarios/")
          return Promise.resolve({
            data: [
              {
                id: 1,
                first_name: "Ana",
                last_name: "Silva",
                email: "ana@email.com",
                username: "ana.v",
                pin: "1234",
                cargo: "VENDEDOR",
                loja: 10,
                is_active: true,
              },
            ],
          });
        if (url === "/api/admin/lojas/")
          return Promise.resolve({
            data: [{ id: 10, nome: "Loja Teste", ativo: true }],
          });
        return Promise.resolve({ data: [] });
      });
    });

    it("Deve alterar o status (Soft Delete) via PATCH e recarregar a lista", async () => {
      api.patch.mockResolvedValueOnce({ status: 200 });

      renderWithProviders(<GerenciarStatus onBack={vi.fn()} />);

      await waitFor(() => {
        const elements = screen.getAllByText(/Ana/i);
        expect(elements.length).toBeGreaterThan(0);
      });

      const toggleBtns = screen.getAllByRole("button");
      const btnToggle = toggleBtns.find((btn) =>
        btn.innerHTML.includes("lucide-toggle-right"),
      );

      fireEvent.click(btnToggle);

      await waitFor(() =>
        expect(screen.getByText(/Confirmar Operação/i)).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith("/api/admin/usuarios/1/", {
          is_active: false,
        });
      });
    });

    it("Deve abrir modal de edição, alterar dados e disparar PATCH", async () => {
      api.patch.mockResolvedValueOnce({ status: 200 });
      window.alert = vi.fn();

      renderWithProviders(<GerenciarStatus onBack={vi.fn()} />);

      await waitFor(() => {
        const elements = screen.getAllByText(/Ana/i);
        expect(elements.length).toBeGreaterThan(0);
      });

      fireEvent.click(screen.getByTitle("Editar Usuário"));

      await waitFor(() =>
        expect(
          screen.getByText(/Alterar Ficha Cadastral/i),
        ).toBeInTheDocument(),
      );

      // Agora que o modal abre com todos os required preenchidos, podemos simplesmente alterar o nome
      // Em vez de usar getAllByRole, vamos buscar diretamente pelo valor para ter certeza de qual input estamos tocando
      const inputNome = screen.getByDisplayValue("Ana");
      fireEvent.change(inputNome, { target: { value: "Ana Modificada" } });

      fireEvent.click(
        screen.getByRole("button", { name: /Salvar Alterações/i }),
      );

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith(
          "/api/admin/usuarios/1/",
          expect.objectContaining({
            first_name: "Ana Modificada",
            loja: 10,
          }),
        );
        expect(window.alert).toHaveBeenCalledWith(
          "Colaborador atualizado com sucesso!",
        );
      });
    });
  });
});
