// frontend/src/pages/dashboard/DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const DashboardLayout = () => (
  <div>
    <Navbar />
    <main style={{ padding: '2rem' }}>
      <Outlet />   {/* Aqui será renderizada a página inicial (Home) */}
    </main>
  </div>
);

export default DashboardLayout;