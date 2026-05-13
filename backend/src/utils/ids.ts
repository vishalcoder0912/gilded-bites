import { randomBytes } from "crypto";

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

const random = () => randomBytes(4).toString("hex").toUpperCase();

export const createOrderNumber = () => `ORD-${today()}-${random()}`;
export const createTransactionId = () => `TXN-${today()}-${random()}`;
