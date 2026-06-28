function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value, withTime = false) {
  if (!value) {
    return "—";
  }

  const formatter = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

  return formatter.format(new Date(value));
}

function badgeClass(value) {
  return `badge badge-${String(value || "info").replace(/\s+/g, "-").toLowerCase()}`;
}

function showToast(message, tone = "success") {
  const stack = document.getElementById("toastStack");
  const toast = document.createElement("div");
  toast.className = `toast toast-${tone}`;
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("ahmad-admin-theme", theme);
}

function applySavedTheme() {
  setTheme(localStorage.getItem("ahmad-admin-theme") || "light");
}

function pageTitle(page) {
  return {
    dashboard: "لوحة التحكم الرئيسية",
    users: "إدارة المستخدمين",
    devices: "إدارة الأجهزة",
    subscriptions: "إدارة الاشتراكات",
    certificates: "أكواد التفعيل والشهادات",
    reports: "التقارير والإحصائيات",
  }[page];
}

function loadingMarkup(message = "جارٍ تحميل البيانات...") {
  return `<div class="loading-state"><div class="spinner"></div><div>${escapeHtml(message)}</div></div>`;
}

function emptyMarkup(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function statCard(label, value, hint) {
  return `<article class="stat-card"><span class="muted">${escapeHtml(label)}</span><strong>${escapeHtml(
    value
  )}</strong><div class="muted">${escapeHtml(hint)}</div></article>`;
}

function tableMarkup(columns, rows, emptyMessage) {
  if (!rows.length) {
    return emptyMarkup(emptyMessage);
  }

  return `<div class="table-wrap"><table><thead><tr>${columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function paginationMarkup(meta, page) {
  if (!meta) {
    return "";
  }

  return `<div class="pagination">
    <button class="btn-secondary" data-page-shift="-1" ${page <= 1 ? "disabled" : ""}>السابق</button>
    <span class="muted">صفحة ${meta.page} من ${meta.totalPages} • ${meta.totalItems} عنصر</span>
    <button class="btn-secondary" data-page-shift="1" ${
      page >= meta.totalPages ? "disabled" : ""
    }>التالي</button>
  </div>`;
}

function openModal(title, bodyHtml, submitLabel, onSubmit) {
  const backdrop = document.getElementById("modalBackdrop");
  backdrop.innerHTML = `<div class="modal"><div class="modal-header"><div><h3>${escapeHtml(
    title
  )}</h3></div><button class="btn-ghost" data-close-modal>إغلاق</button></div>${bodyHtml}</div>`;
  backdrop.classList.add("open");

  backdrop.querySelector("[data-close-modal]")?.addEventListener("click", () => {
    backdrop.classList.remove("open");
  });

  const form = backdrop.querySelector("form");
  if (form && onSubmit) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        return;
      }

      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        await onSubmit(payload, form);
        backdrop.classList.remove("open");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }
}

function baseShell(user) {
  const page = document.body.dataset.page;
  const nav = [
    ["dashboard", "/index.html", "الرئيسية"],
    ["users", "/users.html", "المستخدمون"],
    ["devices", "/devices.html", "الأجهزة"],
    ["subscriptions", "/subscriptions.html", "الاشتراكات"],
    ["certificates", "/certificates.html", "الأكواد والشهادات"],
    ["reports", "/reports.html", "التقارير"],
  ];

  document.getElementById("appShell").innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <h1>Ahmad Admin</h1>
        <p>إدارة احترافية لتطبيقات iOS والمشتركين.</p>
      </div>
      <nav class="nav-links">
        ${nav
          .map(
            ([key, href, label]) =>
              `<a class="nav-link ${page === key ? "active" : ""}" href="${href}">${escapeHtml(
                label
              )}</a>`
          )
          .join("")}
      </nav>
      <div class="sidebar-footer">الدور الحالي: ${escapeHtml(user.role)}</div>
    </aside>
    <main class="main-content">
      <header class="topbar">
        <div>
          <h2>${escapeHtml(pageTitle(page))}</h2>
          <div class="muted">مرحبًا ${escapeHtml(user.email)} — منصة مراقبة وإدارة كاملة.</div>
        </div>
        <div class="topbar-actions">
          <button class="btn-secondary" id="themeToggle">تبديل المظهر</button>
          <button class="btn-danger" id="logoutButton">تسجيل الخروج</button>
        </div>
      </header>
      <section id="pageRoot">${loadingMarkup()}</section>
    </main>
  `;

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    setTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
  });
  document.getElementById("logoutButton")?.addEventListener("click", () => window.auth.logout());
}

