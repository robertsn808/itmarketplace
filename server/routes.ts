import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWebLeadSchema, insertClientSchema, insertServiceRequestSchema, insertInventorySchema, insertInvoiceSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
