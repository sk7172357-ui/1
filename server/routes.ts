import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startUserBot } from "./userbot";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  startUserBot();

  app.get(api.status.get.path, (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.post("/api/config/session", async (req, res) => {
    const { session } = req.body;
    await storage.setConfig("userbot_session", session);
    res.json({ status: "saved" });
  });

  app.post("/api/auth/code", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });
    await storage.setConfig("temp_auth_code", code);
    res.json({ status: "code_received" });
  });

  app.get("/api/auth/status", async (req, res) => {
    const status = await storage.getConfig("auth_status");
    res.json({ status: status?.value || "IDLE" });
  });

  app.post("/api/config/channel", async (req, res) => {
    const { channelId } = req.body;
    await storage.setConfig("config_channel_id", channelId);
    res.json({ status: "saved" });
  });

  app.get("/api/users", async (req, res) => {
    res.json(await storage.getAllUsers());
  });

  app.get("/api/users/:id/messages", async (req, res) => {
    res.json(await storage.getMessages(parseInt(req.params.id)));
  });

  return httpServer;
}