const store = {
  page: 1,
  filters: {},
  plans: [],
  users: [],
};

async function fetchPlans() {
  if (!store.plans.length) {
    store.plans = await window.api.get("/plans");
  }

  return store.plans;
}

async function fetchUsersList() {
  if (!store.users.length) {
    store.users = (await window.api.get("/users", { pageSize: 50 })).items;
  }

  return store.users;
}

async function renderDashboard() {
  const pageRoot = document.getElementById("pageRoot");
  const [overview, users, subscriptions] = await Promise.all([
    window.api.get("/overview/stats"),
    window.api.get("/users", { pageSize: 5 }),
    window.api.get("/subscriptions", { pageSize: 5 }),
  ]);

  pageRoot.innerHTML = `
    <div class="card-grid">
      ${statCard("إجمالي المستخدمين", overview.stats.totalUsers, "سجل المستخدمين بالكامل")}
      ${statCard("المستخدمون النشطون", overview.stats.activeUsers, "الحسابات القابلة للاستخدام")}
      ${statCard("الاشتراكات النشطة", overview.stats.activeSubscriptions, "اشتراكات فعالة حاليًا")}
      ${statCard("الأجهزة النشطة", overview.stats.activeDevices, "أجهزة تتفاعل مع المنصة")}
      ${statCard("الشهادات النشطة", overview.stats.activeCertificates, "شهادات صالحة للتوزيع")}
      ${statCard("الإيرادات", `${overview.stats.revenue} $`, "إجمالي الاشتراكات الفعالة")}
    </div>
    <div class="section-layout two-columns">
      <section class="section-card">
        <h3>آخر المستخدمين والحسابات الحساسة</h3>
        ${tableMarkup(
          ["الاسم", "الخطة", "الحالة", "تاريخ الانتهاء"],
          users.items.map(
            (user) => `<tr>
              <td>${escapeHtml(user.name)}<div class="muted">${escapeHtml(user.email)}</div></td>
              <td>${escapeHtml(user.planName)}</td>
              <td><span class="${badgeClass(user.subscriptionStatus)}">${escapeHtml(
                user.subscriptionStatus
              )}</span></td>
              <td>${formatDate(user.subscriptionEnd)}</td>
            </tr>`
          ),
          "لا توجد بيانات مستخدمين."
        )}
      </section>
      <section class="section-card">
        <h3>الشهادات الأقرب للانتهاء</h3>
        <div class="summary-list">
          ${
            overview.expiringCertificates.length
              ? overview.expiringCertificates
                  .map(
                    (certificate) => `<div class="summary-item">
                    <strong>${escapeHtml(certificate.name)}</strong>
                    <div class="muted">${escapeHtml(certificate.type)} • ${
                      certificate.assignedApps ? escapeHtml(certificate.assignedApps) : "بدون تعيين"
                    }</div>
                    <div class="inline-actions">
                      <span class="${badgeClass(certificate.status)}">${escapeHtml(
                        certificate.status
                      )}</span>
                      <span class="muted">${formatDate(certificate.expiresAt)}</span>
                    </div>
                  </div>`
                  )
                  .join("")
              : emptyMarkup("لا توجد شهادات متاحة.")
          }
        </div>
      </section>
    </div>
    <section class="section-card">
      <h3>الاشتراكات قريبة الانتهاء</h3>
      ${tableMarkup(
        ["المستخدم", "الخطة", "الحالة", "الفترة"],
        subscriptions.items.map(
          (subscription) => `<tr>
            <td>${escapeHtml(subscription.userName)}</td>
            <td>${escapeHtml(subscription.planName)}</td>
            <td><span class="${badgeClass(subscription.status)}">${escapeHtml(
              subscription.status
            )}</span></td>
            <td>${formatDate(subscription.startDate)} → ${formatDate(subscription.endDate)}</td>
          </tr>`
        ),
        "لا توجد اشتراكات حالية."
      )}
    </section>
    <section class="section-card">
      <h3>سجل النشاطات الأخير</h3>
      <div class="activity-list">
        ${overview.recentActivity
          .map(
            (entry) => `<div class="activity-item">
              <div class="inline-actions">
                <strong>${escapeHtml(entry.action)}</strong>
                <span class="${badgeClass(entry.level)}">${escapeHtml(entry.level)}</span>
              </div>
              <div>${escapeHtml(entry.target)}</div>
              <div class="muted">${escapeHtml(entry.details)} • ${formatDate(entry.timestamp, true)}</div>
            </div>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function bindFilters(renderFn) {
  document.getElementById("filtersForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    store.page = 1;
    store.filters = Object.fromEntries(new FormData(event.currentTarget).entries());
    renderFn().catch((error) => showToast(error.message, "error"));
  });

  document.querySelectorAll("[data-page-shift]").forEach((button) => {
    button.addEventListener("click", () => {
      store.page += Number(button.dataset.pageShift || 0);
      renderFn().catch((error) => showToast(error.message, "error"));
    });
  });
}

