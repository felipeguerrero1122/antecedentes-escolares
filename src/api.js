const API_BASE = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || "http://localhost:3001"
  : "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(body?.error || "Error inesperado.");
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export const api = {
  me() {
    return request("/api/auth/me");
  },
  login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request("/api/auth/logout", {
      method: "POST",
    });
  },
  listAlumnos() {
    return request("/api/alumnos");
  },
  getAlumno(id) {
    return request(`/api/alumnos/${id}`);
  },
  createAlumno(payload) {
    return request("/api/alumnos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateAlumno(id, payload) {
    return request(`/api/alumnos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteAlumno(id) {
    return request(`/api/alumnos/${id}`, {
      method: "DELETE",
    });
  },
};
