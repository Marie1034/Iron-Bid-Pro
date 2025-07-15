import {
  users,
  bids,
  bidItems,
  type User,
  type UpsertUser,
  type Bid,
  type BidItem,
  type InsertBid,
  type InsertBidItem,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Bid operations
  createBid(bid: InsertBid): Promise<Bid>;
  getBid(id: number): Promise<Bid | undefined>;
  getAllBids(userId: string): Promise<Bid[]>;
  updateBid(id: number, updateData: Partial<Bid>): Promise<Bid | undefined>;
  deleteBid(id: number): Promise<boolean>;
  
  // Bid item operations
  createBidItem(bidItem: InsertBidItem): Promise<BidItem>;
  getBidItems(bidId: number): Promise<BidItem[]>;
  deleteBidItems(bidId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Bid operations
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db.insert(bids).values(insertBid).returning();
    return bid;
  }

  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }

  async getAllBids(userId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.userId, userId)).orderBy(bids.createdAt);
  }

  async updateBid(id: number, updateData: Partial<Bid>): Promise<Bid | undefined> {
    const [updatedBid] = await db
      .update(bids)
      .set(updateData)
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }

  async deleteBid(id: number): Promise<boolean> {
    // Delete associated bid items first
    await this.deleteBidItems(id);
    
    const result = await db.delete(bids).where(eq(bids.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Bid item operations
  async createBidItem(insertBidItem: InsertBidItem): Promise<BidItem> {
    const [bidItem] = await db.insert(bidItems).values(insertBidItem).returning();
    return bidItem;
  }

  async getBidItems(bidId: number): Promise<BidItem[]> {
    return await db.select().from(bidItems).where(eq(bidItems.bidId, bidId));
  }

  async deleteBidItems(bidId: number): Promise<boolean> {
    const result = await db.delete(bidItems).where(eq(bidItems.bidId, bidId));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
