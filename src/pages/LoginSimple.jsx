import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { decodeJwt } from "../lib/jwt";

export default function LoginSimple() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rolePreview = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    const claims = token ? decodeJwt(token) : null;
    return claims?.role || "";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await apiFetch("/auth/signIn", {
        method: "POST",
        body: JSON.stringify({ emailAddress: email, password }),
      });

      const accessToken = resp?.data?.access_token;
      const refreshToken = resp?.data?.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error("Login response missing tokens");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/appointments");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", textAlign: "left" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@example.com"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>

        {error ? (
          <div style={{ color: "crimson" }}>
            <b>Error:</b> {error}
          </div>
        ) : null}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {rolePreview ? (
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Current role (from JWT): {rolePreview}
          </div>
        ) : null}
      </form>
    </div>
  );
}

