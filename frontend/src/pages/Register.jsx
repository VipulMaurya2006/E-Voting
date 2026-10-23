import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/ballot" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      navigate("/ballot");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <p className="kicker">Student enrolment</p>
      <h1>Create your voter account</h1>
      <form className="form" onSubmit={onSubmit}>
        {error && <div className="error">{error}</div>}
        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          College email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Student ID
          <input
            required
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          />
        </label>
        <label>
          Password (min 6 characters)
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? "Creating…" : "Register"}
        </button>
        <p className="muted">
          Already enrolled? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
