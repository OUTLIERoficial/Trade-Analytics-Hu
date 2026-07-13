import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// Healthcheck do Railway
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API Server is running",
  });
});

const allowedOrigins = [
  process.env.APP_URL,
  "https://trade-analytics-hu-gtrader-git-main-outlier06.vercel.app",
  /\.vercel\.app$/,
  /\.up\.railway\.app$/,
  // desenvolvimento local
  /^http:\/\/localhost(:\d+)?$/,
  /^https?:\/\/.*\.replit\.dev$/,
].filter(Boolean) as (string | RegExp)[];

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin,
      );
      cb(allowed ? null : new Error("CORS not allowed"), allowed);
    },
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
