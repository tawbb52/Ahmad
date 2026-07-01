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

  // دعم الجوال: تغيير عنوان السيرفر
  setHostForMobile(host) {
    localStorage.setItem("ahmad-api-host", host);
    this.updateBaseUrl();
  },

  updateBaseUrl() {
    const savedHost = localStorage.getItem("ahmad-api-host");
    if (savedHost) {
      const protocol = window.location.protocol;
      const port = window.location.port || (protocol === "https:" ? 443 : 80);
      this.baseUrl = `${protocol}//${savedHost}:${port}/api`;
    } else {
      this.baseUrl = "/api";
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

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        return null;
      }

      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        this.token = "";
        window.location.href = "/login.html";
        throw new Error("انتهت جلستك. يرجى تسجيل الدخول مجددًا");
      }

      if (!response.ok) {
        throw new Error(payload.message || payload.details || "حدث خطأ غير متوقع.");
      }

      return payload;
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${path}]:`, error);
      throw error;
    }
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

// تحديث BaseUrl عند التحميل
api.updateBaseUrl();

window.api = api;
