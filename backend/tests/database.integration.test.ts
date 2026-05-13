import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const runDbTests = Boolean(process.env.RUN_DB_TESTS);
const maybeDescribe = runDbTests ? describe : describe.skip;

maybeDescribe("database-backed ecommerce flow", () => {
  const app = createApp();
  let token = "";

  beforeAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany({ where: { email: "test-user@noirsane.com" } });
  });

  it("registers and logs in a user", async () => {
    const registered = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test-user@noirsane.com", password: "Password123" })
      .expect(201);
    expect(registered.body.data.user.passwordHash).toBeUndefined();

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "test-user@noirsane.com", password: "Password123" })
      .expect(200);
    token = login.body.data.accessToken;
    expect(token).toBeTruthy();
  });

  it("allows current user lookup", async () => {
    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
    expect(me.body.data.email).toBe("test-user@noirsane.com");
  });
});