async function renderUsers() {
  const pageRoot = document.getElementById("pageRoot");
  pageRoot.innerHTML = loadingMarkup();
  const [plans, response] = await Promise.all([
    fetchPlans(),
    window.api.get("/users", { ...store.filters, page: store.page, pageSize: 6 }),
  ]);

  pageRoot.innerHTML = `
    <section class="filter-card">
      <div class="topbar-actions">
        <h3>فلترة المستخدمين</h3>
        <button class="btn-primary" id="addUserButton">إضافة مستخدم</button>
      </div>
      <form class="filter-grid" id="filtersForm">
        <label>بحث<input name="search" value="${escapeHtml(store.filters.search || "")}" placeholder="اسم، بريد، هاتف"></label>
        <label>الحالة<select name="status"><option value="">الكل</option><option value="active">active</option><option value="disabled">disabled</option><option value="expired">expired</option></select></label>
        <label>الاشتراك<select name="subscriptionStatus"><option value="">الكل</option><option value="active">active</option><option value="disabled">disabled</option><option value="expired">expired</option></select></label>
        <label>من تاريخ<input type="date" name="from" value="${escapeHtml(store.filters.from || "")}"></label>
        <label>إلى تاريخ<input type="date" name="to" value="${escapeHtml(store.filters.to || "")}"></label>
        <div class="page-actions"><button class="btn-secondary" type="submit">تطبيق</button></div>
      </form>
    </section>
    <section class="section-card">
      <h3>قائمة المستخدمين</h3>
      ${tableMarkup(
        ["المستخدم", "الدور", "الحالة", "الاشتراك", "الخطة", "الأجهزة", "إجراءات"],
        response.items.map(
          (user) => `<tr>
            <td>${escapeHtml(user.name)}<div class="muted">${escapeHtml(user.email)}</div></td>
            <td><span class="${badgeClass(user.role)}">${escapeHtml(user.role)}</span></td>
            <td><span class="${badgeClass(user.status)}">${escapeHtml(user.status)}</span></td>
            <td><span class="${badgeClass(user.subscriptionStatus)}">${escapeHtml(
              user.subscriptionStatus
            )}</span><div class="muted">${formatDate(user.subscriptionEnd)}</div></td>
            <td>${escapeHtml(user.planName)}</td>
            <td>${escapeHtml(user.devicesCount)}</td>
            <td><div class="inline-actions">
              <button class="btn-secondary" data-edit-user="${escapeHtml(user.id)}">تعديل</button>
              <button class="btn-danger" data-delete-user="${escapeHtml(user.id)}">حذف</button>
            </div></td>
          </tr>`
        ),
        "لا توجد نتائج مطابقة."
      )}
      ${paginationMarkup(response.meta, store.page)}
    </section>
  `;

  pageRoot.querySelector('select[name="status"]').value = store.filters.status || "";
  pageRoot.querySelector('select[name="subscriptionStatus"]').value =
    store.filters.subscriptionStatus || "";

  bindFilters(renderUsers);

  document.getElementById("addUserButton")?.addEventListener("click", () => openUserModal(plans));
  response.items.forEach((user) => {
    document.querySelector(`[data-edit-user="${user.id}"]`)?.addEventListener("click", () =>
      openUserModal(plans, user)
    );
    document.querySelector(`[data-delete-user="${user.id}"]`)?.addEventListener("click", async () => {
      if (!confirm(`حذف المستخدم ${user.name}؟`)) {
        return;
      }

      await window.api.delete(`/users/${user.id}`);
      showToast("تم حذف المستخدم.");
      store.users = [];
      await renderUsers();
    });
  });
}

