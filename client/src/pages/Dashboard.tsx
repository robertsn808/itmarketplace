import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewServiceRequestDialog } from "@/components/NewServiceRequestDialog";
import { SimpleClientDialog } from "@/components/SimpleClientDialog";
import { TicketDialog } from "@/components/TicketDialog";
import { TechProfileDialog } from "@/components/TechProfileDialog";
import { 
  Users, 
  ClipboardList, 
  File, 
  UserPlus, 
  LogOut,
  Plus,
  Boxes,
  UserCheck,
  Phone,
  Package,
  Wrench,
  CheckCircle
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<any>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Dashboard stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Service requests query
  const { data: serviceRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests"],
    retry: false,
  });

  // Clients query
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  // Leads query
  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  // Invoices query
  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  // Inventory query
  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
    retry: false,
  });

  // Incidents query
  const { data: incidents } = useQuery({
    queryKey: ["/api/incidents"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Convert lead to client mutation
  const convertLeadMutation = useMutation({
    mutationFn: async (lead: any) => {
      return await apiRequest("POST", "/api/clients", {
        name: lead.name,
        email: lead.email,
        notes: `Converted from lead. Original message: ${lead.message}`
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead converted to client successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      console.error("Convert lead error:", error);
      toast({
        title: "Error",
        description: "Failed to convert lead to client",
        variant: "destructive",
      });
    },
  });

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/incidents", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Incident created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
    },
    onError: (error) => {
      console.error("Create incident error:", error);
      toast({
        title: "Error",
        description: "Failed to create incident",
        variant: "destructive",
      });
    },
  });

  // Update incident stage mutation
  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return await apiRequest("PATCH", `/api/incidents/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stage updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
    },
    onError: (error) => {
      console.error("Update incident error:", error);
      toast({
        title: "Error",
        description: "Failed to update stage",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'unpaid':
        return <Badge variant="destructive">Unpaid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get client's latest incident
  const getClientIncident = (clientId: number) => {
    if (!incidents || !Array.isArray(incidents)) return null;
    return incidents.find((incident: any) => incident.clientId === clientId);
  };

  // Create incident for existing client
  const handleCreateIncident = (client: any) => {
    createIncidentMutation.mutate({
      clientId: client.id,
      title: `IT Support for ${client.name}`,
      description: "New incident created for existing client",
      callStage: true,
      receiveStage: false,
      repairStage: false,
      pickupStage: false,
    });
  };

  // Toggle incident stage
  const handleToggleStage = (incident: any, stage: string) => {
    const updates: any = {};
    updates[stage] = !incident[stage];
    updateIncidentMutation.mutate({ id: incident.id, updates });
  };

  // Handle service request click to open ticket
  const handleServiceRequestClick = (serviceRequest: any) => {
    setSelectedServiceRequest(serviceRequest);
    setTicketDialogOpen(true);
  };

  // Render stage indicator
  const renderStageIndicator = (
    icon: React.ReactNode,
    isActive: boolean,
    isClickable: boolean,
    label: string,
    onClick: (() => void) | undefined = undefined
  ) => (
    <div 
      className={`flex flex-col items-center p-2 rounded cursor-pointer transition-colors ${
        isActive 
          ? "bg-green-100 text-green-700" 
          : isClickable 
            ? "bg-gray-100 text-gray-400 hover:bg-gray-200" 
            : "bg-gray-50 text-gray-300"
      }`}
      onClick={isClickable ? onClick : undefined}
      title={label}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-foreground">TechPro Dashboard</h1>
            <div className="flex items-center gap-2">
              <TechProfileDialog />
              <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.activeClients || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Requests</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.openRequests || 0}
                  </p>
                </div>
                <ClipboardList className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.pendingInvoices || 0}
                  </p>
                </div>
                <File className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.newLeads || 0}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="requests">Service Requests</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          {/* Service Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Service Requests</h2>
              <NewServiceRequestDialog />
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client ID</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading service requests...
                        </TableCell>
                      </TableRow>
                    ) : serviceRequests?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No service requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      serviceRequests?.map((request: any) => (
                        <TableRow 
                          key={request.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleServiceRequestClick(request)}
                        >
                          <TableCell className="font-medium">#{request.id}</TableCell>
                          <TableCell>{request.clientId || "N/A"}</TableCell>
                          <TableCell>{request.serviceType || "N/A"}</TableCell>
                          <TableCell>{getStatusBadge(request.status || "unknown")}</TableCell>
                          <TableCell>{request.assignedTo || "Unassigned"}</TableCell>
                          <TableCell>
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Clients</h2>
              <SimpleClientDialog />
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Repair Progress</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No clients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients?.map((client: any) => {
                        const incident = getClientIncident(client.id);
                        return (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name || "N/A"}</TableCell>
                            <TableCell>{client.email || "N/A"}</TableCell>
                            <TableCell>{client.phone || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {incident ? (
                                  <>
                                    {renderStageIndicator(
                                      <Phone className="h-4 w-4" />,
                                      incident.callStage,
                                      true,
                                      "Call",
                                      () => handleToggleStage(incident, "callStage")
                                    )}
                                    {renderStageIndicator(
                                      <Package className="h-4 w-4" />,
                                      incident.receiveStage,
                                      incident.callStage,
                                      "Receive",
                                      incident.callStage ? () => handleToggleStage(incident, "receiveStage") : undefined
                                    )}
                                    {renderStageIndicator(
                                      <Wrench className="h-4 w-4" />,
                                      incident.repairStage,
                                      incident.receiveStage,
                                      "Repair",
                                      incident.receiveStage ? () => handleToggleStage(incident, "repairStage") : undefined
                                    )}
                                    {renderStageIndicator(
                                      <CheckCircle className="h-4 w-4" />,
                                      incident.pickupStage,
                                      incident.repairStage,
                                      "Pickup",
                                      incident.repairStage ? () => handleToggleStage(incident, "pickupStage") : undefined
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground">No active repair</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {incident ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs"
                                >
                                  View Details
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCreateIncident(client)}
                                  disabled={createIncidentMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                >
                                  Start Repair
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Web Leads</h2>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No leads found
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads?.map((lead: any) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name || "N/A"}</TableCell>
                          <TableCell>{lead.email || "N/A"}</TableCell>
                          <TableCell className="max-w-xs truncate">{lead.message || "N/A"}</TableCell>
                          <TableCell>{lead.source || "N/A"}</TableCell>
                          <TableCell>
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => convertLeadMutation.mutate(lead)}
                              disabled={convertLeadMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Add as Client
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices?.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">#{invoice.id}</TableCell>
                          <TableCell>{invoice.clientId || "N/A"}</TableCell>
                          <TableCell>${invoice.amount || "0.00"}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status || "unknown")}</TableCell>
                          <TableCell>
                            {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Inventory</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Last Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No inventory items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName || "N/A"}</TableCell>
                          <TableCell>{item.quantity || 0}</TableCell>
                          <TableCell className="max-w-xs truncate">{item.notes || "N/A"}</TableCell>
                          <TableCell>
                            {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : "Never"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket Dialog */}
      <TicketDialog
        serviceRequest={selectedServiceRequest}
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
      />
    </div>
  );
}
