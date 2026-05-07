import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-light">
      {/* Aqui ficaria sua Navbar ou Sidebar */}
      <header className="p-4 bg-white shadow-sm mb-6">
        <h1 className="text-xl font-bold text-primary">Joias Manager</h1>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* O Outlet é onde a Home ou o NewAttendance vão aparecer! */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
