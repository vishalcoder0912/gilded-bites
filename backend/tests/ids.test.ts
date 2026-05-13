import { describe, expect, it } from "vitest";
import { createOrderNumber, createTransactionId } from "../src/utils/ids";

describe("unique public ids", () => {
  it("generates order numbers with the required prefix and date", () => {
    expect(createOrderNumber()).toMatch(/^ORD-\d{8}-[A-F0-9]{8}$/);
  });

  it("generates transaction ids with the required prefix and date", () => {
    expect(createTransactionId()).toMatch(/^TXN-\d{8}-[A-F0-9]{8}$/);
  });

  it("generates unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, createTransactionId));
    expect(ids.size).toBe(100);
  });
});
