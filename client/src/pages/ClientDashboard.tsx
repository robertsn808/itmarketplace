import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, 
  Plus, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Package,
  Settings,
  Send,
  User,
  MapPin
} from "lucide-react";
import { TechMap } from "@/components/TechMap";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch client data
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ["/api/client/profile"],
    retry: false,
  });

  // Fetch client's service requests
  const { data: serviceRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/client/service-requests"],
    retry: false,
  });

  // Fetch ticket messages for selected ticket
  const { data: ticketMessages } = useQuery({
    queryKey: [`/api/tickets/${selectedTicket?.id}/messages`],
    enabled: !!selectedTicket?.id,
    refetchInterval: 3000, // Refresh every 3 seconds for live chat
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: number; message: string; isFromClient: boolean }) => {
      return await apiRequest("POST", `/api/tickets/${data.ticketId}/messages`, {
        message: data.message,
        senderName: client?.name || "Client",
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${selectedTicket?.id}/messages`] });
    },
  });

  // New service request mutation
  const newRequestMutation = useMutation({
    mutationFn: async (data: { serviceType: string; description: string }) => {
      return await apiRequest("POST", "/api/client/service-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your service request has been submitted successfully.",
      });
      setNewRequestOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/client/service-requests"] });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/client/logout", {});
      setLocation("/client/login");
    } catch (error) {
      setLocation("/client/login");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status?.toUpperCase() || "PENDING"}
      </Badge>
    );
  };

  const getStageIcon = (stage: string, isActive: boolean) => {
    const icons = {
      call: Phone,
      receive: Package,
      repair: Settings,
      pickup: CheckCircle,
    };
    
    const Icon = icons[stage as keyof typeof icons] || AlertCircle;
    return <Icon className={`h-4 w-4 ${isActive ? "text-green-500" : "text-gray-400"}`} />;
  };

  const openTicketDialog = (request: any) => {
    setSelectedTicket(request);
    setTicketDialogOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    sendMessageMutation.mutate({
      ticketId: selectedTicket.id,
      message: newMessage,
      isFromClient: true,
    });
  };

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Repairs</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {client?.name}</p>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="repairs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="repairs">My Repairs</TabsTrigger>
            <TabsTrigger value="techs">Find Techs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="repairs" className="space-y-6">
            {/* Quick Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Service Requests</h2>
              <Button onClick={() => setNewRequestOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            {/* Service Requests */}
            <div className="grid gap-4">
              {requestsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading your requests...</p>
                </div>
              ) : serviceRequests?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No service requests yet</p>
                    <Button onClick={() => setNewRequestOpen(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                serviceRequests?.map((request: any) => (
                  <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTicketDialog(request)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">#{request.id} - {request.serviceType}</CardTitle>
                          <CardDescription>{request.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Repair Stages */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          {getStageIcon("call", request.callStage)}
                          <span className="text-sm">Call</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStageIcon("receive", request.receiveStage)}
                          <span className="text-sm">Receive</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStageIcon("repair", request.repairStage)}
                          <span className="text-sm">Repair</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStageIcon("pickup", request.pickupStage)}
                          <span className="text-sm">Pickup</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
                        {request.assignedTo && <p>Assigned to: {request.assignedTo}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="techs" className="space-y-6">
            <TechMap />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm text-muted-foreground">{client?.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">{client?.email}</p>
                </div>
                {client?.phone && (
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                )}
                <div>
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(client?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Request Dialog */}
      <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit New Service Request</DialogTitle>
            <DialogDescription>
              Describe the issue with your device and we'll get back to you promptly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            newRequestMutation.mutate({
              serviceType: formData.get("serviceType") as string,
              description: formData.get("description") as string,
            });
          }} className="space-y-4">
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Input
                id="serviceType"
                name="serviceType"
                placeholder="e.g., iPhone Screen Repair, Laptop Won't Boot"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Please describe the issue in detail..."
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setNewRequestOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={newRequestMutation.isPending}>
                {newRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Chat Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Ticket #{selectedTicket?.id} - {selectedTicket?.serviceType}
            </DialogTitle>
            <DialogDescription>
              Live chat with technician
            </DialogDescription>
          </DialogHeader>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
            {ticketMessages?.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              ticketMessages?.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === "client" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderType === "client"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.senderName} • {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim() || sendMessageMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}