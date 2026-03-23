import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginSimple from "./pages/LoginSimple";
import Appointments from "./pages/Appointments";
import CustomerDetail from "./pages/CustomerDetail";
import { decodeJwt } from "./lib/jwt";

function RequireAuth({ children }) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return <Navigate to="/login" replace />;
  const claims = decodeJwt(accessToken);
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