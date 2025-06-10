import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function NewServiceRequestDialog() {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [assignedTo, setAssignedTo] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients for the dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/service-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service request created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      // Reset form
      setClientId("");
      setServiceType("");
      setDescription("");
      setStatus("pending");
      setAssignedTo("");
      setOpen(false);
    },
    onError: (error) => {
      console.error("Create service request error:", error);
      toast({
        title: "Error",
        description: "Failed to create service request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !description) {
      toast({
        title: "Validation Error",
        description: "Service type and description are required",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate({
      clientId: clientId ? parseInt(clientId) : null,
      serviceType,
      description,
      status,
      assignedTo: assignedTo || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Service Request</DialogTitle>
          <DialogDescription>
            Add a new service request to track work for a client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select onValueChange={setClientId} value={clientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(clients) && clients.map((client: any) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Service Type *</Label>
            <Select onValueChange={setServiceType} value={serviceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT Repairs">IT Repairs</SelectItem>
                <SelectItem value="Office Tech Support">Office Tech Support</SelectItem>
                <SelectItem value="Website & Database">Website & Database</SelectItem>
                <SelectItem value="Print & Documentation">Print & Documentation</SelectItem>
                <SelectItem value="Network Setup">Network Setup</SelectItem>
                <SelectItem value="Software Installation">Software Installation</SelectItem>
                <SelectItem value="Hardware Upgrade">Hardware Upgrade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea 
              placeholder="Describe the service request details..."
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Input 
              placeholder="Enter technician name (optional)" 
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}