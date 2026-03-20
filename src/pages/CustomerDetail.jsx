import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { decodeJwt } from "../lib/jwt";
import  formatDate from "../config/date";

function formatArt(art) {
  if (!art) return "";
  return art.charAt(0).toUpperCase() + art.slice(1);
}

export default function CustomerDetail() {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const accessToken = localStorage.getItem("accessToken");
  const claims = useMemo(() => (accessToken ? decodeJwt(accessToken) : null), [accessToken]);
  const role = claims?.role;
  const userSub = claims?.sub;
  const isAdmin = role === "Admin";

  const [tab, setTab] = useState("info");
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerError, setCustomerError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    art: "appointment",
    date: "",
    time: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    art: "appointment",
    date: "",
    time: "",
    description: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    setCustomerError("");
    setHistoryError("");
    try {
      // Fetch independently so a failure in customer lookup
      // doesn't block the History tab (so you can still add history).
      const [custResp, histResp] = await Promise.allSettled([
        apiFetch(`/customers/${customerId}`),
        apiFetch(`/customers/${customerId}/history`),
      ]);

      if (custResp.status === "fulfilled") {
        setCustomer(custResp.value?.data || null);
      } else {
        setCustomer(null);
        setCustomerError(custResp.reason?.message || "Failed to load customer");
      }

      if (histResp.status === "fulfilled") {
        setHistory(histResp.value?.data || []);
      } else {
        setHistory([]);
        setHistoryError(histResp.reason?.message || "Failed to load history");
      }
    } catch (err) {
      setError(err?.message || "Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const canModifyHistory = (row) => {
    if (isAdmin) return true;
    return String(row?.created_by) === String(userSub);
  };

  const onAddHistory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch(`/customers/${customerId}/history`, {
        method: "POST",
        body: JSON.stringify({
          subject: form.subject,
          art: form.art,
          description: form.description,
          date: form.date,
          time: form.time,
        }),
      });
      setShowAdd(false);
      setForm({ subject: "", art: "appointment", date: "", time: "", description: "" });
      await fetchAll();
      setTab("history");
    } catch (err) {
      setError(err?.message || "Failed to add history");
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      subject: row.subject || "",
      art: row.art || "appointment",
      description: row.description || "",
      date: row.date || "",
      time: row.time ? String(row.time).slice(0, 5) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ subject: "", art: "appointment", date: "", time: "", description: "" });
  };

  const saveEdit = async () => {
    setError("");
    try {
      await apiFetch(`/history/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          subject: editForm.subject,
          art: editForm.art,
          description: editForm.description,
          date: editForm.date,
          time: editForm.time,
        }),
      });
      cancelEdit();
      await fetchAll();
    } catch (err) {
      setError(err?.message || "Failed to update history");
    }
  };

  const deleteHistory = async (historyId) => {
    const ok = window.confirm("Delete this history entry?");
    if (!ok) return;
    setError("");
    try {
      await apiFetch(`/history/${historyId}`, {
        method: "DELETE",
      });
      await fetchAll();
    } catch (err) {
      setError(err?.message || "Failed to delete history");
    }
  };

  const signOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "10px 10px", textAlign: "left" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: 700, opacity: 0.85 }}>CRM Assignment</div>
        <button type="button" onClick={signOut}>
          Sign Out
        </button>
        
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => navigate("/appointments")}>Back</button>
        <h2 style={{ margin: 0 }}>Customer Detail</h2>
      </div>

      {error ? (
        <div style={{ color: "crimson", marginTop: 10 }}>
          <b>Error:</b> {error}
        </div>
      ) : null}

      {loading ? <div style={{ marginTop: 10 }}>Loading...</div> : null}

      {!loading ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button onClick={() => setTab("info")} style={tab === "info" ? { fontWeight: "bold" } : null}>
              Customer Info
            </button>
            <button
              onClick={() => setTab("history")}
              style={tab === "history" ? { fontWeight: "bold" } : null}
            >
              History
            </button>
          </div>

          {tab === "info" ? (
            <div>
              {customerError ? (
                <div style={{ color: "crimson", marginBottom: 10 }}>
                  <b>Customer:</b> {customerError}
                </div>
              ) : null}

              {customer ? (
                <div style={{ marginBottom: 10, opacity: 0.85 }}>
                  <div>
                    <b>Customer ID:</b> {customer.id}
                  </div>
                  <div>
                    <b>Name:</b> {customer.first_name} {customer.last_name}
                  </div>
                  <div>
                    <b>Email:</b> {customer.email}
                  </div>
                  <div>
                    <b>Phone:</b> {customer.phone}
                  </div>
                </div>
              ) : (
                <div style={{ opacity: 0.7 }}>No customer data available.</div>
              )}
            </div>
          ) : (
            <div>
              {historyError ? (
                <div style={{ color: "crimson", marginBottom: 10 }}>
                  <b>History:</b> {historyError}
                </div>
              ) : null}
              <div style={{ marginBottom: 12 }}>
                <button onClick={() => setShowAdd((v) => !v)}>Add New History Entry</button>
              </div>

              {showAdd ? (
                <form onSubmit={onAddHistory} style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                  <h4 style={{ margin: 0 }}>New History Entry</h4>

                  <input value={customer?.id ?? customerId} readOnly />
                  <input value={customer?.first_name ?? ""} readOnly />
                  <input value={customer?.last_name ?? ""} readOnly />

                  <input
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Subject"
                    required
                  />

                  <select value={form.art} onChange={(e) => setForm((p) => ({ ...p, art: e.target.value }))}>
                    <option value="appointment">Appointment</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    required
                  />

                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    required
                  />

                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Description"
                    rows={3}
                  />

                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setShowAdd(false)}>
                    Cancel
                  </button>
                </form>
              ) : null}

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Subject</th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Art</th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Date</th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Time</th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Description</th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => {
                    const canEdit = canModifyHistory(row);
                    const isEditing = editingId === row.id;
                    return (
                      <tr key={row.id}>
                        {!isEditing ? (
                          <>
                            <td style={{ padding: "8px 6px" }}>{row.subject}</td>
                            <td style={{ padding: "8px 6px" }}>
                              {formatArt(row.art)}
                              {row.completed ? <span style={{ marginLeft: 6, fontSize: 12, opacity: 0.7 }}>(Completed)</span> : null}
                            </td>
                            <td style={{ padding: "8px 6px" }}>{formatDate(row.date)}</td>
                            <td style={{ padding: "8px 6px" }}>{String(row.time).slice(0, 5)}</td>
                            <td style={{ padding: "8px 6px" }}>{row.description}</td>
                            <td style={{ padding: "8px 6px" }}>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {canEdit ? (
                                  <>
                                    <button onClick={() => startEdit(row)}>Edit</button>
                                    <button onClick={() => deleteHistory(row.id)}>Delete</button>
                                  </>
                                ) : (
                                  <span style={{ opacity: 0.7, fontSize: 12 }}>Read-only</span>
                                )}
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: "8px 6px" }}>
                              <input
                                value={editForm.subject}
                                onChange={(e) => setEditForm((p) => ({ ...p, subject: e.target.value }))}
                              />
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                              <select
                                value={editForm.art}
                                onChange={(e) => setEditForm((p) => ({ ...p, art: e.target.value }))}
                              >
                                <option value="appointment">Appointment</option>
                                <option value="service">Service</option>
                                <option value="other">Other</option>
                              </select>
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                              />
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                              <input
                                type="time"
                                value={editForm.time}
                                onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))}
                              />
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                              <input
                                style={{ width: "100%" }}
                                value={editForm.description}
                                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                              />
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button onClick={saveEdit}>Save</button>
                                <button onClick={cancelEdit}>Cancel</button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: 16, opacity: 0.8 }}>
                        No history entries yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

