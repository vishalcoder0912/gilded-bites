import "dotenv/config";

type ApiResponse = {
  data?: {
    accessToken?: string;
    [key: string]: unknown;
  };
  accessToken?: string;
  success?: boolean;
  [key: string]: unknown;
};

async function main() {
  const loginRes = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || "admin@noirsane.com",
      password: process.env.ADMIN_PASSWORD || "Admin@12345"
    })
  });

  const loginData = await loginRes.json() as ApiResponse;
  const token = loginData.data?.accessToken || loginData.accessToken;
  console.log("Logged in, token present:", !!token);

  const stockRes = await fetch("http://localhost:4000/api/admin/stock", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const stockData = await stockRes.json() as ApiResponse;
  console.log("Stock response status:", stockRes.status);
  console.log("Stock response keys:", Object.keys(stockData));
  console.log("Stock response success:", stockData.success);
  console.log("Stock response data length:", Array.isArray(stockData.data) ? stockData.data.length : undefined);
  console.log("Sample stock item:", JSON.stringify(Array.isArray(stockData.data) ? stockData.data[0] : undefined, null, 2));
}

main().catch(console.error);
