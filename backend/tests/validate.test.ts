import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validate } from "../src/middleware/validate";

describe("validate middleware", () => {
  it("validates route params and keeps parsed body fields for CRUD routes", async () => {
    const app = express();
    const schema = z.object({
      params: z.object({ id: z.string().uuid() }),
      name: z.string().min(2),
      isActive: z.boolean(),
    });

    app.use(express.json());
    app.patch("/items/:id", validate(schema), (req, res) => {
      res.json({ body: req.body, id: req.params.id });
    });

    const id = "11111111-1111-4111-8111-111111111111";
    const res = await request(app)
      .patch(`/items/${id}`)
      .send({ name: "Truffles", isActive: true })
      .expect(200);

    expect(res.body).toEqual({
      id,
      body: { name: "Truffles", isActive: true },
    });
  });
});
