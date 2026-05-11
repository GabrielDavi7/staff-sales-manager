import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

global.ResizeObserver = class ResizeObserver {
  // Mock simples do ResizeObserver para evitar erros relacionados a ele durante os testes.
  observe() {}
  unobserve() {}
  disconnect() {}
};
// 👆 -------------------------------------------------------- 👆

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" })); // ativda o MSW para interceptar as requisições durante os testes, permitindo que as requisições não interceptadas sejam encaminhadas normalmente.

afterEach(() => server.resetHandlers()); // limpa os manipuladores de requisição personalizados após cada teste, garantindo que os testes sejam isolados e não afetem uns aos outros.

afterAll(() => server.close()); // encerra o servidor MSW após a execução de todos os testes, liberando recursos e garantindo que o ambiente de teste seja limpo.
