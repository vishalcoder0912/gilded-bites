import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("backend app", () => {
  const app = createApp();

  it("exposes health check", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.success).toBe(true);
  });

  it("protects admin APIs", async () => {
    const res = await request(app).get("/api/admin/orders").expect(401);
    expect(res.body.success).toBe(false);
  });

  it("returns consistent 404 response", async () => {
    const res = await request(app).get("/api/missing").expect(404);
    expect(res.body).toMatchObject({ success: false, message: "Route not found" });
  });
});
