import type { RegisterRoutes } from "../types";
import { authenticateDataRequest, loginDataAdmin } from "./auth";
import { createExcelExportBuffer } from "./export";
import { getLocalDataOverview } from "./overview";

export const registerDataRoutes: RegisterRoutes = (app, context) => {
  app.post("/api/data/login", context.limiter, async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Missing credentials" });
      }

      const login = await loginDataAdmin(
        username,
        password,
        context.dataAuthSecret,
        context.dataTokenTtlSeconds
      );
      if (!login) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json(login);
    } catch (err) {
      console.error("Data login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/data/overview", async (req, res) => {
    try {
      const payload = authenticateDataRequest(req, res, context.dataAuthSecret);
      if (!payload) return;

      res.json(getLocalDataOverview(payload.username));
    } catch (err) {
      console.error("Data overview error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/data/export", async (req, res) => {
    try {
      const payload = authenticateDataRequest(req, res, context.dataAuthSecret);
      if (!payload) return;

      const filenameDate = new Date().toISOString().replace(/[:.]/g, "-");
      const workbook = createExcelExportBuffer();

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="greenpact-database-export-${filenameDate}.xlsx"`
      );
      res.send(workbook);
    } catch (err) {
      console.error("Data export error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};
