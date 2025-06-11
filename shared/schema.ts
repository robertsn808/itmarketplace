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
  boolean,
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
  email: varchar("email", { length: 100 }).unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  password: varchar("password", { length: 255 }), // For client authentication
  isActive: boolean("is_active").default(true),
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

// Incidents table for tracking repair progress
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  callStage: boolean("call_stage").default(false),
  receiveStage: boolean("receive_stage").default(false),
  repairStage: boolean("repair_stage").default(false),
  pickupStage: boolean("pickup_stage").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tickets table for detailed service tracking
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id),
  clientId: integer("client_id").references(() => clients.id),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  status: varchar("status", { length: 20 }).default("open"), // open, in-progress, resolved, closed
  assignedTo: varchar("assigned_to", { length: 100 }),
  techEmail: varchar("tech_email", { length: 100 }),
  clientNotifications: boolean("client_notifications").default(true),
  emailNotifications: boolean("email_notifications").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket messages for communication
export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id),
  senderType: varchar("sender_type", { length: 20 }), // "tech", "client", "system"
  senderName: varchar("sender_name", { length: 100 }),
  senderEmail: varchar("sender_email", { length: 100 }),
  message: text("message"),
  messageType: varchar("message_type", { length: 20 }).default("chat"), // chat, email, update, system
  isInternal: boolean("is_internal").default(false), // internal tech notes
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tech profiles for personal email integration
export const techProfiles = pgTable("tech_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).unique(),
  name: varchar("name", { length: 100 }),
  personalEmail: varchar("personal_email", { length: 100 }),
  emailSignature: text("email_signature"),
  notificationPreferences: jsonb("notification_preferences"),
  // Availability and location settings
  isAvailable: boolean("is_available").default(false),
  availabilityMode: varchar("availability_mode", { length: 20 }).default("none"), // "all", "specific", "none"
  allowedClientIds: jsonb("allowed_client_ids"), // Array of client IDs for "specific" mode
  specialties: text("specialties"), // Types of tech work they do
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  bio: text("bio"),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  yearsExperience: integer("years_experience"),
  education: text("education"),
  resumeUrl: varchar("resume_url", { length: 255 }),
  portfolioUrl: varchar("portfolio_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tech Certifications
export const techCertifications = pgTable("tech_certifications", {
  id: serial("id").primaryKey(),
  techProfileId: integer("tech_profile_id").notNull().references(() => techProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  issuingOrganization: varchar("issuing_organization", { length: 255 }).notNull(),
  credentialId: varchar("credential_id", { length: 255 }),
  credentialUrl: varchar("credential_url", { length: 255 }),
  issueDate: timestamp("issue_date"),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tech Skills/Badges
export const techSkills = pgTable("tech_skills", {
  id: serial("id").primaryKey(),
  techProfileId: integer("tech_profile_id").notNull().references(() => techProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // hardware, software, networking, security, etc
  proficiencyLevel: varchar("proficiency_level", { length: 50 }), // beginner, intermediate, advanced, expert
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Completion Records
export const serviceCompletions = pgTable("service_completions", {
  id: serial("id").primaryKey(),
  techProfileId: integer("tech_profile_id").notNull().references(() => techProfiles.id),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id),
  clientId: integer("client_id").references(() => clients.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // repair, maintenance, installation, consultation
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }),
  clientSatisfactionRating: integer("client_satisfaction_rating"), // 1-5 stars
  clientTestimonial: text("client_testimonial"),
  completedAt: timestamp("completed_at").defaultNow(),
  skillsUsed: text("skills_used").array(), // Array of skills demonstrated
  challengesSolved: text("challenges_solved"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const clientLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const clientSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
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

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({
  id: true,
  createdAt: true,
});

export const insertTechProfileSchema = createInsertSchema(techProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechCertificationSchema = createInsertSchema(techCertifications).omit({
  id: true,
  createdAt: true,
});

export const insertTechSkillSchema = createInsertSchema(techSkills).omit({
  id: true,
  createdAt: true,
});

export const insertServiceCompletionSchema = createInsertSchema(serviceCompletions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
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
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type TechProfile = typeof techProfiles.$inferSelect;
export type InsertTechProfile = z.infer<typeof insertTechProfileSchema>;
export type TechCertification = typeof techCertifications.$inferSelect;
export type InsertTechCertification = z.infer<typeof insertTechCertificationSchema>;
export type TechSkill = typeof techSkills.$inferSelect;
export type InsertTechSkill = z.infer<typeof insertTechSkillSchema>;
export type ServiceCompletion = typeof serviceCompletions.$inferSelect;
export type InsertServiceCompletion = z.infer<typeof insertServiceCompletionSchema>;
