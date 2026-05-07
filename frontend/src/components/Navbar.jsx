// frontend/src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getNavLinks } from "../utils/permissions";

const Navbar = () => {
  const { user, logout } = useAuth();
  const links = getNavLinks(user?.cargo || "");

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <span className="navbar-brand">Joias Manager</span>
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="navbar-link">
            {link.label}
          </Link>
        ))}
      </div>
      <div className="navbar-user">
        <span>
          {user?.first_name || user?.username} ({user?.cargo})
        </span>
        <button onClick={logout} className="navbar-logout-btn">
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
