import { pgTable, text, serial, integer, decimal, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bidItems = pgTable("bid_items", {
  id: serial("id").primaryKey(),
  bidId: integer("bid_id").notNull(),
  name: text("name").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  clientName: text("client_name").notNull(),
  projectLocation: text("project_location").notNull(),
  date: text("date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  materials: decimal("materials", { precision: 10, scale: 2 }).notNull(),
  labor: decimal("labor", { precision: 10, scale: 2 }).notNull(),
  overhead: decimal("overhead", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export const insertBidItemSchema = createInsertSchema(bidItems).omit({
  id: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBidItem = z.infer<typeof insertBidItemSchema>;
export type BidItem = typeof bidItems.$inferSelect;

// Predefined iron work items with their default prices
export const predefinedItems = [
  {
    name: "Flights of Stairs",
    description: "Standard flight with handrails",
    unitPrice: 450,
    icon: "fas fa-stairs",
    unit: "each"
  },
  {
    name: "Handrails",
    description: "Per linear foot",
    unitPrice: 25,
    icon: "fas fa-minus",
    unit: "ft"
  },
  {
    name: "Structural Beams",
    description: "Per linear foot",
    unitPrice: 85,
    icon: "fas fa-grip-lines",
    unit: "ft"
  },
  {
    name: "Balcony Railings",
    description: "Per linear foot",
    unitPrice: 35,
    icon: "fas fa-home",
    unit: "ft"
  },
  {
    name: "Fire Escapes",
    description: "Standard platform with ladder",
    unitPrice: 750,
    icon: "fas fa-fire-extinguisher",
    unit: "each"
  },
  {
    name: "Security Gates",
    description: "Standard size with hardware",
    unitPrice: 320,
    icon: "fas fa-door-open",
    unit: "each"
  }
];
