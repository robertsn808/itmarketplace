import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/ContactForm";
import { Navigation } from "@/components/Navigation";
import { 
  Wrench, 
  Headphones, 
  Code, 
  FileText, 
  Check, 
  Phone, 
  Mail, 
  Clock,
  Star,
  Users,
  LogIn,
  UserPlus
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const services = [
    {
      icon: <Wrench className="h-8 w-8 text-primary" />,
      title: "IT Repairs",
      description: "Hardware diagnostics, repairs, and maintenance for computers, servers, and network equipment.",
      features: ["Hardware Diagnostics", "Component Replacement", "System Optimization"]
    },
    {
      icon: <Headphones className="h-8 w-8 text-primary" />,
      title: "Office Tech Support",
      description: "Comprehensive technical support for your office infrastructure and daily operations.",
      features: ["Network Setup & Maintenance", "Software Installation", "User Training"]
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Website & Database",
      description: "Custom website development, database design, and ongoing maintenance services.",
      features: ["Custom Web Development", "Database Architecture", "Maintenance & Updates"]
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Print & Documentation",
      description: "Professional printing solutions and comprehensive documentation packages.",
      features: ["Print Setup & Management", "Technical Documentation", "Process Documentation"]
    }
  ];

  const pricingPlans = [
    {
      name: "Hourly Support",
      price: "$95",
      period: "/hour",
      description: "Pay as you go for flexible support",
      features: [
        "On-demand technical support",
        "No minimum commitment",
        "Remote and on-site options",
        "Detailed time tracking",
        "Priority scheduling available"
      ],
      popular: false
    },
    {
      name: "Essential Package",
      price: "$599",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "8 hours monthly support",
        "System monitoring",
        "Basic website maintenance",
        "Email support",
        "Monthly reports"
      ],
      popular: false
    },
    {
      name: "Professional Package",
      price: "$1,299",
      period: "/month",
      description: "Comprehensive business solution",
      features: [
        "20 hours monthly support",
        "24/7 system monitoring",
        "Complete website management",
        "Database optimization",
        "Priority phone support",
        "Quarterly business reviews"
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Professional IT Solutions for Your Business
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Expert IT repairs, office tech support, website development, and comprehensive documentation services. We keep your business running smoothly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg" asChild>
                  <a href="#contact">Get Started Today</a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg" asChild>
                  <a href="#services">View Services</a>
                </Button>
              </div>
              
              {/* Client Portal Access */}
              <div className="mt-8 p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Existing Customers
                </h3>
                <p className="text-muted-foreground mb-4">
                  Track your repairs, communicate with technicians, and manage your service requests.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/client/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="default" className="flex-1" asChild>
                    <Link href="/client/signup">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=800" 
                alt="Professional IT workspace with modern technology" 
                className="rounded-xl shadow-2xl w-full h-auto" 
              />
              <Card className="absolute -bottom-6 -right-6 p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Support Available</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Professional Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive IT solutions tailored to keep your business operations running smoothly and efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose between flexible hourly rates or comprehensive fixed-price packages.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {plan.price}<span className="text-lg text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.popular ? "Choose Plan" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're proud to have helped hundreds of businesses optimize their technology infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Coming Soon</div>
                      <div className="text-sm text-muted-foreground">Client Testimonial</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic mb-4">
                    "We're currently collecting testimonials from our satisfied clients. Check back soon to see their success stories."
                  </p>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Get In Touch</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Ready to optimize your IT infrastructure? Contact us for a free consultation and custom quote.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Phone</div>
                    <div className="text-muted-foreground">(555) 123-4567</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Email</div>
                    <div className="text-muted-foreground">contact@techproservices.com</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Business Hours</div>
                    <div className="text-muted-foreground">Mon-Fri: 8AM-6PM</div>
                    <div className="text-muted-foreground">Emergency: 24/7</div>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary">TechPro</h3>
              <p className="text-muted-foreground mb-4">
                Professional IT solutions for modern businesses. We keep your technology running smoothly.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#services" className="hover:text-primary transition-colors">IT Repairs</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors">Tech Support</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors">Web Development</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Contact Info</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />(555) 123-4567
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />contact@techproservices.com
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 TechPro Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
