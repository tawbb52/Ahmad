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

  const tasks = [
    {
      id: "task-001",
      title: "إعداد شهادات التوزيع الجديدة",
      description: "تجديد شهادات التوزيع المنتهية وتعيينها للتطبيقات النشطة",
      status: "completed",
      priority: "high",
      category: "certificates",
      assignedTo: "أحمد العتيبي",
      dueDate: "2026-06-20",
      createdAt: "2026-06-01T09:00:00.000Z",
      updatedAt: "2026-06-18T14:30:00.000Z",
    },
    {
      id: "task-002",
      title: "مراجعة الاشتراكات المنتهية",
      description: "التواصل مع المشتركين الذين انتهت اشتراكاتهم وعرض التجديد",
      status: "in-progress",
      priority: "high",
      category: "subscriptions",
      assignedTo: "سارة الحربي",
      dueDate: "2026-07-05",
      createdAt: "2026-06-15T10:00:00.000Z",
      updatedAt: "2026-06-28T11:00:00.000Z",
    },
    {
      id: "task-003",
      title: "تحديث نظام التحقق من الأجهزة",
      description: "تطوير آلية جديدة للتحقق من هوية الأجهزة المسجلة",
      status: "in-progress",
      priority: "medium",
      category: "backend",
      assignedTo: "أحمد العتيبي",
      dueDate: "2026-07-15",
      createdAt: "2026-06-10T08:00:00.000Z",
      updatedAt: "2026-06-25T16:00:00.000Z",
    },
    {
      id: "task-004",
      title: "تحسين واجهة لوحة التحكم على الجوال",
      description: "ضمان التوافق الكامل مع الشاشات الصغيرة وتحسين أداء التطبيق",
      status: "completed",
      priority: "medium",
      category: "frontend",
      assignedTo: "سارة الحربي",
      dueDate: "2026-06-29",
      createdAt: "2026-06-20T09:00:00.000Z",
      updatedAt: "2026-06-29T18:00:00.000Z",
    },
    {
      id: "task-005",
      title: "كتابة اختبارات نهاية إلى نهاية لمسار المصادقة",
      description: "تغطية سيناريوهات تسجيل الدخول والخروج وانتهاء الجلسة",
      status: "pending",
      priority: "medium",
      category: "testing",
      assignedTo: "محمد القحطاني",
      dueDate: "2026-07-20",
      createdAt: "2026-06-22T11:00:00.000Z",
      updatedAt: "2026-06-22T11:00:00.000Z",
    },
    {
      id: "task-006",
      title: "نشر الإصدار 2.1 على الخادم الإنتاجي",
      description: "نقل التحديثات الأخيرة إلى بيئة الإنتاج مع اختبار سلامة البيانات",
      status: "pending",
      priority: "high",
      category: "deployment",
      assignedTo: "أحمد العتيبي",
      dueDate: "2026-07-10",
      createdAt: "2026-06-28T12:00:00.000Z",
      updatedAt: "2026-06-28T12:00:00.000Z",
    },
    {
      id: "task-007",
      title: "توثيق API لنقاط نهاية الأجهزة",
      description: "كتابة وثائق شاملة لجميع نقاط نهاية API الخاصة بإدارة الأجهزة",
      status: "cancelled",
      priority: "low",
      category: "docs",
      assignedTo: "ريم المطيري",
      dueDate: "2026-06-30",
      createdAt: "2026-06-05T10:00:00.000Z",
      updatedAt: "2026-06-20T09:00:00.000Z",
    },
    {
      id: "task-008",
      title: "إعداد نظام الإشعارات للاشتراكات",
      description: "إرسال إشعارات تلقائية قبل انتهاء الاشتراكات بأسبوع",
      status: "pending",
      priority: "low",
      category: "backend",
      assignedTo: "سارة الحربي",
      dueDate: "2026-07-30",
      createdAt: "2026-06-28T14:00:00.000Z",
      updatedAt: "2026-06-28T14:00:00.000Z",
    },
  ];

  return { plans, users, devices, subscriptions, certificates, activationCodes, activityLogs, tasks };
}

