import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PollDetail from "./pages/PollDetail.jsx";
import Admin from "./pages/Admin.jsx";

function Guard({ children, admin }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/ballot" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/ballot"
          element={
            <Guard>
              <Dashboard />
            </Guard>
          }
        />
        <Route
          path="/polls/:id"
          element={
            <Guard>
              <PollDetail />
            </Guard>
          }
        />
        <Route
          path="/admin"
          element={
            <Guard admin>
              <Admin />
            </Guard>
          }
        />
      </Routes>
    </Layout>
  );
}
