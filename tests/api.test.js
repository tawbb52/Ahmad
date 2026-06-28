const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../backend/server");

function createAuthenticatedClient() {
  const app = createApp({
    adminEmail: "admin@test.local",
    adminPassword: "Pass123!",
    jwtSecret: "test-secret",
  });

  return {
    app,
    async login() {
      const response = await request(app).post("/api/auth/login").send({
        email: "admin@test.local",
        password: "Pass123!",
      });

      return response.body.token;
    },
  };
}

test("rejects protected endpoints without a token", async () => {
  const { app } = createAuthenticatedClient();
  const response = await request(app).get("/api/users");

  assert.equal(response.status, 401);
});

test("logs in and returns dashboard overview", async () => {
  const client = createAuthenticatedClient();
  const token = await client.login();
  const response = await request(client.app)
    .get("/api/overview/stats")
    .set("Authorization", "Bearer " + token);

  assert.equal(response.status, 200);
  assert.equal(response.body.stats.totalUsers, 4);
  assert.equal(Array.isArray(response.body.recentActivity), true);
});

test("creates, updates, and deletes a user", async () => {
  const client = createAuthenticatedClient();
  const token = await client.login();

  const created = await request(client.app)
    .post("/api/users")
    .set("Authorization", "Bearer " + token)
    .send({
      name: "مستخدم تجريبي",
      email: "demo@example.com",
      role: "viewer",
      planId: "plan-lite",
      subscriptionStart: "2026-06-28",
      subscriptionEnd: "2026-07-28",
    });

  assert.equal(created.status, 201);

  const updated = await request(client.app)
    .put(`/api/users/${created.body.id}`)
    .set("Authorization", "Bearer " + token)
    .send({ status: "disabled", subscriptionStatus: "disabled" });

  assert.equal(updated.status, 200);
  assert.equal(updated.body.status, "disabled");

  const removed = await request(client.app)
    .delete(`/api/users/${created.body.id}`)
    .set("Authorization", "Bearer " + token);

  assert.equal(removed.status, 204);
});

test("filters users and renews subscriptions", async () => {
  const client = createAuthenticatedClient();
  const token = await client.login();

  const filtered = await request(client.app)
    .get("/api/users?status=active&search=سارة")
    .set("Authorization", "Bearer " + token);

  assert.equal(filtered.status, 200);
  assert.equal(filtered.body.items.length, 1);

  const renewed = await request(client.app)
    .post("/api/subscriptions/renew")
    .set("Authorization", "Bearer " + token)
    .send({
      userId: "user-004",
      planId: "plan-pro",
      startDate: "2026-06-28",
      endDate: "2027-06-28",
      status: "active",
      amount: 199,
    });

  assert.equal(renewed.status, 200);
  assert.equal(renewed.body.status, "active");
});

test("manages certificates and activation codes", async () => {
  const client = createAuthenticatedClient();
  const token = await client.login();

  const certificate = await request(client.app)
    .post("/api/certificates")
    .set("Authorization", "Bearer " + token)
    .send({
      name: "New Enterprise Cert",
      type: "distribution",
      expiresAt: "2027-01-01",
    });

  assert.equal(certificate.status, 201);

  const code = await request(client.app)
    .post("/api/codes")
    .set("Authorization", "Bearer " + token)
    .send({
      planId: "plan-business",
      expiresAt: "2026-12-31",
      usesLeft: 2,
    });

  assert.equal(code.status, 201);
  assert.match(code.body.code, /^AHMAD-/);
});
