import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AttendanceProvider } from "./store/AttendanceContext";

export default function App() {
  return (
    <AttendanceProvider>
      <RouterProvider router={router} />
    </AttendanceProvider>
  );
}
