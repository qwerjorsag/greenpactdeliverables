import type { RegisterRoutes } from "../types";

export const registerHealthRoutes: RegisterRoutes = (app) => {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: true, dbType: "sqlite" });
  });
};