function openUserModal(plans, user = {}) {
  const planOptions = plans
    .map(
      (plan) =>
        `<option value="${escapeHtml(plan.id)}" ${user.planId === plan.id ? "selected" : ""}>${escapeHtml(
          plan.name
        )}</option>`
    )
    .join("");

  openModal(
    user.id ? "تعديل مستخدم" : "إضافة مستخدم",
    `<form class="modal-form">
      <div class="filter-grid">
        <label>الاسم<input name="name" required value="${escapeHtml(user.name || "")}"></label>
        <label>البريد<input type="email" name="email" required value="${escapeHtml(
          user.email || ""
        )}"></label>
        <label>الهاتف<input name="phone" value="${escapeHtml(user.phone || "")}"></label>
        <label>الدور<select name="role"><option value="admin">admin</option><option value="manager">manager</option><option value="support">support</option><option value="viewer">viewer</option></select></label>
        <label>الحالة<select name="status"><option value="active">active</option><option value="disabled">disabled</option><option value="expired">expired</option></select></label>
        <label>حالة الاشتراك<select name="subscriptionStatus"><option value="active">active</option><option value="disabled">disabled</option><option value="expired">expired</option></select></label>
        <label>الخطة<select name="planId">${planOptions}</select></label>
        <label>بداية الاشتراك<input type="date" name="subscriptionStart" value="${escapeHtml(
          user.subscriptionStart || ""
        )}"></label>
        <label>نهاية الاشتراك<input type="date" name="subscriptionEnd" value="${escapeHtml(
          user.subscriptionEnd || ""
        )}"></label>
      </div>
      <label>ملاحظات<textarea name="notes">${escapeHtml(user.notes || "")}</textarea></label>
      <div class="page-actions"><button class="btn-primary" type="submit">حفظ</button></div>
    </form>`,
    "حفظ",
    async (payload) => {
      if (user.id) {
        await window.api.put(`/users/${user.id}`, payload);
      } else {
        await window.api.post("/users", payload);
      }

      showToast("تم حفظ المستخدم.");
      store.users = [];
      await renderUsers();
    }
  );

  document.querySelector('.modal select[name="role"]').value = user.role || "viewer";
  document.querySelector('.modal select[name="status"]').value = user.status || "active";
  document.querySelector('.modal select[name="subscriptionStatus"]').value =
    user.subscriptionStatus || "active";
}

