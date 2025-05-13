import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Server schema
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  map: text("map").notNull(),
  maxPlayers: integer("max_players").notNull(),
  currentPlayers: integer("current_players").notNull().default(0),
  isOnline: boolean("is_online").notNull().default(true),
  imageUrl: text("image_url"),
  connectionLink: text("connection_link").notNull(),
  trackCount: integer("track_count").notNull().default(1),
  // Additional server info
  serverIP: text("server_ip"),
  httpPort: text("http_port"),
  serverPort: text("server_port"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  serverDetails: jsonb("server_details"),  // Store additional parsed server details
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
});

// Car schema
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  downloadUrl: text("download_url").notNull(),
  rating: integer("rating").notNull().default(0),
  specs: jsonb("specs"),
  serverId: integer("server_id").references(() => servers.id, { onDelete: "set null" }),
  filePath: text("file_path"),              // Path to the uploaded zip file
  extractedPath: text("extracted_path"),    // Path to the extracted content
  model3dPath: text("model3d_path"),        // Path to the 3D model file (.kn5)
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;

export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

// Car Categories
export const CAR_CATEGORIES = [
  "GT",
  "Sport",
  "JDM",
  "F1",
  "Drift",
  "Rally",
] as const;

// Server Categories
export const SERVER_CATEGORIES = [
  "Drift",
  "GT3",
  "Touge",
  "Street",
  "Freestyle",
] as const;
