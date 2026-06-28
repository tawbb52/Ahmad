const { randomUUID } = require("node:crypto");

function withPagination(items, page = 1, pageSize = 8) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 8, 1), 50);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);
  const offset = (safePage - 1) * safePageSize;

  return {
    items: items.slice(offset, offset + safePageSize),
    meta: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
    },
  };
}

function includesTerm(values, term) {
  if (!term) {
    return true;
  }

  const normalized = term.trim().toLowerCase();
  return values.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalized)
  );
}

function betweenDates(value, from, to) {
  if (!value) {
    return false;
  }

  const current = new Date(value).getTime();
  const fromTime = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
  const toTime = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;

  return current >= fromTime && current <= toTime;
}

function buildSeedData(adminEmail) {
  const plans = [
    {
      id: "plan-pro",
      name: "Pro Annual",
      price: 199,
      durationDays: 365,
      deviceLimit: 5,
      status: "active",
      description: "خطة سنوية مرنة لإدارة الفرق والأجهزة.",
    },
    {
      id: "plan-business",
      name: "Business Quarterly",
      price: 89,
      durationDays: 90,
      deviceLimit: 10,
      status: "active",
      description: "خطة مخصصة للإدارات التي تدير أكثر من تطبيق.",
    },
    {
      id: "plan-lite",
      name: "Lite Monthly",
      price: 19,
      durationDays: 30,
      deviceLimit: 2,
      status: "draft",
      description: "خطة سريعة للتجارب وإدارة الأجهزة المحدودة.",
    },
  ];

  const users = [
    {
      id: "user-001",
      name: "أحمد العتيبي",
      email: "ahmad@example.com",
      phone: "+966500000001",
      role: "admin",
      status: "active",
      subscriptionStatus: "active",
      planId: "plan-business",
      createdAt: "2026-05-12T09:00:00.000Z",
      lastLogin: "2026-06-28T21:45:00.000Z",
      subscriptionStart: "2026-04-01",
      subscriptionEnd: "2026-07-01",
      notes: "مدير الحساب الرئيسي",
    },
    {
      id: "user-002",
      name: "سارة الحربي",
      email: "sarah@example.com",
      phone: "+966500000002",
      role: "manager",
      status: "active",
      subscriptionStatus: "active",
      planId: "plan-pro",
      createdAt: "2026-04-18T10:15:00.000Z",
      lastLogin: "2026-06-28T19:10:00.000Z",
      subscriptionStart: "2026-02-11",
      subscriptionEnd: "2027-02-11",
      notes: "تشرف على أجهزة المبيعات",
    },
    {
      id: "user-003",
      name: "محمد القحطاني",
      email: "mohammed@example.com",
      phone: "+966500000003",
      role: "support",
      status: "disabled",
      subscriptionStatus: "disabled",
      planId: "plan-lite",
      createdAt: "2026-03-02T08:00:00.000Z",
      lastLogin: "2026-06-24T08:30:00.000Z",
      subscriptionStart: "2026-05-01",
      subscriptionEnd: "2026-06-01",
      notes: "موقوف مؤقتًا بانتظار التحقق",
    },
    {
      id: "user-004",
      name: "ريم المطيري",
      email: "reem@example.com",
      phone: "+966500000004",
      role: "viewer",
      status: "expired",
      subscriptionStatus: "expired",
      planId: "plan-pro",
      createdAt: "2026-01-08T16:00:00.000Z",
      lastLogin: "2026-06-10T18:00:00.000Z",
      subscriptionStart: "2025-12-10",
      subscriptionEnd: "2026-06-10",
      notes: "ينتظر التجديد اليدوي",
    },
  ];

  const devices = [
    {
      id: "device-001",
      userId: "user-001",
      model: "iPhone 15 Pro",
      iosVersion: "17.5.1",
      udid: "00008120-001C241E0A90003A",
      status: "active",
      lastActivity: "2026-06-28T22:00:00.000Z",
    },
    {
      id: "device-002",
      userId: "user-001",
      model: "iPad Air 6",
      iosVersion: "17.4",
      udid: "00008103-001514AA0A91003B",
      status: "active",
      lastActivity: "2026-06-28T16:20:00.000Z",
    },
    {
      id: "device-003",
      userId: "user-002",
      model: "iPhone 14",
      iosVersion: "16.7.8",
      udid: "00008110-000C5D8E3E89003C",
      status: "active",
      lastActivity: "2026-06-28T20:10:00.000Z",
    },
    {
      id: "device-004",
      userId: "user-004",
      model: "iPhone 13 mini",
      iosVersion: "17.0.3",
      udid: "00008101-000451080EB8003D",
      status: "disabled",
      lastActivity: "2026-06-02T11:00:00.000Z",
    },
  ];

  const subscriptions = [
    {
      id: "sub-001",
      userId: "user-001",
      planId: "plan-business",
      status: "active",
      startDate: "2026-04-01",
      endDate: "2026-07-01",
      amount: 89,
      renewedManually: true,
    },
    {
      id: "sub-002",
      userId: "user-002",
      planId: "plan-pro",
      status: "active",
      startDate: "2026-02-11",
      endDate: "2027-02-11",
      amount: 199,
      renewedManually: false,
    },
    {
      id: "sub-003",
      userId: "user-003",
      planId: "plan-lite",
      status: "disabled",
      startDate: "2026-05-01",
      endDate: "2026-06-01",
      amount: 19,
      renewedManually: false,
    },
    {
      id: "sub-004",
      userId: "user-004",
      planId: "plan-pro",
      status: "expired",
      startDate: "2025-12-10",
      endDate: "2026-06-10",
      amount: 199,
      renewedManually: false,
    },
  ];

  const certificates = [
    {
      id: "cert-001",
      name: "Ahmad Distribution 2026",
      type: "distribution",
      status: "active",
      expiresAt: "2027-03-15",
      assignedApps: "Ahmad Store, Ahmad Client",
      teamId: "TEAM9A2B",
      profileCount: 3,
    },
    {
      id: "cert-002",
      name: "Ahmad Push Services",
      type: "push",
      status: "expiring-soon",
      expiresAt: "2026-07-10",
      assignedApps: "Ahmad Notifications",
      teamId: "TEAM9A2B",
      profileCount: 1,
    },
    {
      id: "cert-003",
      name: "Ahmad QA Provisioning",
      type: "provisioning-profile",
      status: "disabled",
      expiresAt: "2026-05-30",
      assignedApps: "Ahmad QA",
      teamId: "TEAM9A2B",
      profileCount: 2,
    },
  ];

  const activationCodes = [
    {
      id: "code-001",
      code: "AHMAD-PRO-2026",
      planId: "plan-pro",
      status: "active",
      assignedUser: "سارة الحربي",
      expiresAt: "2026-12-31",
      usesLeft: 1,
      createdAt: "2026-06-01T12:00:00.000Z",
    },
    {
      id: "code-002",
      code: "AHMAD-LITE-EXPIRED",
      planId: "plan-lite",
      status: "expired",
      assignedUser: "ريم المطيري",
      expiresAt: "2026-06-10",
      usesLeft: 0,
      createdAt: "2026-05-01T12:00:00.000Z",
    },
  ];

  const activityLogs = [
    {
      id: randomUUID(),
      actor: adminEmail,
      action: "login",
      target: "Admin dashboard",
      level: "info",
      details: "جلسة إدارية تمهيدية ناجحة",
      timestamp: "2026-06-28T20:10:00.000Z",
    },
    {
      id: randomUUID(),
      actor: adminEmail,
      action: "renew_subscription",
      target: "أحمد العتيبي",
      level: "success",
      details: "تم التجديد اليدوي لخطة Business Quarterly",
      timestamp: "2026-06-27T11:30:00.000Z",
    },
    {
      id: randomUUID(),
      actor: adminEmail,
      action: "disable_device",
      target: "iPhone 13 mini",
      level: "warning",
      details: "تعطيل جهاز غير نشط",
      timestamp: "2026-06-25T14:20:00.000Z",
    },
  ];

  return { plans, users, devices, subscriptions, certificates, activationCodes, activityLogs };
}

