import React, { useMemo } from "react";
import { decodeJwt } from "../lib/jwt";

export default function AppHeader({ onSignOut }) {
  const accessToken = localStorage.getItem("accessToken");
  const claims = useMemo(() => (accessToken ? decodeJwt(accessToken) : null), [accessToken]);
  const role = claims?.role;
  const name = [claims?.first_name, claims?.last_name].filter(Boolean).join(" ").trim();
  const roleLabel =
    role === "Admin" || role === "Staff" ? role : role ? String(role) : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 18,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, opacity: 0.85 }}>CRM Assignment</div>
        <div style={{ fontSize: 13, opacity: 0.72, marginTop: 3 }}>
          {roleLabel ? (
            <>
              Logged in as <strong>{roleLabel}</strong>
              {name ? (
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  ({name})
                </span>
              ) : null}
            </>
          ) : (
            <span>Signed in</span>
          )}
        </div>
      </div>
      <button type="button" onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
}
