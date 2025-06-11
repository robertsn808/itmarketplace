import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Settings, 
  User, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  Calculator
} from "lucide-react";

interface TicketDialogProps {
  serviceRequest: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDialog({ serviceRequest, open, onOpenChange }: TicketDialogProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"chat" | "email">("chat");
  const [isInternal, setIsInternal] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [estimatedHours, setEstimatedHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [totalEstimate, setTotalEstimate] = useState("");
  const [priceNotes, setPriceNotes] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch or create ticket for this service request
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: [`/api/service-requests/${serviceRequest?.id}/tickets`],
    enabled: !!serviceRequest?.id && open,
    retry: false,
  });

  // Fetch ticket messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/tickets/${ticket?.id}/messages`],
    enabled: !!ticket?.id && open,
    retry: false,
  });

  // Fetch tech profile
  const { data: techProfile } = useQuery({
    queryKey: ["/api/tech-profile"],
    enabled: open,
    retry: false,
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/tickets", data);
    },
    onSuccess: (newTicket) => {
      setTicket(newTicket);
      queryClient.invalidateQueries({ queryKey: [`/api/service-requests/${serviceRequest?.id}/tickets`] });
    },
    onError: (error) => {
      console.error("Create ticket error:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/tickets/${ticket.id}/messages`, data);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticket?.id}/messages`] });
      scrollToBottom();
    },
    onError: (error) => {
      console.error("Send message error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return await apiRequest("PATCH", `/api/tickets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticket?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/service-requests/${serviceRequest?.id}/tickets`] });
    },
  });

  // Initialize ticket when dialog opens
  useEffect(() => {
    if (open && tickets && serviceRequest) {
      if (tickets.length > 0) {
        setTicket(tickets[0]);
      } else {
        // Create new ticket
        createTicketMutation.mutate({
          serviceRequestId: serviceRequest.id,
          clientId: serviceRequest.clientId,
          title: `${serviceRequest.serviceType} - ${serviceRequest.description?.substring(0, 50)}...`,
          description: serviceRequest.description,
          assignedTo: serviceRequest.assignedTo,
          techEmail: techProfile?.personalEmail,
        });
      }
    }
  }, [open, tickets, serviceRequest, techProfile]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !ticket) return;

    sendMessageMutation.mutate({
      senderType: "tech",
      senderName: techProfile?.name || "Tech Support",
      senderEmail: techProfile?.personalEmail || "",
      message: newMessage,
      messageType,
      isInternal,
      emailSent: messageType === "email",
    });
  };

  const handleStatusUpdate = (status: string) => {
    updateTicketMutation.mutate({
      id: ticket.id,
      updates: { status }
    });
  };

  const handlePriorityUpdate = (priority: string) => {
    updateTicketMutation.mutate({
      id: ticket.id,
      updates: { priority }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'system':
        return <Settings className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket #{ticket?.id || "New"} - {serviceRequest?.serviceType}
            {ticket && getStatusBadge(ticket.status)}
          </DialogTitle>
          <DialogDescription>
            Service Request for {serviceRequest?.clientId ? `Client #${serviceRequest.clientId}` : "Unknown Client"}
          </DialogDescription>
        </DialogHeader>

        {ticketsLoading || createTicketMutation.isPending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading ticket...</span>
          </div>
        ) : (
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Ticket Info Bar */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <Select
                          value={ticket?.status || "open"}
                          onValueChange={handleStatusUpdate}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Priority</Label>
                        <Select
                          value={ticket?.priority || "medium"}
                          onValueChange={handlePriorityUpdate}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Assigned To</Label>
                        <p className="text-sm font-medium">{ticket?.assignedTo || "Unassigned"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages Area */}
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Communication</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm">Loading messages...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.senderType === "tech" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderType === "tech"
                                ? message.isInternal
                                  ? "bg-purple-100 text-purple-900"
                                  : "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {getMessageIcon(message.messageType)}
                              <span className="text-xs font-medium">
                                {message.senderName}
                              </span>
                              {message.isInternal && (
                                <Badge variant="secondary" className="text-xs">Internal</Badge>
                              )}
                              <span className="text-xs opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <Separator />

                  {/* Message Input */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Type:</Label>
                        <Select value={messageType} onValueChange={(value: "chat" | "email") => setMessageType(value)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chat">Chat</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          id="internal" 
                          checked={isInternal} 
                          onCheckedChange={setIsInternal}
                        />
                        <Label htmlFor="internal" className="text-sm">Internal Note</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        placeholder={
                          isInternal 
                            ? "Add internal note for team..." 
                            : messageType === "email" 
                              ? "Compose email message..." 
                              : "Type a message..."
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[60px] resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="px-3"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="w-80 space-y-4 overflow-y-auto max-h-full">
              {/* Service Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Service Type</Label>
                    <p className="text-sm font-medium">{serviceRequest?.serviceType}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <p className="text-sm">{serviceRequest?.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <p className="text-sm">{serviceRequest?.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Created</Label>
                    <p className="text-sm">
                      {serviceRequest?.createdAt 
                        ? new Date(serviceRequest.createdAt).toLocaleDateString() 
                        : "Unknown"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Email Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Tech Email</Label>
                    <p className="text-sm">
                      {techProfile?.personalEmail || "Not configured"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={ticket?.emailNotifications || false}
                      onCheckedChange={(checked) => 
                        updateTicketMutation.mutate({
                          id: ticket?.id,
                          updates: { emailNotifications: checked }
                        })
                      }
                    />
                    <Label className="text-sm">Email notifications</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={ticket?.clientNotifications !== false}
                      onCheckedChange={(checked) => 
                        updateTicketMutation.mutate({
                          id: ticket?.id,
                          updates: { clientNotifications: checked }
                        })
                      }
                    />
                    <Label className="text-sm">Client notifications</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Price Negotiation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price Negotiation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Estimated Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="0.0"
                        value={estimatedHours}
                        onChange={(e) => {
                          setEstimatedHours(e.target.value);
                          if (e.target.value && hourlyRate) {
                            setTotalEstimate((parseFloat(e.target.value) * parseFloat(hourlyRate)).toFixed(2));
                          }
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Hourly Rate ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={hourlyRate}
                        onChange={(e) => {
                          setHourlyRate(e.target.value);
                          if (e.target.value && estimatedHours) {
                            setTotalEstimate((parseFloat(estimatedHours) * parseFloat(e.target.value)).toFixed(2));
                          }
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Estimate</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={totalEstimate}
                        onChange={(e) => setTotalEstimate(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        <Calculator className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Pricing Notes</Label>
                    <Textarea
                      placeholder="Add notes about pricing, parts, travel time, etc..."
                      value={priceNotes}
                      onChange={(e) => setPriceNotes(e.target.value)}
                      className="h-16 text-xs resize-none"
                    />
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                      Send Quote
                    </Button>
                    <Button size="sm" className="flex-1 h-7 text-xs">
                      Accept Quote
                    </Button>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Quote Status:</span>
                      <Badge variant="outline" className="text-xs">
                        Draft
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}