import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Phone, Mail, DollarSign, User, Star } from "lucide-react";

interface Tech {
  id: number;
  name: string;
  specialties: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  personalEmail: string;
  bio: string;
  hourlyRate: number;
  profileImageUrl?: string;
  isAvailable: boolean;
}

export function TechMap() {
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);
  const [hoveredTech, setHoveredTech] = useState<Tech | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 21.3099, lng: -157.8581 }); // Hawaii default

  // Fetch available techs
  const { data: availableTechs, isLoading } = useQuery({
    queryKey: ["/api/client/available-techs"],
    retry: false,
  });

  // Simple map implementation using CSS positioning
  // In production, you'd use Google Maps, Mapbox, or similar
  const renderSimpleMap = () => {
    if (!availableTechs?.length) {
      return (
        <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No techs available in your area</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg border overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-blue-600">
            {/* Simple grid pattern to simulate map */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Tech Markers */}
        {availableTechs?.map((tech: Tech, index: number) => {
          // Distribute techs across the map for demo purposes
          const x = 15 + (index % 4) * 20 + Math.random() * 10;
          const y = 15 + Math.floor(index / 4) * 25 + Math.random() * 10;
          
          return (
            <div
              key={tech.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setHoveredTech(tech)}
              onMouseLeave={() => setHoveredTech(null)}
              onClick={() => setSelectedTech(tech)}
            >
              {/* Tech Profile Bubble */}
              <div className={`relative ${hoveredTech?.id === tech.id ? 'scale-110' : 'scale-100'} transition-transform`}>
                <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
                  <AvatarImage src={tech.profileImageUrl} alt={tech.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {tech.name?.split(' ').map(n => n[0]).join('') || 'T'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status indicator */}
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  tech.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>

              {/* Hover Card */}
              {hoveredTech?.id === tech.id && (
                <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 shadow-xl z-10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={tech.profileImageUrl} alt={tech.name} />
                        <AvatarFallback className="text-xs">
                          {tech.name?.split(' ').map(n => n[0]).join('') || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      {tech.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{tech.address}</span>
                    </div>
                    
                    {tech.specialties && (
                      <div className="flex flex-wrap gap-1">
                        {tech.specialties.split(',').slice(0, 2).map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{tech.phone}</span>
                      </div>
                      {tech.hourlyRate && (
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>${tech.hourlyRate}/hr</span>
                        </div>
                      )}
                    </div>
                    
                    <Button size="sm" className="w-full" onClick={() => setSelectedTech(tech)}>
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Available Technicians Near You</h3>
        <Badge variant="outline">
          {availableTechs?.length || 0} techs available
        </Badge>
      </div>

      {isLoading ? (
        <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : (
        renderSimpleMap()
      )}

      {/* Tech Profile Detail Dialog */}
      <Dialog open={!!selectedTech} onOpenChange={() => setSelectedTech(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedTech?.profileImageUrl} alt={selectedTech?.name} />
                <AvatarFallback>
                  {selectedTech?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{selectedTech?.name}</h3>
                <p className="text-sm text-muted-foreground">Professional Technician</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Bio */}
            {selectedTech?.bio && (
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-sm text-muted-foreground">{selectedTech.bio}</p>
              </div>
            )}

            {/* Specialties */}
            {selectedTech?.specialties && (
              <div>
                <h4 className="font-medium mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTech.specialties.split(',').map((specialty, idx) => (
                    <Badge key={idx} variant="secondary">
                      {specialty.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Contact</h4>
                <div className="space-y-2">
                  {selectedTech?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTech.phone}</span>
                    </div>
                  )}
                  {selectedTech?.personalEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTech.personalEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{selectedTech?.address}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            {selectedTech?.hourlyRate && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Hourly Rate</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${selectedTech.hourlyRate}/hour
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}