import {
  users,
  clients,
  serviceRequests,
  inventory,
  invoices,
  webLeads,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type ServiceRequest,
  type InsertServiceRequest,
  type InventoryItem,
  type InsertInventoryItem,
  type Invoice,
  type InsertInvoice,
  type WebLead,
  type InsertWebLead,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Client operations
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  
  // Service Request operations
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: number, request: Partial<InsertServiceRequest>): Promise<ServiceRequest>;
  deleteServiceRequest(id: number): Promise<void>;
  
  // Inventory operations
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;
  
  // Invoice operations
  getAllInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;
  
  // Web Lead operations
  getAllWebLeads(): Promise<WebLead[]>;
  createWebLead(lead: InsertWebLead): Promise<WebLead>;
  deleteWebLead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
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

  // Client operations
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(clientData).returning();
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Service Request operations
  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> {
    const [request] = await db.insert(serviceRequests).values(requestData).returning();
    return request;
  }

  async updateServiceRequest(id: number, requestData: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const [request] = await db
      .update(serviceRequests)
      .set(requestData)
      .where(eq(serviceRequests.id, id))
      .returning();
    return request;
  }

  async deleteServiceRequest(id: number): Promise<void> {
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
  }

  // Inventory operations
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventory);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventory).values(itemData).returning();
    return item;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [item] = await db
      .update(inventory)
      .set(itemData)
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  // Invoice operations
  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.invoiceDate));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // Web Lead operations
  async getAllWebLeads(): Promise<WebLead[]> {
    return await db.select().from(webLeads).orderBy(desc(webLeads.createdAt));
  }

  async createWebLead(leadData: InsertWebLead): Promise<WebLead> {
    const [lead] = await db.insert(webLeads).values(leadData).returning();
    return lead;
  }

  async deleteWebLead(id: number): Promise<void> {
    await db.delete(webLeads).where(eq(webLeads.id, id));
  }
}

export const storage = new DatabaseStorage();
