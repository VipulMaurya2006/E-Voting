import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="shell">
      <header className="nav">
        <Link to="/" className="brand">
          <span className="mark">B</span>
          Campus Ballot
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              <NavLink to="/ballot">Open ballots</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Officer desk</NavLink>}
              <span className="muted">{user.name}</span>
              <button className="btn ghost" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link className="btn" to="/register">
                Register as student
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
