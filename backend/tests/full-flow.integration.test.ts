import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const runDbTests = Boolean(process.env.RUN_DB_TESTS);
const maybeDescribe = runDbTests ? describe : describe.skip;

maybeDescribe("Full E2E Ecommerce & Payment Flow", () => {
  const app = createApp();

  const userEmail = "full-flow-user@noirsane.com";
  const deliveryEmail = "full-flow-delivery@noirsane.com";
  const adminEmail = "full-flow-admin@noirsane.com";
  const testPassword = "Password123";

  let userToken = "";
  let deliveryToken = "";
  let adminToken = "";

  let userId = "";
  let deliveryPartnerId = "";
  let productId = "";
  let addressId = "";
  let orderId = "";
  let upiSessionId = "";
  let proofImageUrl = "";

  beforeAll(async () => {
    // Clean up test data
    await prisma.upiPaymentSession.deleteMany({
      where: {
        order: {
          user: {
            email: { in: [userEmail, deliveryEmail, adminEmail] },
          },
        },
      },
    });

    await prisma.payment.deleteMany({
      where: {
        order: {
          user: {
            email: { in: [userEmail, deliveryEmail, adminEmail] },
          },
        },
      },
    });

    await prisma.deliveryTracking.deleteMany({
      where: {
        order: {
          user: {
            email: { in: [userEmail, deliveryEmail, adminEmail] },
          },
        },
      },
    });

    await prisma.orderItem.deleteMany({
      where: {
        order: {
          user: {
            email: { in: [userEmail, deliveryEmail, adminEmail] },
          },
        },
      },
    });

    await prisma.order.deleteMany({
      where: {
        user: {
          email: { in: [userEmail, deliveryEmail, adminEmail] },
        },
      },
    });

    await prisma.address.deleteMany({
      where: {
        user: {
          email: { in: [userEmail, deliveryEmail, adminEmail] },
        },
      },
    });

    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          user: {
            email: { in: [userEmail, deliveryEmail, adminEmail] },
          },
        },
      },
    });

    await prisma.cart.deleteMany({
      where: {
        user: {
          email: { in: [userEmail, deliveryEmail, adminEmail] },
        },
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: { in: [userEmail, deliveryEmail, adminEmail] },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: [userEmail, deliveryEmail, adminEmail] },
      },
    });

    // Seed test admin user dynamically
    const adminPasswordHash = await bcrypt.hash(testPassword, 12);
    await prisma.user.create({
      data: {
        name: "Full Flow Admin",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
        cart: { create: {} },
      },
    });

    // Make sure we have a product seeded
    const products = await prisma.product.findMany({ where: { isActive: true } });
    if (products.length === 0) {
      throw new Error("No seeded products found. Run prisma:seed first.");
    }
    productId = products[0].id;

    // Ensure the expected active UPI setting is in the database for the test
    await prisma.upiPaymentSetting.upsert({
      where: { upiId: "9319758795@omni" },
      update: { isActive: true },
      create: {
        upiId: "9319758795@omni",
        displayName: "Noir Sane",
        isActive: true,
      },
    });

    // Deactivate any other UPI settings to ensure deterministic test results
    await prisma.upiPaymentSetting.updateMany({
      where: { NOT: { upiId: "9319758795@omni" } },
      data: { isActive: false },
    });
  });

  it("1. Registers and logs in the customer", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Full Flow Customer", email: userEmail, password: testPassword })
      .expect(201);
    
    expect(registerRes.body.data.user.email).toBe(userEmail);
    userId = registerRes.body.data.user.id;

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: userEmail, password: testPassword })
      .expect(200);

    userToken = loginRes.body.data.accessToken;
    expect(userToken).toBeTruthy();
  });

  it("2. Registers and configures a delivery partner", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Full Flow Delivery", email: deliveryEmail, password: testPassword })
      .expect(201);

    deliveryPartnerId = registerRes.body.data.user.id;

    // Elevate role to DELIVERY_PARTNER
    await prisma.user.update({
      where: { id: deliveryPartnerId },
      data: { role: Role.DELIVERY_PARTNER },
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: deliveryEmail, password: testPassword })
      .expect(200);

    deliveryToken = loginRes.body.data.accessToken;
    expect(deliveryToken).toBeTruthy();
  });

  it("3. Logs in as Admin", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: testPassword })
      .expect(200);

    adminToken = loginRes.body.data.accessToken;
    expect(adminToken).toBeTruthy();
  });

  it("4. Operates the shopping cart (add, list, update items)", async () => {
    // Add item to cart
    const addRes = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    expect(addRes.body.data.productId).toBe(productId);
    expect(addRes.body.data.quantity).toBe(2);

    const cartItemId = addRes.body.data.id;

    // View cart
    const cartRes = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(cartRes.body.data.items.length).toBe(1);

    // Update cart item quantity
    const updateRes = await request(app)
      .patch(`/api/cart/items/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 1 })
      .expect(200);

    expect(updateRes.body.data.quantity).toBe(1);
  });

  it("5. Creates a shipping address", async () => {
    const addressRes = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        fullName: "Full Flow Customer Address",
        phone: "+919876543210",
        addressLine1: "123 Cocoa Blvd",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        isDefault: true,
      })
      .expect(201);

    addressId = addressRes.body.data.id;
    expect(addressId).toBeTruthy();
  });

  it("6. Places order via UPI payment method", async () => {
    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        addressId,
        paymentMethod: "UPI",
      })
      .expect(201);

    orderId = orderRes.body.data.id;
    expect(orderId).toBeTruthy();
    expect(orderRes.body.data.status).toBe(OrderStatus.PAYMENT_PENDING);
    expect(orderRes.body.data.paymentStatus).toBe(PaymentStatus.PENDING);
  });

  it("7. Initiates a UPI payment session & generates QR Code", async () => {
    const sessionRes = await request(app)
      .post(`/api/orders/${orderId}/upi-session`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    upiSessionId = sessionRes.body.data.id;
    expect(upiSessionId).toBeTruthy();
    expect(sessionRes.body.data.upiIdSnapshot).toBe("9319758795@omni");
    expect(sessionRes.body.data.qrDataUrl).toContain("data:image/png;base64");
  });

  it("8. Uploads payment proof screenshot", async () => {
    // Generate dummy buffer representing an image file
    const fileBuffer = Buffer.from("fake-png-screenshot-contents");

    const uploadRes = await request(app)
      .post("/api/uploads/payment-proof")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("file", fileBuffer, "screenshot.png")
      .expect(200);

    proofImageUrl = uploadRes.body.data.url;
    expect(proofImageUrl).toContain("/uploads/payment-proofs/");
  });

  it("9. Submits UTR & proof for manual payment verification", async () => {
    const submitRes = await request(app)
      .post(`/api/upi-sessions/${upiSessionId}/submit`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        utr: "123456789012",
        proofImageUrl,
      })
      .expect(200);

    expect(submitRes.body.data.status).toBe(PaymentStatus.SUBMITTED);

    // Verify order updated to submitted
    const orderRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(orderRes.body.data.status).toBe(OrderStatus.PAYMENT_SUBMITTED);
    expect(orderRes.body.data.paymentStatus).toBe(PaymentStatus.SUBMITTED);
    expect(orderRes.body.data.paymentReferenceNumber).toBe("123456789012");
  });

  it("10. Admin views dashboard analytics", async () => {
    const dashboardRes = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(dashboardRes.body.data.totalOrders).toBeGreaterThanOrEqual(1);
    expect(dashboardRes.body.data.recentOrders.length).toBeGreaterThanOrEqual(1);
  });

  it("11. Admin verifies the UPI payment session", async () => {
    const verifyRes = await request(app)
      .patch(`/api/admin/upi-sessions/${upiSessionId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "VERIFIED" })
      .expect(200);

    expect(verifyRes.body.data.status).toBe(PaymentStatus.VERIFIED);

    // Verify order is now CONFIRMED
    const orderRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(orderRes.body.data.status).toBe(OrderStatus.CONFIRMED);
    expect(orderRes.body.data.paymentStatus).toBe(PaymentStatus.VERIFIED);
  });

  it("12. Admin assigns order to the delivery partner & sets ETA", async () => {
    // Assign delivery partner
    const assignRes = await request(app)
      .patch(`/api/admin/orders/${orderId}/assign-delivery-partner`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ deliveryPartnerId })
      .expect(200);

    expect(assignRes.body.data.deliveryPartnerId).toBe(deliveryPartnerId);

    // Set ETA
    const etaRes = await request(app)
      .patch(`/api/admin/orders/${orderId}/estimated-delivery-time`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        adminEstimatedDeliveryTime: new Date(Date.now() + 86400000).toISOString(),
        estimatedDeliveryMessage: "Arriving by tomorrow evening.",
      })
      .expect(200);

    expect(etaRes.body.data.estimatedDeliveryMessage).toBe("Arriving by tomorrow evening.");
  });

  it("13. Delivery partner views assigned orders & updates delivery tracking", async () => {
    // List assigned orders
    const listRes = await request(app)
      .get("/api/delivery/orders")
      .set("Authorization", `Bearer ${deliveryToken}`)
      .expect(200);

    const hasOrder = listRes.body.data.some((o: { id: string }) => o.id === orderId);
    expect(hasOrder).toBe(true);

    // Update status to OUT_FOR_DELIVERY
    const statusRes = await request(app)
      .patch(`/api/delivery/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${deliveryToken}`)
      .send({
        status: OrderStatus.OUT_FOR_DELIVERY,
        title: "Out for delivery",
        message: "Delivery partner is on their way with your chocolate box.",
        locationText: "Bandra West, Mumbai",
      })
      .expect(200);

    expect(statusRes.body.data.status).toBe(OrderStatus.OUT_FOR_DELIVERY);

    // Log current location updates
    const locationRes = await request(app)
      .post(`/api/delivery/orders/${orderId}/location`)
      .set("Authorization", `Bearer ${deliveryToken}`)
      .send({
        status: OrderStatus.OUT_FOR_DELIVERY,
        title: "Transit Update",
        message: "Partner crossed Link Road.",
        locationText: "Linking Road, Mumbai",
      })
      .expect(201);

    expect(locationRes.body.data.id).toBeTruthy();
  });

  it("14. Delivery partner marks the order as DELIVERED", async () => {
    const deliverRes = await request(app)
      .patch(`/api/delivery/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${deliveryToken}`)
      .send({
        status: OrderStatus.DELIVERED,
        title: "Delivered",
        message: "Package handed over to the customer.",
        locationText: "Customer doorstep",
      })
      .expect(200);

    expect(deliverRes.body.data.status).toBe(OrderStatus.DELIVERED);
  });

  it("15. Customer retrieves tracking timeline showing full history", async () => {
    const trackingRes = await request(app)
      .get(`/api/orders/${orderId}/tracking`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(trackingRes.body.data.currentStatus).toBe(OrderStatus.DELIVERED);
    expect(trackingRes.body.data.currentLocationText).toBe("Customer doorstep");
    expect(trackingRes.body.data.trackingTimeline.length).toBeGreaterThanOrEqual(5);

    // Order tracking lifecycle checkpoints
    const statuses = trackingRes.body.data.trackingTimeline.map((t: { status: string }) => t.status);
    expect(statuses).toContain(OrderStatus.PLACED);
    expect(statuses).toContain(OrderStatus.PAYMENT_SUBMITTED);
    expect(statuses).toContain(OrderStatus.CONFIRMED);
    expect(statuses).toContain(OrderStatus.OUT_FOR_DELIVERY);
    expect(statuses).toContain(OrderStatus.DELIVERED);
  });
});
