import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWebLeadSchema, insertClientSchema, insertServiceRequestSchema, insertInventorySchema, insertInvoiceSchema, insertIncidentSchema, insertTicketSchema, insertTicketMessageSchema, insertTechProfileSchema } from "@shared/schema";

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

  // Web Leads routes
  app.post('/api/leads', async (req, res) => {
    try {
      const leadData = insertWebLeadSchema.parse(req.body);
      const lead = await storage.createWebLead(leadData);
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(400).json({ message: "Failed to create lead" });
    }
  });

  app.get('/api/leads', isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getAllWebLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClient(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Service Request routes
  app.get('/api/service-requests', isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getAllServiceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post('/api/service-requests', isAuthenticated, async (req, res) => {
    try {
      const requestData = insertServiceRequestSchema.parse(req.body);
      const request = await storage.createServiceRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(400).json({ message: "Failed to create service request" });
    }
  });

  app.put('/api/service-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const requestData = insertServiceRequestSchema.partial().parse(req.body);
      const request = await storage.updateServiceRequest(id, requestData);
      res.json(request);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(400).json({ message: "Failed to update service request" });
    }
  });

  // Inventory routes
  app.get('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getAllInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: "Failed to create inventory item" });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const [clients, serviceRequests, invoices, leads] = await Promise.all([
        storage.getAllClients(),
        storage.getAllServiceRequests(),
        storage.getAllInvoices(),
        storage.getAllWebLeads(),
      ]);

      const stats = {
        activeClients: clients.length,
        openRequests: serviceRequests.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
        pendingInvoices: invoices.filter(i => i.status === 'unpaid').length,
        newLeads: leads.filter(l => {
          const createdAt = new Date(l.createdAt || '');
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdAt > weekAgo;
        }).length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Incident routes
  app.get('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const incidents = await storage.getAllIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.get('/api/incidents/client/:clientId', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const incidents = await storage.getIncidentsByClient(clientId);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching client incidents:", error);
      res.status(500).json({ message: "Failed to fetch client incidents" });
    }
  });

  app.post('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(incidentData);
      res.json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  app.patch('/api/incidents/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const incident = await storage.updateIncident(id, updates);
      res.json(incident);
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ message: "Failed to update incident" });
    }
  });

  // Ticket routes
  app.get('/api/tickets', isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get('/api/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.get('/api/service-requests/:id/tickets', isAuthenticated, async (req, res) => {
    try {
      const serviceRequestId = parseInt(req.params.id);
      const tickets = await storage.getTicketsByServiceRequest(serviceRequestId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching service request tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.post('/api/tickets', isAuthenticated, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(ticketData);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.patch('/api/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const ticket = await storage.updateTicket(id, updates);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Ticket message routes - unified for both tech and client access
  app.get('/api/tickets/:id/messages', async (req, res) => {
    try {
      // Accept both client and tech authentication
      const isClientAuth = req.session.clientId;
      const isTechAuth = req.user?.claims?.sub;
      
      if (!isClientAuth && !isTechAuth) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const ticketId = parseInt(req.params.id);
      const messages = await storage.getTicketMessages(ticketId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/tickets/:id/messages', async (req, res) => {
    try {
      // Accept both client and tech authentication
      const isClientAuth = req.session.clientId;
      const isTechAuth = req.user?.claims?.sub;
      
      if (!isClientAuth && !isTechAuth) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const ticketId = parseInt(req.params.id);
      
      // Determine sender type based on authentication
      const senderType = isClientAuth ? "client" : "tech";
      
      const messageData = insertTicketMessageSchema.parse({
        ...req.body,
        ticketId,
        senderType
      });
      const message = await storage.createTicketMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating ticket message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Tech profile routes
  app.get('/api/tech-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getTechProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching tech profile:", error);
      res.status(500).json({ message: "Failed to fetch tech profile" });
    }
  });

  app.post('/api/tech-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertTechProfileSchema.parse({
        ...req.body,
        userId
      });
      const profile = await storage.upsertTechProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating tech profile:", error);
      res.status(500).json({ message: "Failed to update tech profile" });
    }
  });

  // Client Authentication Routes
  app.post("/api/client/signup", async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
      
      const existingClient = await storage.getClientByEmail(email);
      if (existingClient) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const client = await storage.createClientAccount({
        name,
        email,
        phone,
        password, // In production, hash with bcrypt
        isActive: true,
      });

      res.json({ message: "Account created successfully", clientId: client.id });
    } catch (error) {
      console.error("Client signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/client/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const client = await storage.getClientByEmail(email);
      if (!client || client.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.clientId = client.id;
      req.session.clientEmail = client.email;
      
      res.json({ message: "Login successful", client: { id: client.id, name: client.name, email: client.email } });
    } catch (error) {
      console.error("Client login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/client/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/client/profile", async (req, res) => {
    try {
      const clientId = req.session.clientId;
      if (!clientId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { password, ...clientData } = client;
      res.json(clientData);
    } catch (error) {
      console.error("Get client profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.get("/api/client/service-requests", async (req, res) => {
    try {
      const clientId = req.session.clientId;
      if (!clientId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const requests = await storage.getClientServiceRequests(clientId);
      res.json(requests);
    } catch (error) {
      console.error("Get client requests error:", error);
      res.status(500).json({ message: "Failed to get service requests" });
    }
  });

  app.post("/api/client/service-requests", async (req, res) => {
    try {
      const clientId = req.session.clientId;
      if (!clientId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { serviceType, description } = req.body;
      const request = await storage.createClientServiceRequest({
        clientId,
        serviceType,
        description,
        status: "pending",
      });

      res.json(request);
    } catch (error) {
      console.error("Create client request error:", error);
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.get("/api/client/available-techs", async (req, res) => {
    try {
      const clientId = req.session.clientId;
      if (!clientId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const techs = await storage.getAvailableTechs(clientId);
      res.json(techs);
    } catch (error) {
      console.error("Get available techs error:", error);
      res.status(500).json({ message: "Failed to get available techs" });
    }
  });

  app.get("/api/client/tickets/:ticketId/messages", async (req, res) => {
    try {
      const clientId = req.session.clientId;
      if (!clientId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ticketId = parseInt(req.params.ticketId);
      const messages = await storage.getTicketMessages(ticketId);
      res.json(messages);
    } catch (error) {
      console.error("Get client ticket messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/client/tickets/:ticketId/messages", async (req, res) => {
    try {
      const clientId = req.session.clientId;
      if (!clientId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ticketId = parseInt(req.params.ticketId);
      const messageData = insertTicketMessageSchema.parse({
        ...req.body,
        ticketId,
        senderType: "client"
      });
      const message = await storage.createTicketMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Create client ticket message error:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Tech Certification routes
  app.get("/api/tech-certifications/:techProfileId", isAuthenticated, async (req, res) => {
    try {
      const techProfileId = parseInt(req.params.techProfileId);
      const certifications = await storage.getTechCertifications(techProfileId);
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  app.post("/api/tech-certifications", isAuthenticated, async (req, res) => {
    try {
      const certification = await storage.createTechCertification(req.body);
      res.json(certification);
    } catch (error) {
      console.error("Error creating certification:", error);
      res.status(500).json({ message: "Failed to create certification" });
    }
  });

  app.patch("/api/tech-certifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certification = await storage.updateTechCertification(id, req.body);
      res.json(certification);
    } catch (error) {
      console.error("Error updating certification:", error);
      res.status(500).json({ message: "Failed to update certification" });
    }
  });

  app.delete("/api/tech-certifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTechCertification(id);
      res.json({ message: "Certification deleted successfully" });
    } catch (error) {
      console.error("Error deleting certification:", error);
      res.status(500).json({ message: "Failed to delete certification" });
    }
  });

  // Tech Skills routes
  app.get("/api/tech-skills/:techProfileId", isAuthenticated, async (req, res) => {
    try {
      const techProfileId = parseInt(req.params.techProfileId);
      const skills = await storage.getTechSkills(techProfileId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post("/api/tech-skills", isAuthenticated, async (req, res) => {
    try {
      const skill = await storage.createTechSkill(req.body);
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.patch("/api/tech-skills/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skill = await storage.updateTechSkill(id, req.body);
      res.json(skill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/tech-skills/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTechSkill(id);
      res.json({ message: "Skill deleted successfully" });
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Service Completion routes
  app.get("/api/service-completions/:techProfileId", isAuthenticated, async (req, res) => {
    try {
      const techProfileId = parseInt(req.params.techProfileId);
      const completions = await storage.getServiceCompletions(techProfileId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  app.post("/api/service-completions", isAuthenticated, async (req, res) => {
    try {
      const completion = await storage.createServiceCompletion(req.body);
      res.json(completion);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(500).json({ message: "Failed to create completion" });
    }
  });

  app.patch("/api/service-completions/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const completion = await storage.updateServiceCompletion(id, req.body);
      res.json(completion);
    } catch (error) {
      console.error("Error updating completion:", error);
      res.status(500).json({ message: "Failed to update completion" });
    }
  });

  app.delete("/api/service-completions/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceCompletion(id);
      res.json({ message: "Completion deleted successfully" });
    } catch (error) {
      console.error("Error deleting completion:", error);
      res.status(500).json({ message: "Failed to delete completion" });
    }
  });

  // Tech Stats route
  app.get("/api/tech-stats/:techProfileId", isAuthenticated, async (req, res) => {
    try {
      const techProfileId = parseInt(req.params.techProfileId);
      const stats = await storage.getTechStats(techProfileId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching tech stats:", error);
      res.status(500).json({ message: "Failed to fetch tech stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