function createDataStore(env) {
  const state = buildSeedData(env.adminEmail);

  function getUser(userId) {
    return state.users.find((user) => user.id === userId);
  }

  function getPlan(planId) {
    return state.plans.find((plan) => plan.id === planId);
  }

  function enrichUser(user) {
    const userDevices = state.devices.filter((device) => device.userId === user.id);
    const plan = getPlan(user.planId);
    return {
      ...user,
      planName: plan ? plan.name : "غير محدد",
      devicesCount: userDevices.length,
    };
  }

  function logActivity(action, target, details, level = "info") {
    state.activityLogs.unshift({
      id: randomUUID(),
      actor: env.adminEmail,
      action,
      target,
      level,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    getAdminProfile() {
      return {
        id: "admin-001",
        name: "لوحة أحمد الإدارية",
        email: env.adminEmail,
        role: "admin",
        permissions: [
          "users:read",
          "users:write",
          "devices:write",
          "subscriptions:write",
          "certificates:write",
          "reports:read",
        ],
      };
    },

    listOverview() {
      const activeUsers = state.users.filter((user) => user.status === "active").length;
      const activeSubscriptions = state.subscriptions.filter(
        (subscription) => subscription.status === "active"
      ).length;
      const expiredSubscriptions = state.subscriptions.filter(
        (subscription) => subscription.status === "expired"
      ).length;
      const activeDevices = state.devices.filter((device) => device.status === "active").length;
      const monthlyRevenue = state.subscriptions
        .filter((subscription) => subscription.status === "active")
        .reduce((sum, subscription) => sum + Number(subscription.amount || 0), 0);

      return {
        stats: {
          totalUsers: state.users.length,
          activeUsers,
          activeSubscriptions,
          expiredSubscriptions,
          registeredDevices: state.devices.length,
          activeDevices,
          activeCertificates: state.certificates.filter((item) => item.status === "active").length,
          revenue: monthlyRevenue,
        },
        recentActivity: state.activityLogs.slice(0, 6),
        expiringCertificates: state.certificates
          .filter((certificate) => certificate.status !== "disabled")
          .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt))
          .slice(0, 4),
      };
    },

    listUsers(query = {}) {
      const filtered = state.users
        .filter((user) =>
          includesTerm(
            [user.name, user.email, user.phone, getPlan(user.planId)?.name],
            query.search
          )
        )
        .filter((user) => (query.status ? user.status === query.status : true))
        .filter((user) =>
          query.subscriptionStatus ? user.subscriptionStatus === query.subscriptionStatus : true
        )
        .filter((user) =>
          query.from || query.to ? betweenDates(user.createdAt, query.from, query.to) : true
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(enrichUser);

      return withPagination(filtered, query.page, query.pageSize);
    },

    createUser(payload) {
      const user = {
        id: randomUUID(),
        name: payload.name,
        email: payload.email,
        phone: payload.phone || "",
        role: payload.role || "viewer",
        status: payload.status || "active",
        subscriptionStatus: payload.subscriptionStatus || "active",
        planId: payload.planId || "plan-lite",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionStart: payload.subscriptionStart || new Date().toISOString().slice(0, 10),
        subscriptionEnd: payload.subscriptionEnd || new Date().toISOString().slice(0, 10),
        notes: payload.notes || "",
      };

      state.users.unshift(user);
      const plan = getPlan(user.planId);
      state.subscriptions.unshift({
        id: randomUUID(),
        userId: user.id,
        planId: user.planId,
        status: user.subscriptionStatus,
        startDate: user.subscriptionStart,
        endDate: user.subscriptionEnd,
        amount: plan ? plan.price : 0,
        renewedManually: false,
      });
      logActivity("create_user", user.name, `إضافة مستخدم جديد (${user.email})`, "success");
      return enrichUser(user);
    },

    updateUser(userId, payload) {
      const user = getUser(userId);

      if (!user) {
        return null;
      }

      Object.assign(user, {
        name: payload.name ?? user.name,
        email: payload.email ?? user.email,
        phone: payload.phone ?? user.phone,
        role: payload.role ?? user.role,
        status: payload.status ?? user.status,
        subscriptionStatus: payload.subscriptionStatus ?? user.subscriptionStatus,
        planId: payload.planId ?? user.planId,
        subscriptionStart: payload.subscriptionStart ?? user.subscriptionStart,
        subscriptionEnd: payload.subscriptionEnd ?? user.subscriptionEnd,
        notes: payload.notes ?? user.notes,
      });

      const subscription = state.subscriptions.find((item) => item.userId === user.id);
      if (subscription) {
        subscription.planId = user.planId;
        subscription.status = user.subscriptionStatus;
        subscription.startDate = user.subscriptionStart;
        subscription.endDate = user.subscriptionEnd;
        subscription.amount = getPlan(user.planId)?.price || subscription.amount;
      }

      logActivity("update_user", user.name, "تحديث بيانات المستخدم والاشتراك", "info");
      return enrichUser(user);
    },

    deleteUser(userId) {
      const index = state.users.findIndex((user) => user.id === userId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.users.splice(index, 1);
      state.devices = state.devices.filter((device) => device.userId !== userId);
      state.subscriptions = state.subscriptions.filter((item) => item.userId !== userId);
      state.activationCodes = state.activationCodes.map((code) =>
        code.assignedUser === removed.name ? { ...code, assignedUser: "" } : code
      );
      logActivity("delete_user", removed.name, "حذف المستخدم والأصول المرتبطة به", "warning");
      return true;
    },

    listDevices(query = {}) {
      const filtered = state.devices
        .map((device) => ({
          ...device,
          userName: getUser(device.userId)?.name || "غير مرتبط",
        }))
        .filter((device) =>
          includesTerm([device.model, device.iosVersion, device.udid, device.userName], query.search)
        )
        .filter((device) => (query.status ? device.status === query.status : true))
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

      return withPagination(filtered, query.page, query.pageSize);
    },

    createDevice(payload) {
      const device = {
        id: randomUUID(),
        userId: payload.userId,
        model: payload.model,
        iosVersion: payload.iosVersion,
        udid: payload.udid,
        status: payload.status || "active",
        lastActivity: payload.lastActivity || new Date().toISOString(),
      };

      state.devices.unshift(device);
      logActivity("create_device", device.model, "تم ربط جهاز جديد بالمستخدم", "success");
      return {
        ...device,
        userName: getUser(device.userId)?.name || "غير مرتبط",
      };
    },

    updateDevice(deviceId, payload) {
      const device = state.devices.find((item) => item.id === deviceId);
      if (!device) {
        return null;
      }

      Object.assign(device, {
        userId: payload.userId ?? device.userId,
        model: payload.model ?? device.model,
        iosVersion: payload.iosVersion ?? device.iosVersion,
        udid: payload.udid ?? device.udid,
        status: payload.status ?? device.status,
        lastActivity: payload.lastActivity ?? device.lastActivity,
      });

      logActivity("update_device", device.model, "تم تحديث بيانات الجهاز", "info");
      return {
        ...device,
        userName: getUser(device.userId)?.name || "غير مرتبط",
      };
    },

    deleteDevice(deviceId) {
      const index = state.devices.findIndex((device) => device.id === deviceId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.devices.splice(index, 1);
      logActivity("delete_device", removed.model, "تم حذف الجهاز من النظام", "warning");
      return true;
    },

    listPlans() {
      return state.plans;
    },

    listSubscriptions(query = {}) {
      const filtered = state.subscriptions
        .map((subscription) => ({
          ...subscription,
          userName: getUser(subscription.userId)?.name || "غير معروف",
          planName: getPlan(subscription.planId)?.name || "غير محدد",
        }))
        .filter((subscription) =>
          includesTerm([subscription.userName, subscription.planName], query.search)
        )
        .filter((subscription) => (query.status ? subscription.status === query.status : true))
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

      return withPagination(filtered, query.page, query.pageSize);
    },

    renewSubscription(payload) {
      const user = getUser(payload.userId);
      if (!user) {
        return null;
      }

      const plan = getPlan(payload.planId || user.planId);
      let subscription = state.subscriptions.find((item) => item.userId === user.id);

      if (!subscription) {
        subscription = { id: randomUUID(), userId: user.id };
        state.subscriptions.unshift(subscription);
      }

      Object.assign(subscription, {
        planId: payload.planId || user.planId,
        status: payload.status || "active",
        startDate: payload.startDate,
        endDate: payload.endDate,
        amount: Number(payload.amount || plan?.price || 0),
        renewedManually: true,
      });

      Object.assign(user, {
        planId: subscription.planId,
        subscriptionStatus: subscription.status,
        subscriptionStart: subscription.startDate,
        subscriptionEnd: subscription.endDate,
        status: subscription.status === "active" ? "active" : user.status,
      });

      logActivity(
        "renew_subscription",
        user.name,
        `تجديد يدوي حتى ${subscription.endDate}`,
        "success"
      );

      return {
        ...subscription,
        userName: user.name,
        planName: getPlan(subscription.planId)?.name || "غير محدد",
      };
    },

    listCertificates(query = {}) {
      const filtered = state.certificates
        .filter((certificate) =>
          includesTerm(
            [certificate.name, certificate.type, certificate.assignedApps, certificate.teamId],
            query.search
          )
        )
        .filter((certificate) => (query.status ? certificate.status === query.status : true))
        .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

      return withPagination(filtered, query.page, query.pageSize);
    },

    createCertificate(payload) {
      const certificate = {
        id: randomUUID(),
        name: payload.name,
        type: payload.type,
        status: payload.status || "active",
        expiresAt: payload.expiresAt,
        assignedApps: payload.assignedApps || "",
        teamId: payload.teamId || "",
        profileCount: Number(payload.profileCount || 0),
      };

      state.certificates.unshift(certificate);
      logActivity("create_certificate", certificate.name, "إضافة شهادة أو ملف شخصي", "success");
      return certificate;
    },

    updateCertificate(certificateId, payload) {
      const certificate = state.certificates.find((item) => item.id === certificateId);
      if (!certificate) {
        return null;
      }

      Object.assign(certificate, payload);
      logActivity("update_certificate", certificate.name, "تحديث حالة الشهادة", "info");
      return certificate;
    },

    deleteCertificate(certificateId) {
      const index = state.certificates.findIndex((certificate) => certificate.id === certificateId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.certificates.splice(index, 1);
      logActivity("delete_certificate", removed.name, "حذف شهادة من السجل", "warning");
      return true;
    },

    listCodes(query = {}) {
      const filtered = state.activationCodes
        .map((code) => ({
          ...code,
          planName: getPlan(code.planId)?.name || "غير محدد",
        }))
        .filter((code) => includesTerm([code.code, code.assignedUser, code.planName], query.search))
        .filter((code) => (query.status ? code.status === query.status : true))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return withPagination(filtered, query.page, query.pageSize);
    },

    createCode(payload) {
      const code = {
        id: randomUUID(),
        code:
          payload.code ||
          `AHMAD-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
            .toString()
            .slice(-4)}`,
        planId: payload.planId || "plan-lite",
        status: payload.status || "active",
        assignedUser: payload.assignedUser || "",
        expiresAt: payload.expiresAt,
        usesLeft: Number(payload.usesLeft || 1),
        createdAt: new Date().toISOString(),
      };

      state.activationCodes.unshift(code);
      logActivity("create_code", code.code, "إنشاء كود تفعيل جديد", "success");
      return {
        ...code,
        planName: getPlan(code.planId)?.name || "غير محدد",
      };
    },

    deleteCode(codeId) {
      const index = state.activationCodes.findIndex((code) => code.id === codeId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.activationCodes.splice(index, 1);
      logActivity("delete_code", removed.code, "إلغاء كود التفعيل", "warning");
      return true;
    },

    listActivityLogs(query = {}) {
      const filtered = state.activityLogs.filter((entry) =>
        includesTerm([entry.actor, entry.action, entry.target, entry.details], query.search)
      );

      return withPagination(filtered, query.page, query.pageSize);
    },
  };
}

module.exports = { createDataStore };
