import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Calendar, 
  ExternalLink, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  Target
} from "lucide-react";

interface TechCredentialsProps {
  techProfileId: number;
}

export function TechCredentials({ techProfileId }: TechCredentialsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [certificationDialog, setCertificationDialog] = useState(false);
  const [skillDialog, setSkillDialog] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [editingCertification, setEditingCertification] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [editingCompletion, setEditingCompletion] = useState<any>(null);

  // Form states
  const [certForm, setCertForm] = useState({
    name: "",
    issuingOrganization: "",
    credentialId: "",
    credentialUrl: "",
    issueDate: "",
    expirationDate: ""
  });

  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "",
    proficiencyLevel: "",
    verified: false
  });

  const [completionForm, setCompletionForm] = useState({
    title: "",
    description: "",
    category: "",
    hoursWorked: "",
    clientSatisfactionRating: "",
    clientTestimonial: "",
    skillsUsed: "",
    challengesSolved: ""
  });

  // Queries
  const { data: certifications = [] } = useQuery({
    queryKey: [`/api/tech-certifications/${techProfileId}`],
  });

  const { data: skills = [] } = useQuery({
    queryKey: [`/api/tech-skills/${techProfileId}`],
  });

  const { data: completions = [] } = useQuery({
    queryKey: [`/api/service-completions/${techProfileId}`],
  });

  const { data: techStats } = useQuery({
    queryKey: [`/api/tech-stats/${techProfileId}`],
  });

  // Mutations
  const certificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingCertification 
        ? `/api/tech-certifications/${editingCertification.id}`
        : "/api/tech-certifications";
      return await apiRequest(endpoint, {
        method: editingCertification ? "PATCH" : "POST",
        body: JSON.stringify({ ...data, techProfileId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tech-certifications/${techProfileId}`] });
      setCertificationDialog(false);
      setEditingCertification(null);
      setCertForm({
        name: "",
        issuingOrganization: "",
        credentialId: "",
        credentialUrl: "",
        issueDate: "",
        expirationDate: ""
      });
      toast({ title: "Certification saved successfully" });
    },
  });

  const skillMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingSkill 
        ? `/api/tech-skills/${editingSkill.id}`
        : "/api/tech-skills";
      return await apiRequest(endpoint, {
        method: editingSkill ? "PATCH" : "POST",
        body: JSON.stringify({ ...data, techProfileId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tech-skills/${techProfileId}`] });
      setSkillDialog(false);
      setEditingSkill(null);
      setSkillForm({
        name: "",
        category: "",
        proficiencyLevel: "",
        verified: false
      });
      toast({ title: "Skill saved successfully" });
    },
  });

  const completionMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingCompletion 
        ? `/api/service-completions/${editingCompletion.id}`
        : "/api/service-completions";
      return await apiRequest(endpoint, {
        method: editingCompletion ? "PATCH" : "POST",
        body: JSON.stringify({ 
          ...data, 
          techProfileId,
          skillsUsed: data.skillsUsed.split(',').map((s: string) => s.trim()).filter(Boolean)
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-completions/${techProfileId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tech-stats/${techProfileId}`] });
      setCompletionDialog(false);
      setEditingCompletion(null);
      setCompletionForm({
        title: "",
        description: "",
        category: "",
        hoursWorked: "",
        clientSatisfactionRating: "",
        clientTestimonial: "",
        skillsUsed: "",
        challengesSolved: ""
      });
      toast({ title: "Service completion saved successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: number }) => {
      return await apiRequest(`/api/${type}/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, { type }) => {
      if (type === 'tech-certifications') {
        queryClient.invalidateQueries({ queryKey: [`/api/tech-certifications/${techProfileId}`] });
      } else if (type === 'tech-skills') {
        queryClient.invalidateQueries({ queryKey: [`/api/tech-skills/${techProfileId}`] });
      } else if (type === 'service-completions') {
        queryClient.invalidateQueries({ queryKey: [`/api/service-completions/${techProfileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/tech-stats/${techProfileId}`] });
      }
      toast({ title: "Item deleted successfully" });
    },
  });

  const openEditCertification = (cert: any) => {
    setEditingCertification(cert);
    setCertForm({
      name: cert.name || "",
      issuingOrganization: cert.issuingOrganization || "",
      credentialId: cert.credentialId || "",
      credentialUrl: cert.credentialUrl || "",
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : "",
      expirationDate: cert.expirationDate ? new Date(cert.expirationDate).toISOString().split('T')[0] : ""
    });
    setCertificationDialog(true);
  };

  const openEditSkill = (skill: any) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name || "",
      category: skill.category || "",
      proficiencyLevel: skill.proficiencyLevel || "",
      verified: skill.verified || false
    });
    setSkillDialog(true);
  };

  const openEditCompletion = (completion: any) => {
    setEditingCompletion(completion);
    setCompletionForm({
      title: completion.title || "",
      description: completion.description || "",
      category: completion.category || "",
      hoursWorked: completion.hoursWorked?.toString() || "",
      clientSatisfactionRating: completion.clientSatisfactionRating?.toString() || "",
      clientTestimonial: completion.clientTestimonial || "",
      skillsUsed: completion.skillsUsed?.join(', ') || "",
      challengesSolved: completion.challengesSolved || ""
    });
    setCompletionDialog(true);
  };

  const getProficiencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'bg-green-500';
      case 'advanced': return 'bg-blue-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'beginner': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getProficiencyWidth = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 100;
      case 'advanced': return 75;
      case 'intermediate': return 50;
      case 'beginner': return 25;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      {techStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Professional Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{techStats.totalCompletions}</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{techStats.totalHours.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Hours Worked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {techStats.averageRating > 0 ? techStats.averageRating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{techStats.categories.length}</div>
                <div className="text-sm text-muted-foreground">Service Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="certifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="skills">Skills & Badges</TabsTrigger>
          <TabsTrigger value="completions">Work History</TabsTrigger>
        </TabsList>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Professional Certifications</h3>
            <Dialog open={certificationDialog} onOpenChange={setCertificationDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCertification(null);
                  setCertForm({
                    name: "",
                    issuingOrganization: "",
                    credentialId: "",
                    credentialUrl: "",
                    issueDate: "",
                    expirationDate: ""
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCertification ? 'Edit' : 'Add'} Certification
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cert-name">Certification Name</Label>
                    <Input
                      id="cert-name"
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      placeholder="e.g., CompTIA A+"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-org">Issuing Organization</Label>
                    <Input
                      id="cert-org"
                      value={certForm.issuingOrganization}
                      onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                      placeholder="e.g., CompTIA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-id">Credential ID</Label>
                    <Input
                      id="cert-id"
                      value={certForm.credentialId}
                      onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-url">Verification URL</Label>
                    <Input
                      id="cert-url"
                      value={certForm.credentialUrl}
                      onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="cert-issue">Issue Date</Label>
                      <Input
                        id="cert-issue"
                        type="date"
                        value={certForm.issueDate}
                        onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cert-expire">Expiration Date</Label>
                      <Input
                        id="cert-expire"
                        type="date"
                        value={certForm.expirationDate}
                        onChange={(e) => setCertForm({ ...certForm, expirationDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCertificationDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => certificationMutation.mutate(certForm)}>
                      {editingCertification ? 'Update' : 'Add'} Certification
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {certifications.map((cert: any) => (
              <Card key={cert.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{cert.name}</h4>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{cert.issuingOrganization}</p>
                      {cert.credentialId && (
                        <p className="text-xs text-muted-foreground">ID: {cert.credentialId}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {cert.issueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </span>
                        )}
                        {cert.expirationDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditCertification(cert)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate({ type: 'tech-certifications', id: cert.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Technical Skills & Expertise</h3>
            <Dialog open={skillDialog} onOpenChange={setSkillDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingSkill(null);
                  setSkillForm({
                    name: "",
                    category: "",
                    proficiencyLevel: "",
                    verified: false
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSkill ? 'Edit' : 'Add'} Skill
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="skill-name">Skill Name</Label>
                    <Input
                      id="skill-name"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g., Network Administration"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-category">Category</Label>
                    <Select value={skillForm.category} onValueChange={(value) => setSkillForm({ ...skillForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="web">Web Development</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="cloud">Cloud Computing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="skill-level">Proficiency Level</Label>
                    <Select value={skillForm.proficiencyLevel} onValueChange={(value) => setSkillForm({ ...skillForm, proficiencyLevel: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSkillDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => skillMutation.mutate(skillForm)}>
                      {editingSkill ? 'Update' : 'Add'} Skill
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {skills.map((skill: any) => (
              <Card key={skill.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{skill.name}</h4>
                        {skill.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="secondary">{skill.category}</Badge>
                        <Badge className={getProficiencyColor(skill.proficiencyLevel)}>
                          {skill.proficiencyLevel}
                        </Badge>
                      </div>
                      <Progress value={getProficiencyWidth(skill.proficiencyLevel)} className="h-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditSkill(skill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate({ type: 'tech-skills', id: skill.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Service Completions Tab */}
        <TabsContent value="completions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Service Completion History</h3>
            <Dialog open={completionDialog} onOpenChange={setCompletionDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCompletion(null);
                  setCompletionForm({
                    title: "",
                    description: "",
                    category: "",
                    hoursWorked: "",
                    clientSatisfactionRating: "",
                    clientTestimonial: "",
                    skillsUsed: "",
                    challengesSolved: ""
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Completion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCompletion ? 'Edit' : 'Add'} Service Completion
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="completion-title">Project Title</Label>
                    <Input
                      id="completion-title"
                      value={completionForm.title}
                      onChange={(e) => setCompletionForm({ ...completionForm, title: e.target.value })}
                      placeholder="e.g., Network Infrastructure Upgrade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completion-description">Description</Label>
                    <Textarea
                      id="completion-description"
                      value={completionForm.description}
                      onChange={(e) => setCompletionForm({ ...completionForm, description: e.target.value })}
                      placeholder="Detailed description of the work performed..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="completion-category">Category</Label>
                      <Select value={completionForm.category} onValueChange={(value) => setCompletionForm({ ...completionForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="upgrade">Upgrade</SelectItem>
                          <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="completion-hours">Hours Worked</Label>
                      <Input
                        id="completion-hours"
                        type="number"
                        step="0.5"
                        value={completionForm.hoursWorked}
                        onChange={(e) => setCompletionForm({ ...completionForm, hoursWorked: e.target.value })}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="completion-rating">Client Satisfaction Rating (1-5)</Label>
                    <Select value={completionForm.clientSatisfactionRating} onValueChange={(value) => setCompletionForm({ ...completionForm, clientSatisfactionRating: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                        <SelectItem value="4">4 - Very Good</SelectItem>
                        <SelectItem value="3">3 - Good</SelectItem>
                        <SelectItem value="2">2 - Fair</SelectItem>
                        <SelectItem value="1">1 - Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="completion-testimonial">Client Testimonial</Label>
                    <Textarea
                      id="completion-testimonial"
                      value={completionForm.clientTestimonial}
                      onChange={(e) => setCompletionForm({ ...completionForm, clientTestimonial: e.target.value })}
                      placeholder="What did the client say about your work?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completion-skills">Skills Used (comma-separated)</Label>
                    <Input
                      id="completion-skills"
                      value={completionForm.skillsUsed}
                      onChange={(e) => setCompletionForm({ ...completionForm, skillsUsed: e.target.value })}
                      placeholder="e.g., Network Configuration, Troubleshooting, Documentation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completion-challenges">Challenges Solved</Label>
                    <Textarea
                      id="completion-challenges"
                      value={completionForm.challengesSolved}
                      onChange={(e) => setCompletionForm({ ...completionForm, challengesSolved: e.target.value })}
                      placeholder="What specific problems did you solve?"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCompletionDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => completionMutation.mutate(completionForm)}>
                      {editingCompletion ? 'Update' : 'Add'} Completion
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {completions.map((completion: any) => (
              <Card key={completion.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{completion.title}</h4>
                        <Badge variant="secondary">{completion.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{completion.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        {completion.hoursWorked && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {completion.hoursWorked}h
                          </div>
                        )}
                        {completion.clientSatisfactionRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            {completion.clientSatisfactionRating}/5
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(completion.completedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {completion.skillsUsed && completion.skillsUsed.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-muted-foreground mb-1">Skills Used:</div>
                          <div className="flex flex-wrap gap-1">
                            {completion.skillsUsed.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {completion.clientTestimonial && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground mb-1">Client Feedback:</div>
                          <p className="text-sm italic">"{completion.clientTestimonial}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditCompletion(completion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate({ type: 'service-completions', id: completion.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}