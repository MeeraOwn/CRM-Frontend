import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { decodeJwt } from "../lib/jwt";

function getRowColor({ date, time }) {
  // Assumes `date` is YYYY-MM-DD and `time` is HH:MM or HH:MM:SS.
  const dt = new Date(`${date}T${String(time).slice(0, 5)}`);
  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();

  if (!Number.isNaN(dt.getTime())) {
    if (isToday) return { bg: "#d7f7df", label: "Today" };
    if (dt.getTime() < now.getTime()) return { bg: "#ffd7d7", label: "Past" };
    return { bg: "#fff3c4", label: "Future" };
  }
  return { bg: "transparent", label: "" };
}

export default function Appointments() {
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("accessToken");
  const claims = useMemo(() => (accessToken ? decodeJwt(accessToken) : null), [accessToken]);
  const role = claims?.role;
  const canCreateCustomer = role === "Admin";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // Provision: allow opening an existing customer's detail by ID.
  // This is useful for adding history to customers without upcoming appointments.
  const [openCustomerId, setOpenCustomerId] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await apiFetch("/appointments");
      setAppointments(resp?.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markCompleted = async (historyId) => {
    setError("");
    try {
      await apiFetch(`/history/${historyId}/complete`, {
        method: "POST",
      });
      await fetchAppointments();
    } catch (err) {
      setError(err?.message || "Failed to mark completed");
    }
  };

  const onCreateCustomer = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await apiFetch("/customers", {
        method: "POST",
        body: JSON.stringify(newCustomer),
      });
      const created = resp?.data;
      setCreatingCustomer(false);
      setNewCustomer({ first_name: "", last_name: "", email: "", phone: "" });
      if (created?.id) navigate(`/customers/${created.id}`);
    } catch (err) {
      setError(err?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const onOpenCustomer = (e) => {
    e.preventDefault();
    setError("");
    const id = String(openCustomerId || "").trim();
    if (!id) return;
    navigate(`/customers/${id}`);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", textAlign: "left" }}>
      <h2>Appointment List</h2>

      <form
        onSubmit={onOpenCustomer}
        style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}
      >
        <input
          placeholder="Open Customer Detail by Customer ID"
          value={openCustomerId}
          onChange={(e) => setOpenCustomerId(e.target.value)}
        />
        <button type="submit">Open</button>
      </form>

      {canCreateCustomer ? (
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setCreatingCustomer((v) => !v)}>
            {creatingCustomer ? "Cancel" : "Add Customer (Admin)"}
          </button>
        </div>
      ) : null}

      {creatingCustomer ? (
        <form onSubmit={onCreateCustomer} style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <h4 style={{ margin: 0 }}>New Customer</h4>
          <input
            placeholder="First name"
            value={newCustomer.first_name}
            onChange={(e) => setNewCustomer((p) => ({ ...p, first_name: e.target.value }))}
            required
          />
          <input
            placeholder="Last name"
            value={newCustomer.last_name}
            onChange={(e) => setNewCustomer((p) => ({ ...p, last_name: e.target.value }))}
            required
          />
          <input
            placeholder="Email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
            type="email"
            required
          />
          <input
            placeholder="Phone"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create"}
          </button>
        </form>
      ) : null}

      {error ? (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          <b>Error:</b> {error}
        </div>
      ) : null}

      {loading ? <div>Loading...</div> : null}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px 6px" }}>Customer ID</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px 6px" }}>First Name</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px 6px" }}>Last Name</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px 6px" }}>Date</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px 6px" }}>Time</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px 6px" }}>Description</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px 6px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((row) => {
            const c = getRowColor({ date: row.date, time: row.time });
            return (
              <tr key={row.history_id} style={{ background: c.bg }}>
                <td style={{ padding: "10px 6px" }}>{row.customer_id}</td>
                <td style={{ padding: "10px 6px" }}>{row.first_name}</td>
                <td style={{ padding: "10px 6px" }}>{row.last_name}</td>
                <td style={{ padding: "10px 6px" }}>{row.date}</td>
                <td style={{ padding: "10px 6px" }}>{row.time?.slice(0, 5)}</td>
                <td style={{ padding: "10px 6px" }}>
                  {row.description}
                  {c.label ? (
                    <div style={{ fontSize: 12, opacity: 0.75 }}>{c.label}</div>
                  ) : null}
                </td>
                <td style={{ padding: "10px 6px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => navigate(`/customers/${row.customer_id}`)}>
                      View Customer Detail
                    </button>
                    <button onClick={() => markCompleted(row.history_id)}>
                      Mark as Completed
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: 16, opacity: 0.8 }}>
                No appointments found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