async function renderDevices() {
  const pageRoot = document.getElementById("pageRoot");
  pageRoot.innerHTML = loadingMarkup();
  const [users, response] = await Promise.all([
    fetchUsersList(),
    window.api.get("/devices", { ...store.filters, page: store.page, pageSize: 6 }),
  ]);

  pageRoot.innerHTML = `
    <section class="filter-card">
      <div class="topbar-actions"><h3>إدارة الأجهزة</h3><button class="btn-primary" id="addDeviceButton">ربط جهاز</button></div>
      <form class="filter-grid" id="filtersForm">
        <label>بحث<input name="search" value="${escapeHtml(store.filters.search || "")}" placeholder="موديل، UDID، مستخدم"></label>
        <label>الحالة<select name="status"><option value="">الكل</option><option value="active">active</option><option value="disabled">disabled</option></select></label>
        <div class="page-actions"><button class="btn-secondary" type="submit">تطبيق</button></div>
      </form>
    </section>
    <section class="section-card">
      <h3>قائمة الأجهزة</h3>
      ${tableMarkup(
        ["المستخدم", "الجهاز", "iOS", "UDID", "الحالة", "آخر نشاط", "إجراءات"],
        response.items.map(
          (device) => `<tr>
            <td>${escapeHtml(device.userName)}</td>
            <td>${escapeHtml(device.model)}</td>
            <td>${escapeHtml(device.iosVersion)}</td>
            <td>${escapeHtml(device.udid)}</td>
            <td><span class="${badgeClass(device.status)}">${escapeHtml(device.status)}</span></td>
            <td>${formatDate(device.lastActivity, true)}</td>
            <td><div class="inline-actions">
              <button class="btn-secondary" data-edit-device="${escapeHtml(device.id)}">تعديل</button>
              <button class="btn-danger" data-delete-device="${escapeHtml(device.id)}">حذف</button>
            </div></td>
          </tr>`
        ),
        "لا توجد أجهزة مسجلة."
      )}
      ${paginationMarkup(response.meta, store.page)}
    </section>
  `;

  pageRoot.querySelector('select[name="status"]').value = store.filters.status || "";
  bindFilters(renderDevices);

  document.getElementById("addDeviceButton")?.addEventListener("click", () =>
    openDeviceModal(users)
  );
  response.items.forEach((device) => {
    document.querySelector(`[data-edit-device="${device.id}"]`)?.addEventListener("click", () =>
      openDeviceModal(users, device)
    );
    document.querySelector(`[data-delete-device="${device.id}"]`)?.addEventListener("click", async () => {
      await window.api.delete(`/devices/${device.id}`);
      showToast("تم حذف الجهاز.");
      await renderDevices();
    });
  });
}

function openDeviceModal(users, device = {}) {
  const userOptions = users
    .map(
      (user) =>
        `<option value="${escapeHtml(user.id)}" ${device.userId === user.id ? "selected" : ""}>${escapeHtml(
          user.name
        )}</option>`
    )
    .join("");

  openModal(
    device.id ? "تعديل جهاز" : "ربط جهاز جديد",
    `<form class="modal-form">
      <div class="filter-grid">
        <label>المستخدم<select name="userId" required>${userOptions}</select></label>
        <label>الموديل<input name="model" required value="${escapeHtml(device.model || "")}"></label>
        <label>إصدار iOS<input name="iosVersion" required value="${escapeHtml(
          device.iosVersion || ""
        )}"></label>
        <label>UDID<input name="udid" required value="${escapeHtml(device.udid || "")}"></label>
        <label>الحالة<select name="status"><option value="active">active</option><option value="disabled">disabled</option></select></label>
        <label>آخر نشاط<input type="datetime-local" name="lastActivity" value="${escapeHtml(
          device.lastActivity ? device.lastActivity.slice(0, 16) : ""
        )}"></label>
      </div>
      <div class="page-actions"><button class="btn-primary" type="submit">حفظ</button></div>
    </form>`,
    "حفظ",
    async (payload) => {
      payload.lastActivity = payload.lastActivity ? new Date(payload.lastActivity).toISOString() : "";
      if (device.id) {
        await window.api.put(`/devices/${device.id}`, payload);
      } else {
        await window.api.post("/devices", payload);
      }
      showToast("تم حفظ الجهاز.");
      await renderDevices();
    }
  );

  document.querySelector('.modal select[name="status"]').value = device.status || "active";
}

