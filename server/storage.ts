import {
  users,
  clients,
  serviceRequests,
  inventory,
  invoices,
  webLeads,
  incidents,
  tickets,
  ticketMessages,
  techProfiles,
  techCertifications,
  techSkills,
  serviceCompletions,
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
  type Incident,
  type InsertIncident,
  type Ticket,
  type InsertTicket,
  type TicketMessage,
  type InsertTicketMessage,
  type TechProfile,
  type InsertTechProfile,
  type TechCertification,
  type InsertTechCertification,
  type TechSkill,
  type InsertTechSkill,
  type ServiceCompletion,
  type InsertServiceCompletion,
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
  
  // Incident operations
  getAllIncidents(): Promise<Incident[]>;
  getIncidentsByClient(clientId: number): Promise<Incident[]>;
  getIncident(id: number): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident>;
  deleteIncident(id: number): Promise<void>;
  
  // Ticket operations
  getAllTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketsByServiceRequest(serviceRequestId: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket>;
  deleteTicket(id: number): Promise<void>;
  
  // Ticket message operations
  getTicketMessages(ticketId: number): Promise<TicketMessage[]>;
  createTicketMessage(message: InsertTicketMessage): Promise<TicketMessage>;
  
  // Tech profile operations
  getTechProfile(userId: string): Promise<TechProfile | undefined>;
  upsertTechProfile(profile: InsertTechProfile): Promise<TechProfile>;
  
  // Tech certification operations
  getTechCertifications(techProfileId: number): Promise<TechCertification[]>;
  createTechCertification(certification: InsertTechCertification): Promise<TechCertification>;
  updateTechCertification(id: number, certification: Partial<InsertTechCertification>): Promise<TechCertification>;
  deleteTechCertification(id: number): Promise<void>;
  
  // Tech skill operations
  getTechSkills(techProfileId: number): Promise<TechSkill[]>;
  createTechSkill(skill: InsertTechSkill): Promise<TechSkill>;
  updateTechSkill(id: number, skill: Partial<InsertTechSkill>): Promise<TechSkill>;
  deleteTechSkill(id: number): Promise<void>;
  
  // Service completion operations
  getServiceCompletions(techProfileId: number): Promise<ServiceCompletion[]>;
  createServiceCompletion(completion: InsertServiceCompletion): Promise<ServiceCompletion>;
  updateServiceCompletion(id: number, completion: Partial<InsertServiceCompletion>): Promise<ServiceCompletion>;
  deleteServiceCompletion(id: number): Promise<void>;
  getTechStats(techProfileId: number): Promise<{
    totalCompletions: number;
    totalHours: number;
    averageRating: number;
    categories: { category: string; count: number }[];
  }>;
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

  // Incident operations
  async getAllIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncidentsByClient(clientId: number): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.clientId, clientId)).orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(incidentData).returning();
    return incident;
  }

  async updateIncident(id: number, incidentData: Partial<InsertIncident>): Promise<Incident> {
    const [incident] = await db
      .update(incidents)
      .set({ ...incidentData, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return incident;
  }

  async deleteIncident(id: number): Promise<void> {
    await db.delete(incidents).where(eq(incidents.id, id));
  }

  // Ticket operations
  async getAllTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketsByServiceRequest(serviceRequestId: number): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.serviceRequestId, serviceRequestId));
  }

  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const [ticket] = await db.insert(tickets).values(ticketData).returning();
    return ticket;
  }

  async updateTicket(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
  }

  // Ticket message operations
  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(desc(ticketMessages.createdAt));
  }

  async createTicketMessage(messageData: InsertTicketMessage): Promise<TicketMessage> {
    const [message] = await db.insert(ticketMessages).values(messageData).returning();
    return message;
  }

  // Tech profile operations
  async getTechProfile(userId: string): Promise<TechProfile | undefined> {
    const [profile] = await db.select().from(techProfiles).where(eq(techProfiles.userId, userId));
    return profile;
  }

  async upsertTechProfile(profileData: InsertTechProfile): Promise<TechProfile> {
    const [profile] = await db
      .insert(techProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: techProfiles.userId,
        set: {
          ...profileData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  // Client authentication operations
  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client;
  }

  async createClientAccount(clientData: any): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(clientData)
      .returning();
    return client;
  }

  // Available techs for clients
  async getAvailableTechs(clientId?: number): Promise<TechProfile[]> {
    const query = db
      .select()
      .from(techProfiles)
      .where(eq(techProfiles.isAvailable, true));
    
    const allTechs = await query;
    
    // Filter based on availability mode
    return allTechs.filter(tech => {
      if (tech.availabilityMode === 'all') return true;
      if (tech.availabilityMode === 'specific' && clientId) {
        const allowedIds = tech.allowedClientIds as number[] || [];
        return allowedIds.includes(clientId);
      }
      return false;
    });
  }

  // Client service requests
  async getClientServiceRequests(clientId: number): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.clientId, clientId));
  }

  async createClientServiceRequest(requestData: any): Promise<ServiceRequest> {
    const [request] = await db
      .insert(serviceRequests)
      .values(requestData)
      .returning();
    return request;
  }

  // Tech certification operations
  async getTechCertifications(techProfileId: number): Promise<TechCertification[]> {
    return await db.select().from(techCertifications)
      .where(eq(techCertifications.techProfileId, techProfileId))
      .orderBy(desc(techCertifications.issueDate));
  }

  async createTechCertification(certificationData: InsertTechCertification): Promise<TechCertification> {
    const [certification] = await db
      .insert(techCertifications)
      .values(certificationData)
      .returning();
    return certification;
  }

  async updateTechCertification(id: number, certificationData: Partial<InsertTechCertification>): Promise<TechCertification> {
    const [certification] = await db
      .update(techCertifications)
      .set(certificationData)
      .where(eq(techCertifications.id, id))
      .returning();
    return certification;
  }

  async deleteTechCertification(id: number): Promise<void> {
    await db.delete(techCertifications).where(eq(techCertifications.id, id));
  }

  // Tech skill operations
  async getTechSkills(techProfileId: number): Promise<TechSkill[]> {
    return await db.select().from(techSkills)
      .where(eq(techSkills.techProfileId, techProfileId))
      .orderBy(techSkills.category, techSkills.name);
  }

  async createTechSkill(skillData: InsertTechSkill): Promise<TechSkill> {
    const [skill] = await db
      .insert(techSkills)
      .values(skillData)
      .returning();
    return skill;
  }

  async updateTechSkill(id: number, skillData: Partial<InsertTechSkill>): Promise<TechSkill> {
    const [skill] = await db
      .update(techSkills)
      .set(skillData)
      .where(eq(techSkills.id, id))
      .returning();
    return skill;
  }

  async deleteTechSkill(id: number): Promise<void> {
    await db.delete(techSkills).where(eq(techSkills.id, id));
  }

  // Service completion operations
  async getServiceCompletions(techProfileId: number): Promise<ServiceCompletion[]> {
    return await db.select().from(serviceCompletions)
      .where(eq(serviceCompletions.techProfileId, techProfileId))
      .orderBy(desc(serviceCompletions.completedAt));
  }

  async createServiceCompletion(completionData: InsertServiceCompletion): Promise<ServiceCompletion> {
    const [completion] = await db
      .insert(serviceCompletions)
      .values(completionData)
      .returning();
    return completion;
  }

  async updateServiceCompletion(id: number, completionData: Partial<InsertServiceCompletion>): Promise<ServiceCompletion> {
    const [completion] = await db
      .update(serviceCompletions)
      .set(completionData)
      .where(eq(serviceCompletions.id, id))
      .returning();
    return completion;
  }

  async deleteServiceCompletion(id: number): Promise<void> {
    await db.delete(serviceCompletions).where(eq(serviceCompletions.id, id));
  }

  async getTechStats(techProfileId: number): Promise<{
    totalCompletions: number;
    totalHours: number;
    averageRating: number;
    categories: { category: string; count: number }[];
  }> {
    const completions = await this.getServiceCompletions(techProfileId);
    
    const totalCompletions = completions.length;
    const totalHours = completions.reduce((sum, completion) => 
      sum + (parseFloat(completion.hoursWorked?.toString() || '0')), 0);
    
    const ratingsSum = completions
      .filter(c => c.clientSatisfactionRating)
      .reduce((sum, completion) => sum + (completion.clientSatisfactionRating || 0), 0);
    const ratingsCount = completions.filter(c => c.clientSatisfactionRating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    const categoryMap = new Map<string, number>();
    completions.forEach(completion => {
      if (completion.category) {
        categoryMap.set(completion.category, (categoryMap.get(completion.category) || 0) + 1);
      }
    });

    const categories = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }));

    return {
      totalCompletions,
      totalHours,
      averageRating,
      categories
    };
  }
}

export const storage = new DatabaseStorage();
