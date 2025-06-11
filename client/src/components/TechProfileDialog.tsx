import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Mail, User, Save, MapPin, Eye, Users, DollarSign } from "lucide-react";

export function TechProfileDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [emailSignature, setEmailSignature] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityMode, setAvailabilityMode] = useState("none");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing tech profile
  const { data: techProfile, isLoading } = useQuery({
    queryKey: ["/api/tech-profile"],
    enabled: open,
    retry: false,
  });

  // Initialize form with existing data
  useState(() => {
    if (techProfile) {
      setName(techProfile.name || "");
      setPersonalEmail(techProfile.personalEmail || "");
      setEmailSignature(techProfile.emailSignature || "");
      setSpecialties(techProfile.specialties || "");
      setLatitude(techProfile.latitude || "");
      setLongitude(techProfile.longitude || "");
      setAddress(techProfile.address || "");
      setPhone(techProfile.phone || "");
      setBio(techProfile.bio || "");
      setHourlyRate(techProfile.hourlyRate || "");
      setIsAvailable(techProfile.isAvailable || false);
      setAvailabilityMode(techProfile.availabilityMode || "none");
    }
  });

  // Update tech profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/tech-profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tech profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tech-profile"] });
      setOpen(false);
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description: "Failed to update tech profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      name,
      personalEmail,
      emailSignature,
      specialties,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      address,
      phone,
      bio,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      isAvailable,
      availabilityMode,
      notificationPreferences: {
        emailNotifications: true,
        clientNotifications: true,
      },
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          toast({
            title: "Location Updated",
            description: "Your current location has been set.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Tech Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Tech Profile Settings
          </DialogTitle>
          <DialogDescription>
            Configure your personal information and email settings for client communications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Personal Work Email</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  placeholder="your.email@company.com"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This email will be used when sending emails to clients from tickets.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSignature">Email Signature</Label>
                <Textarea
                  id="emailSignature"
                  placeholder="Best regards,&#10;Your Name&#10;TechPro Support&#10;Phone: (555) 123-4567"
                  value={emailSignature}
                  onChange={(e) => setEmailSignature(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This signature will be automatically added to emails sent to clients.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive email notifications for new tickets and messages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Client Auto-notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically notify clients when ticket status changes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending || !name || !personalEmail}
            >
              {updateProfileMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}