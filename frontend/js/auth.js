const auth = {
  get user() {
    const raw = localStorage.getItem("ahmad-admin-user");
    return raw ? JSON.parse(raw) : null;
  },

  setSession(payload) {
    window.api.token = payload.token;
    localStorage.setItem("ahmad-admin-user", JSON.stringify(payload.user));
  },

  clearSession() {
    window.api.token = "";
    localStorage.removeItem("ahmad-admin-user");
  },

  async requireAuth() {
    if (!window.api.token) {
      window.location.href = "/login.html";
      return false;
    }

    return true;
  },

  logout() {
    this.clearSession();
    window.location.href = "/login.html";
  },
};

window.auth = auth;

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "login") {
    return;
  }

  const form = document.getElementById("loginForm");
  const status = document.getElementById("loginStatus");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "جارٍ التحقق من بيانات الدخول...";

    try {
      const formData = new FormData(form);
      const response = await window.api.post("/auth/login", {
        email: formData.get("email"),
        password: formData.get("password"),
      });

      auth.setSession(response);
      window.location.href = "/index.html";
    } catch (error) {
      status.textContent = error.message;
    }
  });
});
