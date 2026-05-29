import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import { registerApiRoutes } from "./server/api";
import { ensureDataAdminUser } from "./server/api/data/auth";
import type { ApiContext } from "./server/api/types";

async function attachFrontend(app: express.Express) {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    return;
  }

  app.use(express.static(path.join(process.cwd(), "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  });
}

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || "3000", 10);
  const runtimeApiBaseUrl = process.env.VITE_API_BASE_URL || "";

  await ensureDataAdminUser();
  console.log("Using local SQLite database");

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get("/config.js", (_req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(
      `window.__GREENPACT_CONFIG__ = ${JSON.stringify({
        apiBaseUrl: runtimeApiBaseUrl,
      })};`
    );
  });

  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });

  const apiContext: ApiContext = {
    limiter,
    dataAuthSecret:
      process.env.DATA_AUTH_SECRET || "change-this-secret-before-production",
    dataTokenTtlSeconds: parseInt(
      process.env.DATA_TOKEN_TTL_SECONDS || String(60 * 60 * 8),
      10
    ),
    allowedSourceTokens: (
      process.env.ALLOWED_SOURCE_TOKENS || "H7K2-ABC,TEST-TOKEN"
    ).split(","),
  };

  registerApiRoutes(app, apiContext);
  await attachFrontend(app);

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
