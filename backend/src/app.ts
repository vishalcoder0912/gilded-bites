import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { corsOrigins } from "./config/env";
import { logger } from "./lib/logger";
import { authRouter } from "./routes/auth.routes";
import { adminCatalogRouter, catalogRouter } from "./routes/catalog.routes";
import { adminCommerceRouter, commerceRouter, deliveryRouter } from "./routes/commerce.routes";
import { adminUsersRouter } from "./routes/users.routes";
import { swaggerDocument } from "./docs/swagger";
import { errorHandler, notFound } from "./utils/errors";

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed =
      corsOrigins.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => res.json({ success: true, message: "Backend is healthy" }));
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Noir Sane backend is running",
      health: "/health",
      docs: "/docs",
      api: "/api",
    });
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use("/api/auth", authRouter);
  app.use("/api", catalogRouter);
  app.use("/api", commerceRouter);
  app.use("/api/admin", adminCatalogRouter);
  app.use("/api/admin", adminCommerceRouter);
  app.use("/api/admin", adminUsersRouter);
  app.use("/api/delivery", deliveryRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
