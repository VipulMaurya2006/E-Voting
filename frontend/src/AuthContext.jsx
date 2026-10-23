import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        const data = await api("/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem("evote_token");
        setUser(null);
      } finally {
        setReady(true);
      }
    }
    load();
  }, []);

  function login(token, nextUser) {
    localStorage.setItem("evote_token", token);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("evote_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
