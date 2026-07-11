import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env.PORT || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully.");

  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully.");

  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});
