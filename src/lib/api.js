const getApiBase = () => {
  // Keep it simple: frontend uses local backend by default.
  // You can override by setting VITE_API_BASE in your Vite env.
  return import.meta.env.VITE_API_BASE || "http://localhost:9000/api";
};

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { "x-access-token": token } : {}),
    },
    credentials: "omit",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || data?.data?.message || res.statusText;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

