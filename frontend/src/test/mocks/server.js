import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers); // Configura o servidor MSW com os handlers definidos, permitindo que as requisições sejam interceptadas e respondidas de acordo com os mocks definidos nos handlers.
