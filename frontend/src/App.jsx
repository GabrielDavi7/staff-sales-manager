import { RouterProvider } from "react-router-dom";
import { router } from "./routes"; // Importa o roteador centralizado

function App() {
  return <RouterProvider router={router} />;
}

export default App;
