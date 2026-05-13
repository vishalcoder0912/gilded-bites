import { env } from "./config/env";
import { createApp } from "./app";
import { logger } from "./lib/logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Noir Sane backend running on http://localhost:${env.PORT}`);
  logger.info(`Swagger docs available on http://localhost:${env.PORT}/docs`);
});

server.on("error", (error) => {
  logger.error(error, "Backend server failed");
  process.exit(1);
});

const shutdown = () => {
  server.close(() => {
    logger.info("Noir Sane backend stopped");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
