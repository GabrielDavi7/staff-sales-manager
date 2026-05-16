import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Perfil } from "./Perfil";
import { BrowserRouter, Navigate } from "react-router-dom";
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
    patch: vi.fn(), // O componente Perfil.jsx usa PATCH para atualizações parciais
    put: vi.fn(),
  },
}));

// Mock do React Router para testar o redirecionamento do DISPOSITIVO
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: vi.fn(() => <div>Redirecionando...</div>),
  };
});

// Helper para renderizar com Router
const renderWithProviders = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

// =========================================================
// SUÍTE DE TESTES: COMPONENTE DE PERFIL
// =========================================================
describe("Página de Perfil", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------
  // 1. CARREGAMENTO INICIAL
  // ---------------------------------------------------------
  it("Deve retornar dados do usuário via GET e preencher os campos corretamente", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, cargo: "ADMIN" },
      setUser: vi.fn(),
    });

    // Mock do GET retornando os dados
    api.get.mockResolvedValueOnce({
      data: {
        first_name: "Gabriel",
        last_name: "Davi",
        email: "gabriel@email.com",
      },
    });

    renderWithProviders(<Perfil />);

    // Verifica se os inputs foram preenchidos (estão desabilitados por padrão)
    await waitFor(() => {
      expect(screen.getByDisplayValue("Gabriel")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Davi")).toBeInTheDocument();
      expect(screen.getByDisplayValue("gabriel@email.com")).toBeInTheDocument();
    });
  });

  it("Deve exibir mensagem de erro caso o GET falhe", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, cargo: "VENDEDOR" },
      setUser: vi.fn(),
    });

    // Mock do GET retornando Erro 500
    api.get.mockRejectedValueOnce(new Error("Erro de servidor"));

    renderWithProviders(<Perfil />);

    await waitFor(() => {
      expect(
        screen.getByText(/Não foi possível carregar os dados do perfil/i),
      ).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------
  // 2. EXIBIÇÃO CONDICIONAL DO PIN
  // ---------------------------------------------------------
  it("Deve exibir o campo PIN quando o usuário for VENDEDOR", async () => {
    useAuth.mockReturnValue({
      user: { id: 2, cargo: "VENDEDOR" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { pin: "1234" } });

    renderWithProviders(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText(/PIN Operacional/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("1234")).toBeInTheDocument();
    });
  });

  it("NÃO deve exibir o campo PIN quando o usuário for SUPERVISOR ou ADMIN", async () => {
    // Testando com SUPERVISOR
    useAuth.mockReturnValue({
      user: { id: 3, cargo: "SUPERVISOR" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { first_name: "Admin" } });

    const { unmount } = renderWithProviders(<Perfil />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Admin")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/PIN Operacional/i)).not.toBeInTheDocument();

    unmount();

    // Testando com ADMIN
    useAuth.mockReturnValue({
      user: { id: 4, cargo: "ADMIN" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { first_name: "Mestre" } });

    renderWithProviders(<Perfil />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Mestre")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/PIN Operacional/i)).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------
  // 3. ATUALIZAÇÃO DE PERFIL
  // ---------------------------------------------------------
  it("Deve atualizar os campos via PATCH (200) e exibir mensagem de sucesso", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, cargo: "VENDEDOR" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { first_name: "Gabriel" } });

    // Mock do PATCH retornando Sucesso 200
    api.patch.mockResolvedValueOnce({ data: { detail: "Atualizado" } });

    renderWithProviders(<Perfil />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Gabriel")).toBeInTheDocument(),
    );

    // Clica no botão "Editar" do primeiro campo (Nome)
    const btnsEditar = screen.getAllByText(/Editar/i);
    fireEvent.click(btnsEditar[0]);

    // Modifica o valor
    const inputNome = screen.getByDisplayValue("Gabriel");
    fireEvent.change(inputNome, { target: { value: "Gabriel Atualizado" } });

    // Salva a alteração (Busca o botão verde de confirmar com o ícone Check)
    const btnSalvar = screen
      .getAllByRole("button")
      .find((b) => b.className.includes("emerald"));
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/api/users/user/me/", {
        first_name: "Gabriel Atualizado",
      });
      expect(
        screen.getByText(/Perfil atualizado com sucesso/i),
      ).toBeInTheDocument();
    });
  });

  it("Deve exibir mensagem de erro da API caso o PATCH falhe (ex: e-mail duplicado)", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, cargo: "ADMIN" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { email: "teste@email.com" } });

    // Mock do PATCH retornando Erro 400
    api.patch.mockRejectedValueOnce({
      response: {
        data: { detail: "E-mail já está em uso por outro usuário." },
      },
    });

    renderWithProviders(<Perfil />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("teste@email.com")).toBeInTheDocument(),
    );

    // Clica em Editar E-mail
    const btnsEditar = screen.getAllByText(/Editar/i);
    fireEvent.click(btnsEditar[2]); // Index 2 costuma ser o e-mail (Nome, Sobrenome, Email)

    // Altera e Salva
    const inputEmail = screen.getByDisplayValue("teste@email.com");
    fireEvent.change(inputEmail, { target: { value: "duplicado@email.com" } });
    const btnSalvar = screen
      .getAllByRole("button")
      .find((b) => b.className.includes("emerald"));
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(
        screen.getByText(/E-mail já está em uso por outro usuário/i),
      ).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------
  // 4. ALTERAÇÃO DE SENHA
  // ---------------------------------------------------------
  it("Deve alterar a senha com sucesso via PATCH (200)", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, cargo: "VENDEDOR" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { first_name: "Teste" } });
    api.patch.mockResolvedValueOnce({ data: { detail: "Senha atualizada" } });

    renderWithProviders(<Perfil />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Teste")).toBeInTheDocument(),
    );

    // CORREÇÃO: Abre o formulário de senha pelo Role "button"
    fireEvent.click(screen.getByRole("button", { name: /Alterar/i }));

    // Preenche os campos
    fireEvent.change(screen.getByLabelText(/Senha Atual/i), {
      target: { value: "senhaAtual123" },
    });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), {
      target: { value: "novaSenha456" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Nova Senha/i), {
      target: { value: "novaSenha456" },
    });

    // Envia formulário
    fireEvent.click(screen.getByText(/Salvar Senha/i));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/api/users/user/me/", {
        current_password: "senhaAtual123",
        new_password: "novaSenha456",
      });
      expect(
        screen.getByText(/Senha atualizada com sucesso/i),
      ).toBeInTheDocument();
    });
  });

  it("Deve exibir erro caso a senha atual esteja incorreta (Erro 400)", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, cargo: "VENDEDOR" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { first_name: "Teste" } });

    // Mock do backend recusando a senha antiga
    api.patch.mockRejectedValueOnce({
      response: { data: { detail: "A senha atual está incorreta." } },
    });

    renderWithProviders(<Perfil />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Teste")).toBeInTheDocument(),
    );

    // CORREÇÃO: Abre o formulário de senha pelo Role "button"
    fireEvent.click(screen.getByRole("button", { name: /Alterar/i }));

    fireEvent.change(screen.getByLabelText(/Senha Atual/i), {
      target: { value: "senhaErrada" },
    });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), {
      target: { value: "novaSenha456" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Nova Senha/i), {
      target: { value: "novaSenha456" },
    });
    fireEvent.click(screen.getByText(/Salvar Senha/i));

    await waitFor(() => {
      expect(
        screen.getByText(/A senha atual está incorreta/i),
      ).toBeInTheDocument();
    });
  });

  it("Deve bloquear envio e gerar erro de validação local se as novas senhas não coincidirem", async () => {
    useAuth.mockReturnValue({
      user: { id: 1, cargo: "VENDEDOR" },
      setUser: vi.fn(),
    });
    api.get.mockResolvedValueOnce({ data: { first_name: "Teste" } });

    renderWithProviders(<Perfil />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Teste")).toBeInTheDocument(),
    );

    // CORREÇÃO: Abre o formulário de senha pelo Role "button"
    fireEvent.click(screen.getByRole("button", { name: /Alterar/i }));

    fireEvent.change(screen.getByLabelText(/Senha Atual/i), {
      target: { value: "senhaAtual123" },
    });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), {
      target: { value: "senhaA" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Nova Senha/i), {
      target: { value: "senhaB" },
    });
    fireEvent.click(screen.getByText(/Salvar Senha/i));

    await waitFor(() => {
      expect(
        screen.getByText(/A nova senha e a confirmação não coincidem/i),
      ).toBeInTheDocument();
    });

    // Confirma que a API não foi chamada
    expect(api.patch).not.toHaveBeenCalled();
  });
});

// =========================================================
// SUÍTE DE TESTES: RESTRIÇÃO DE ACESSO (RoleGuard Fake)
// =========================================================
describe("Restrição de Acesso (RoleGuard)", () => {
  // Simulando a lógica que você tem no App.jsx / router.jsx
  const FakeRoleGuard = ({ allowedRoles, children }) => {
    const { user } = useAuth();
    if (!allowedRoles.includes(user.cargo)) {
      return <Navigate to="/registrarvenda" replace />;
    }
    return children;
  };

  it("O cargo DISPOSITIVO deve ser interceptado e redirecionado para /registrarvenda", () => {
    useAuth.mockReturnValue({ user: { cargo: "DISPOSITIVO" } });

    renderWithProviders(
      <FakeRoleGuard allowedRoles={["VENDEDOR", "SUPERVISOR", "ADMIN"]}>
        <Perfil />
      </FakeRoleGuard>,
    );

    // O Mock do Navigate que criamos lá em cima renderiza essa div
    expect(screen.getByText(/Redirecionando.../i)).toBeInTheDocument();
    // Confirma que o componente Perfil não foi renderizado
    expect(screen.queryByText(/Meu Perfil/i)).not.toBeInTheDocument();
  });
});
