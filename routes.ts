import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBidSchema, insertBidItemSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all bids for authenticated user
  app.get("/api/bids", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bids = await storage.getAllBids(userId);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Get a specific bid
  app.get("/api/bids/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const bid = await storage.getBid(id);
      
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      res.json(bid);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bid" });
    }
  });

  // Get bid items for a specific bid
  app.get("/api/bid-items/:bidId", isAuthenticated, async (req: any, res) => {
    try {
      const bidId = parseInt(req.params.bidId);
      const items = await storage.getBidItems(bidId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bid items" });
    }
  });

  // Create a new bid
  app.post("/api/bids", isAuthenticated, async (req: any, res) => {
    try {
      const { bid: bidData, items } = req.body;
      const userId = req.user.claims.sub;
      
      // Validate bid data and add userId
      const validatedBid = insertBidSchema.parse({
        ...bidData,
        userId,
      });
      
      // Create the bid
      const savedBid = await storage.createBid(validatedBid);
      
      // Create bid items if provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertBidItemSchema.parse({
            ...item,
            bidId: savedBid.id,
          });
          await storage.createBidItem(validatedItem);
        }
      }
      
      res.status(201).json(savedBid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bid" });
      }
    }
  });

  // Update a bid
  app.patch("/api/bids/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const updated = await storage.updateBid(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bid" });
    }
  });

  // Delete a bid
  app.delete("/api/bids/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBid(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      res.json({ message: "Bid deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bid" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
