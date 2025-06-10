import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Requests table
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  serviceType: varchar("service_type", { length: 100 }),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemName: varchar("item_name", { length: 100 }),
  quantity: integer("quantity"),
  notes: text("notes"),
  lastUsed: timestamp("last_used"),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("unpaid"),
  invoiceDate: date("invoice_date"),
  pdfUrl: text("pdf_url"),
});

// Web Leads table
export const webLeads = pgTable("web_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 100 }),
  message: text("message"),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
});

export const insertWebLeadSchema = createInsertSchema(webLeads).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type WebLead = typeof webLeads.$inferSelect;
export type InsertWebLead = z.infer<typeof insertWebLeadSchema>;
