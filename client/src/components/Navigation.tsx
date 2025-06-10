import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "#services", label: "Services" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">TechPro</h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                ) : (
                  <Button variant="ghost" onClick={handleLogin}>
                    Login
                  </Button>
                )}
                <Button onClick={() => handleNavClick("#contact")}>
                  Get Quote
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="text-left text-muted-foreground hover:text-primary transition-colors py-2 text-lg"
                    >
                      {item.label}
                    </button>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    {!isLoading && (
                      <>
                        {isAuthenticated ? (
                          <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                              Dashboard
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" className="w-full justify-start" onClick={handleLogin}>
                            Login
                          </Button>
                        )}
                        <Button className="w-full" onClick={() => handleNavClick("#contact")}>
                          Get Quote
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
