const api = {
  baseUrl: "/api",

  get token() {
    return localStorage.getItem("ahmad-admin-token") || "";
  },

  set token(value) {
    if (value) {
      localStorage.setItem("ahmad-admin-token", value);
    } else {
      localStorage.removeItem("ahmad-admin-token");
    }
  },

  async request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (this.token && !headers.Authorization) {
      headers.Authorization = "Bearer " + this.token;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || "حدث خطأ غير متوقع.");
    }

    return payload;
  },

  get(path, params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
    );
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request(`${path}${suffix}`);
  },

  post(path, body) {
    return this.request(path, { method: "POST", body: JSON.stringify(body) });
  },

  put(path, body) {
    return this.request(path, { method: "PUT", body: JSON.stringify(body) });
  },

  delete(path) {
    return this.request(path, { method: "DELETE" });
  },
};

window.api = api;
