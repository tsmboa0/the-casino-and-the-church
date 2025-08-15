import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { HoneycombService } from "./modules/honeycomb/honeycomb.service";

export async function registerRoutes(app: Express): Promise<Server> {

  app.get("/api/initialize", async (req, res) => {
    try {
      const honeycombService = new HoneycombService();
      console.log("Creating profile tree");
      await honeycombService.createProfileTree();
      console.log("Profile tree created");
      res.json({ message: "Project created" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User Management Routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedUser.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      
      const newUser = await storage.createUser(validatedUser);
      res.status(201).json({ 
        message: "User created successfully",
        user: { id: newUser.id, username: newUser.username }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health Check Route
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // 404 handler for undefined routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
