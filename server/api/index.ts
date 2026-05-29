import type { Express } from "express";
import type { ApiContext, RegisterRoutes } from "./types";
import { registerDataRoutes } from "./data/routes";
import { registerElectricityRoutes } from "./electricity/routes";
import { registerHealthRoutes } from "./health/routes";
import { registerReportRoutes } from "./reports/routes";
import { registerSelfAuditRoutes } from "./self-audits/routes";
import { registerSubmitRoutes } from "./submit/routes";
import { registerWasteRoutes } from "./waste/routes";
import { registerWaterRoutes } from "./water/routes";

const routeRegistrars: RegisterRoutes[] = [
  registerHealthRoutes,
  registerDataRoutes,
  registerSubmitRoutes,
  registerElectricityRoutes,
  registerWaterRoutes,
  registerWasteRoutes,
  registerSelfAuditRoutes,
  registerReportRoutes,
];

export function registerApiRoutes(app: Express, context: ApiContext) {
  for (const registerRoutes of routeRegistrars) {
    registerRoutes(app, context);
  }
}
