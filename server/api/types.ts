import type { Express, RequestHandler } from "express";

export type ApiContext = {
  limiter: RequestHandler;
  dataAuthSecret: string;
  dataTokenTtlSeconds: number;
  allowedSourceTokens: string[];
};

export type RegisterRoutes = (app: Express, context: ApiContext) => void;
