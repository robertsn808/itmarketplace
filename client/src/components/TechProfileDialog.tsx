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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechCredentials } from "./TechCredentials";
import { Settings, Mail, User, Save, MapPin, Eye, Users, DollarSign, Award, Briefcase } from "lucide-react";

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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Tech Profile Settings
          </DialogTitle>
          <DialogDescription>
            Configure your profile, credentials, and service history.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  placeholder="iPhone Repair, Laptop Diagnostics, Network Setup"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple specialties with commas
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief description of your experience and expertise..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="75"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
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

          {/* Location & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Available for Clients</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow clients to find and contact you
                  </p>
                </div>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>

              {isAvailable && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="availabilityMode">Visibility Mode</Label>
                    <Select value={availabilityMode} onValueChange={setAvailabilityMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not visible to clients</SelectItem>
                        <SelectItem value="all">Visible to all clients</SelectItem>
                        <SelectItem value="specific">Visible to specific clients only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State 12345"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        placeholder="21.3099"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        placeholder="-157.8581"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button variant="outline" onClick={getCurrentLocation} className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Current Location
                  </Button>
                </>
              )}
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
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials">
            {techProfile?.id && (
              <TechCredentials techProfileId={techProfile.id} />
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Professional Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="years-experience">Years of Experience</Label>
                  <Input
                    id="years-experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={techProfile?.yearsExperience || ""}
                    onChange={(e) => {
                      // This will be handled by the profile save
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education & Training</Label>
                  <Textarea
                    id="education"
                    placeholder="List your relevant education, certifications, and training..."
                    value={techProfile?.education || ""}
                    onChange={(e) => {
                      // This will be handled by the profile save
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume-url">Resume URL</Label>
                  <Input
                    id="resume-url"
                    placeholder="https://yourwebsite.com/resume.pdf"
                    value={techProfile?.resumeUrl || ""}
                    onChange={(e) => {
                      // This will be handled by the profile save
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio-url">Portfolio URL</Label>
                  <Input
                    id="portfolio-url"
                    placeholder="https://yourwebsite.com/portfolio"
                    value={techProfile?.portfolioUrl || ""}
                    onChange={(e) => {
                      // This will be handled by the profile save
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}