import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginSimple from "./pages/LoginSimple";
import Appointments from "./pages/Appointments";
import CustomerDetail from "./pages/CustomerDetail";

function getJwtClaims(token) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function RequireAuth({ children }) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return <Navigate to="/login" replace />;
  const claims = getJwtClaims(accessToken);
  if (!claims?.sub) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginSimple />} />
        <Route
          path="/appointments"
          element={
            <RequireAuth>
              <Appointments />
            </RequireAuth>
          }
        />
        <Route
          path="/customers/:customerId"
          element={
            <RequireAuth>
              <CustomerDetail />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/appointments" replace />} />
      </Routes>
    </BrowserRouter>
  );
}