async function renderSubscriptions() {
  const pageRoot = document.getElementById("pageRoot");
  pageRoot.innerHTML = loadingMarkup();
  const [users, plans, response] = await Promise.all([
    fetchUsersList(),
    fetchPlans(),
    window.api.get("/subscriptions", { ...store.filters, page: store.page, pageSize: 6 }),
  ]);

  pageRoot.innerHTML = `
    <section class="filter-card">
      <div class="topbar-actions"><h3>الاشتراكات والتجديد</h3><button class="btn-primary" id="renewButton">تجديد يدوي</button></div>
      <form class="filter-grid" id="filtersForm">
        <label>بحث<input name="search" value="${escapeHtml(store.filters.search || "")}" placeholder="اسم المستخدم أو الخطة"></label>
        <label>الحالة<select name="status"><option value="">الكل</option><option value="active">active</option><option value="disabled">disabled</option><option value="expired">expired</option></select></label>
        <div class="page-actions"><button class="btn-secondary" type="submit">تطبيق</button></div>
      </form>
    </section>
    <section class="section-card">
      <h3>قائمة الاشتراكات</h3>
      ${tableMarkup(
        ["المستخدم", "الخطة", "الحالة", "من", "إلى", "المبلغ", "تم يدويًا"],
        response.items.map(
          (subscription) => `<tr>
            <td>${escapeHtml(subscription.userName)}</td>
            <td>${escapeHtml(subscription.planName)}</td>
            <td><span class="${badgeClass(subscription.status)}">${escapeHtml(
              subscription.status
            )}</span></td>
            <td>${formatDate(subscription.startDate)}</td>
            <td>${formatDate(subscription.endDate)}</td>
            <td>${escapeHtml(subscription.amount)} $</td>
            <td>${subscription.renewedManually ? "نعم" : "لا"}</td>
          </tr>`
        ),
        "لا توجد اشتراكات."
      )}
      ${paginationMarkup(response.meta, store.page)}
    </section>
  `;

  pageRoot.querySelector('select[name="status"]').value = store.filters.status || "";
  bindFilters(renderSubscriptions);
  document.getElementById("renewButton")?.addEventListener("click", () =>
    openRenewModal(users, plans)
  );
}