function createDataStore(env) {
  const state = buildSeedData(env.adminEmail || "admin@ahmad.local");

  function getUser(userId) {
    return state.users.find((user) => user.id === userId);
  }

  function getPlan(planId) {
    return state.plans.find((plan) => plan.id === planId);
  }

  function enrichUser(user) {
    const plan = getPlan(user.planId);
    const devicesCount = state.devices.filter((device) => device.userId === user.id).length;
    return {
      ...user,
      planName: plan?.name || "غير محدد",
      devicesCount,
    };
  }

  function logActivity(action, target, details, level = "info") {
    state.activityLogs.unshift({
      id: randomUUID(),
      actor: env.adminEmail || "admin@ahmad.local",
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
        id: "admin-root",
        email: env.adminEmail || "admin@ahmad.local",
        role: "admin",
        permissions: [
          "users:read",
          "users:write",
          "devices:read",
          "devices:write",
          "subscriptions:read",
          "subscriptions:write",
          "certificates:read",
          "certificates:write",
          "codes:read",
          "codes:write",
          "tasks:read",
          "tasks:write",
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

      const tasksByStatus = {
        pending: state.tasks.filter((t) => t.status === "pending").length,
        "in-progress": state.tasks.filter((t) => t.status === "in-progress").length,
        completed: state.tasks.filter((t) => t.status === "completed").length,
        cancelled: state.tasks.filter((t) => t.status === "cancelled").length,
      };

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
        tasksSummary: {
          total: state.tasks.length,
          byStatus: tasksByStatus,
          completionRate:
            state.tasks.length > 0
              ? Math.round((tasksByStatus.completed / state.tasks.length) * 100)
              : 0,
          recentTasks: state.tasks
            .filter((t) => t.status !== "cancelled")
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5),
        },
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
        lastLogin: null,
        subscriptionStart: payload.subscriptionStart || null,
        subscriptionEnd: payload.subscriptionEnd || null,
        notes: payload.notes || "",
      };

      state.users.push(user);
      logActivity("create_user", user.name, `إنشاء حساب جديد (${user.role})`, "success");
      return enrichUser(user);
    },

    updateUser(userId, payload) {
      const index = state.users.findIndex((user) => user.id === userId);
      if (index === -1) {
        return null;
      }

      const updated = { ...state.users[index], ...payload, id: userId };
      state.users[index] = updated;
      logActivity("update_user", updated.name, "تحديث بيانات المستخدم", "info");
      return enrichUser(updated);
    },

    deleteUser(userId) {
      const index = state.users.findIndex((user) => user.id === userId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.users.splice(index, 1);
      logActivity("delete_user", removed.name, "حذف الحساب نهائيًا", "warning");
      return true;
    },

    listDevices(query = {}) {
      const filtered = state.devices
        .filter((device) =>
          includesTerm(
            [device.model, device.udid, device.iosVersion, getUser(device.userId)?.name],
            query.search
          )
        )
        .filter((device) => (query.status ? device.status === query.status : true))
        .filter((device) => (query.userId ? device.userId === query.userId : true))
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        .map((device) => ({
          ...device,
          userName: getUser(device.userId)?.name || "غير معروف",
        }));

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
        lastActivity: new Date().toISOString(),
      };

      state.devices.push(device);
      logActivity("add_device", device.model, `تسجيل جهاز iOS جديد`, "success");
      return {
        ...device,
        userName: getUser(device.userId)?.name || "غير معروف",
      };
    },

    updateDevice(deviceId, payload) {
      const index = state.devices.findIndex((device) => device.id === deviceId);
      if (index === -1) {
        return null;
      }

      const updated = { ...state.devices[index], ...payload, id: deviceId };
      state.devices[index] = updated;
      logActivity("update_device", updated.model, "تحديث بيانات الجهاز", "info");
      return {
        ...updated,
        userName: getUser(updated.userId)?.name || "غير معروف",
      };
    },

    deleteDevice(deviceId) {
      const index = state.devices.findIndex((device) => device.id === deviceId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.devices.splice(index, 1);
      logActivity("delete_device", removed.model, "إزالة جهاز iOS", "warning");
      return true;
    },

    listPlans() {
      return state.plans;
    },

    listSubscriptions(query = {}) {
      const filtered = state.subscriptions
        .filter((subscription) => {
          const user = getUser(subscription.userId);
          const plan = getPlan(subscription.planId);
          return includesTerm([user?.name, user?.email, plan?.name], query.search);
        })
        .filter((subscription) =>
          query.status ? subscription.status === query.status : true
        )
        .filter((subscription) =>
          query.from || query.to
            ? betweenDates(subscription.startDate, query.from, query.to)
            : true
        )
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .map((subscription) => ({
          ...subscription,
          userName: getUser(subscription.userId)?.name || "غير معروف",
          planName: getPlan(subscription.planId)?.name || "غير محدد",
        }));

      return withPagination(filtered, query.page, query.pageSize);
    },

    renewSubscription(payload) {
      const user = getUser(payload.userId);
      if (!user) {
        return null;
      }

      const subscription = {
        id: randomUUID(),
        userId: payload.userId,
        planId: payload.planId || user.planId,
        status: "active",
        startDate: payload.startDate,
        endDate: payload.endDate,
        amount: payload.amount || getPlan(payload.planId || user.planId)?.price || 0,
        renewedManually: true,
      };

      state.subscriptions.unshift(subscription);

      const userIndex = state.users.findIndex((u) => u.id === payload.userId);
      if (userIndex !== -1) {
        state.users[userIndex].subscriptionStatus = "active";
        state.users[userIndex].planId = subscription.planId;
        state.users[userIndex].subscriptionStart = subscription.startDate;
        state.users[userIndex].subscriptionEnd = subscription.endDate;
      }

      logActivity("renew_subscription", user.name, "تجديد الاشتراك يدويًا", "success");

      return {
        ...subscription,
        userName: user.name,
        planName: getPlan(subscription.planId)?.name || "غير محدد",
      };
    },

    listCertificates(query = {}) {
      const filtered = state.certificates
        .filter((certificate) =>
          includesTerm([certificate.name, certificate.type, certificate.teamId], query.search)
        )
        .filter((certificate) =>
          query.status ? certificate.status === query.status : true
        )
        .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

      return withPagination(filtered, query.page, query.pageSize);
    },

    createCertificate(payload) {
      const certificate = {
        id: randomUUID(),
        name: payload.name,
        type: payload.type || "distribution",
        status: payload.status || "active",
        expiresAt: payload.expiresAt,
        assignedApps: payload.assignedApps || "",
        teamId: payload.teamId || "",
        profileCount: Number(payload.profileCount || 0),
      };

      state.certificates.unshift(certificate);
      logActivity("create_certificate", certificate.name, "إضافة شهادة iOS جديدة", "success");
      return certificate;
    },

    updateCertificate(certificateId, payload) {
      const certificate = state.certificates.find((item) => item.id === certificateId);
      if (!certificate) {
        return null;
      }

      Object.assign(certificate, payload, { id: certificateId });
      logActivity("update_certificate", certificate.name, "تحديث بيانات الشهادة", "info");
      return certificate;
    },

    deleteCertificate(certificateId) {
      const index = state.certificates.findIndex((certificate) => certificate.id === certificateId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.certificates.splice(index, 1);
      logActivity("delete_certificate", removed.name, "حذف شهادة iOS", "warning");
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

    listTasks(query = {}) {
      const filtered = state.tasks
        .filter((task) =>
          includesTerm([task.title, task.description, task.assignedTo, task.category], query.search)
        )
        .filter((task) => (query.status ? task.status === query.status : true))
        .filter((task) => (query.priority ? task.priority === query.priority : true))
        .filter((task) => (query.category ? task.category === query.category : true))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return withPagination(filtered, query.page, query.pageSize);
    },

    createTask(payload) {
      const now = new Date().toISOString();
      const task = {
        id: randomUUID(),
        title: payload.title,
        description: payload.description || "",
        status: payload.status || "pending",
        priority: payload.priority || "medium",
        category: payload.category || "general",
        assignedTo: payload.assignedTo || "",
        dueDate: payload.dueDate || null,
        createdAt: now,
        updatedAt: now,
      };

      state.tasks.unshift(task);
      logActivity("create_task", task.title, `إنشاء مهمة جديدة (${task.category})`, "info");
      return task;
    },

    updateTask(taskId, payload) {
      const index = state.tasks.findIndex((task) => task.id === taskId);
      if (index === -1) {
        return null;
      }

      const updated = {
        ...state.tasks[index],
        ...payload,
        id: taskId,
        updatedAt: new Date().toISOString(),
      };
      state.tasks[index] = updated;
      logActivity("update_task", updated.title, `تحديث حالة المهمة إلى ${updated.status}`, "info");
      return updated;
    },

    deleteTask(taskId) {
      const index = state.tasks.findIndex((task) => task.id === taskId);
      if (index === -1) {
        return false;
      }

      const [removed] = state.tasks.splice(index, 1);
      logActivity("delete_task", removed.title, "حذف المهمة", "warning");
      return true;
    },
  };
}

module.exports = { createDataStore };