function openRenewModal(users, plans) {
  const userOptions = users
    .map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)}</option>`)
    .join("");
  const planOptions = plans
    .map((plan) => `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.name)}</option>`)
    .join("");

  openModal(
    "تجديد اشتراك يدوي",
    `<form class="modal-form">
      <div class="filter-grid">
        <label>المستخدم<select name="userId" required>${userOptions}</select></label>
        <label>الخطة<select name="planId">${planOptions}</select></label>
        <label>الحالة<select name="status"><option value="active">active</option><option value="disabled">disabled</option><option value="expired">expired</option></select></label>
        <label>بداية الاشتراك<input type="date" name="startDate" required></label>
        <label>نهاية الاشتراك<input type="date" name="endDate" required></label>
        <label>المبلغ<input type="number" min="0" step="0.01" name="amount"></label>
      </div>
      <div class="page-actions"><button class="btn-primary" type="submit">تجديد</button></div>
    </form>`,
    "تجديد",
    async (payload) => {
      await window.api.post("/subscriptions/renew", payload);
      showToast("تم تجديد الاشتراك.");
      store.users = [];
      await renderSubscriptions();
    }
  );
}

async function renderCertificates() {
  const pageRoot = document.getElementById("pageRoot");
  pageRoot.innerHTML = loadingMarkup();
  const [plans, certificates, codes] = await Promise.all([
    fetchPlans(),
    window.api.get("/certificates", { ...store.filters, page: store.page, pageSize: 6 }),
    window.api.get("/codes", { ...store.filters, page: 1, pageSize: 6 }),
  ]);

  pageRoot.innerHTML = `
    <section class="filter-card">
      <div class="topbar-actions">
        <h3>إدارة الشهادات وأكواد التفعيل</h3>
        <div class="page-actions">
          <button class="btn-primary" id="addCertificateButton">إضافة شهادة</button>
          <button class="btn-secondary" id="addCodeButton">إنشاء كود</button>
        </div>
      </div>
      <form class="filter-grid" id="filtersForm">
        <label>بحث<input name="search" value="${escapeHtml(store.filters.search || "")}" placeholder="اسم الشهادة أو الكود"></label>
        <label>الحالة<select name="status"><option value="">الكل</option><option value="active">active</option><option value="expiring-soon">expiring-soon</option><option value="disabled">disabled</option><option value="expired">expired</option></select></label>
        <div class="page-actions"><button class="btn-secondary" type="submit">تطبيق</button></div>
      </form>
    </section>
    <div class="section-layout">
      <section class="section-card">
        <h3>الشهادات والملفات الشخصية</h3>
        ${tableMarkup(
          ["الاسم", "النوع", "الحالة", "الانتهاء", "التطبيقات", "إجراءات"],
          certificates.items.map(
            (certificate) => `<tr>
              <td>${escapeHtml(certificate.name)}</td>
              <td>${escapeHtml(certificate.type)}</td>
              <td><span class="${badgeClass(certificate.status)}">${escapeHtml(
                certificate.status
              )}</span></td>
              <td>${formatDate(certificate.expiresAt)}</td>
              <td>${escapeHtml(certificate.assignedApps || "—")}</td>
              <td><div class="inline-actions">
                <button class="btn-secondary" data-edit-certificate="${escapeHtml(
                  certificate.id
                )}">تعديل</button>
                <button class="btn-danger" data-delete-certificate="${escapeHtml(
                  certificate.id
                )}">حذف</button>
              </div></td>
            </tr>`
          ),
          "لا توجد شهادات."
        )}
        ${paginationMarkup(certificates.meta, store.page)}
      </section>
      <section class="section-card">
        <h3>أكواد التفعيل</h3>
        ${tableMarkup(
          ["الكود", "الخطة", "الحالة", "المستخدم", "ينتهي في", "الاستخدامات", "إجراءات"],
          codes.items.map(
            (code) => `<tr>
              <td>${escapeHtml(code.code)}</td>
              <td>${escapeHtml(code.planName)}</td>
              <td><span class="${badgeClass(code.status)}">${escapeHtml(code.status)}</span></td>
              <td>${escapeHtml(code.assignedUser || "غير مخصص")}</td>
              <td>${formatDate(code.expiresAt)}</td>
              <td>${escapeHtml(code.usesLeft)}</td>
              <td><button class="btn-danger" data-delete-code="${escapeHtml(code.id)}">إلغاء</button></td>
            </tr>`
          ),
          "لا توجد أكواد تفعيل."
        )}
      </section>
    </div>
  `;

  pageRoot.querySelector('select[name="status"]').value = store.filters.status || "";
  bindFilters(renderCertificates);
  document.getElementById("addCertificateButton")?.addEventListener("click", () =>
    openCertificateModal()
  );
  document.getElementById("addCodeButton")?.addEventListener("click", () => openCodeModal(plans));
  certificates.items.forEach((certificate) => {
    document
      .querySelector(`[data-edit-certificate="${certificate.id}"]`)
      ?.addEventListener("click", () => openCertificateModal(certificate));
    document
      .querySelector(`[data-delete-certificate="${certificate.id}"]`)
      ?.addEventListener("click", async () => {
        await window.api.delete(`/certificates/${certificate.id}`);
        showToast("تم حذف الشهادة.");
        await renderCertificates();
      });
  });
  codes.items.forEach((code) => {
    document.querySelector(`[data-delete-code="${code.id}"]`)?.addEventListener("click", async () => {
      await window.api.delete(`/codes/${code.id}`);
      showToast("تم إلغاء الكود.");
      await renderCertificates();
    });
  });
}

function openCertificateModal(certificate = {}) {
  openModal(
    certificate.id ? "تعديل شهادة" : "إضافة شهادة جديدة",
    `<form class="modal-form">
      <div class="filter-grid">
        <label>الاسم<input name="name" required value="${escapeHtml(certificate.name || "")}"></label>
        <label>النوع<select name="type"><option value="distribution">distribution</option><option value="push">push</option><option value="provisioning-profile">provisioning-profile</option></select></label>
        <label>الحالة<select name="status"><option value="active">active</option><option value="expiring-soon">expiring-soon</option><option value="disabled">disabled</option></select></label>
        <label>الانتهاء<input type="date" name="expiresAt" required value="${escapeHtml(
          certificate.expiresAt || ""
        )}"></label>
        <label>التطبيقات<input name="assignedApps" value="${escapeHtml(
          certificate.assignedApps || ""
        )}"></label>
        <label>Team ID<input name="teamId" value="${escapeHtml(certificate.teamId || "")}"></label>
        <label>عدد الملفات<input type="number" min="0" name="profileCount" value="${escapeHtml(
          certificate.profileCount || 0
        )}"></label>
      </div>
      <div class="page-actions"><button class="btn-primary" type="submit">حفظ</button></div>
    </form>`,
    "حفظ",
    async (payload) => {
      if (certificate.id) {
        await window.api.put(`/certificates/${certificate.id}`, payload);
      } else {
        await window.api.post("/certificates", payload);
      }
      showToast("تم حفظ الشهادة.");
      await renderCertificates();
    }
  );

  document.querySelector('.modal select[name="type"]').value = certificate.type || "distribution";
  document.querySelector('.modal select[name="status"]').value = certificate.status || "active";
}

function openCodeModal(plans) {
  const planOptions = plans
    .map((plan) => `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.name)}</option>`)
    .join("");

  openModal(
    "إنشاء كود تفعيل",
    `<form class="modal-form">
      <div class="filter-grid">
        <label>الكود (اختياري)<input name="code" placeholder="سيتم التوليد تلقائيًا"></label>
        <label>الخطة<select name="planId">${planOptions}</select></label>
        <label>الحالة<select name="status"><option value="active">active</option><option value="expired">expired</option></select></label>
        <label>المستخدم<input name="assignedUser" placeholder="اختياري"></label>
        <label>الانتهاء<input type="date" name="expiresAt" required></label>
        <label>الاستخدامات<input type="number" min="1" name="usesLeft" value="1"></label>
      </div>
      <div class="page-actions"><button class="btn-primary" type="submit">إنشاء</button></div>
    </form>`,
    "إنشاء",
    async (payload) => {
      await window.api.post("/codes", payload);
      showToast("تم إنشاء كود التفعيل.");
      await renderCertificates();
    }
  );
}

async function renderReports() {
  const pageRoot = document.getElementById("pageRoot");
  pageRoot.innerHTML = loadingMarkup();
  const [overview, logs] = await Promise.all([
    window.api.get("/overview/stats"),
    window.api.get("/activity-logs", { ...store.filters, page: store.page, pageSize: 8 }),
  ]);

  pageRoot.innerHTML = `
    <div class="card-grid">
      ${statCard("عدد المستخدمين النشطين", overview.stats.activeUsers, "جاهزية الوصول للخدمة")}
      ${statCard("الاشتراكات المنتهية", overview.stats.expiredSubscriptions, "حسابات تحتاج متابعة")}
      ${statCard("الأجهزة المسجلة", overview.stats.registeredDevices, "إجمالي الأصول في النظام")}
      ${statCard("العائد الحالي", `${overview.stats.revenue} $`, "قياس الإيرادات السريعة")}
    </div>
    <section class="filter-card" style="margin-top:20px;">
      <h3>سجل النشاطات</h3>
      <form class="filter-grid" id="filtersForm">
        <label>بحث<input name="search" value="${escapeHtml(store.filters.search || "")}" placeholder="فاعل، عملية، هدف"></label>
        <div class="page-actions"><button class="btn-secondary" type="submit">تطبيق</button></div>
      </form>
      ${tableMarkup(
        ["الفاعل", "الإجراء", "الهدف", "التفاصيل", "التوقيت", "المستوى"],
        logs.items.map(
          (entry) => `<tr>
            <td>${escapeHtml(entry.actor)}</td>
            <td>${escapeHtml(entry.action)}</td>
            <td>${escapeHtml(entry.target)}</td>
            <td>${escapeHtml(entry.details)}</td>
            <td>${formatDate(entry.timestamp, true)}</td>
            <td><span class="${badgeClass(entry.level)}">${escapeHtml(entry.level)}</span></td>
          </tr>`
        ),
        "لا توجد نشاطات حالية."
      )}
      ${paginationMarkup(logs.meta, store.page)}
    </section>
  `;

  bindFilters(renderReports);
}

document.addEventListener("DOMContentLoaded", async () => {
  applySavedTheme();
  if (document.body.dataset.page === "login") {
    return;
  }

  const allowed = await window.auth.requireAuth();
  if (!allowed) {
    return;
  }

  baseShell(window.auth.user || { email: "admin", role: "admin" });

  try {
    const page = document.body.dataset.page;
    if (page === "dashboard") await renderDashboard();
    if (page === "users") await renderUsers();
    if (page === "devices") await renderDevices();
    if (page === "subscriptions") await renderSubscriptions();
    if (page === "certificates") await renderCertificates();
    if (page === "reports") await renderReports();
  } catch (error) {
    document.getElementById("pageRoot").innerHTML = emptyMarkup(error.message);
    showToast(error.message, "error");
  }
});
