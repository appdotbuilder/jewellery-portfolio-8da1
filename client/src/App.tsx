import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Gem, Mail, User, Settings } from 'lucide-react';
import { PortfolioPage } from '@/components/PortfolioPage';
import { AboutPage } from '@/components/AboutPage';
import { ContactPage } from '@/components/ContactPage';
import { AdminSection } from '@/components/AdminSection';

type PageType = 'portfolio' | 'about' | 'contact' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('portfolio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'portfolio' as const, label: 'Portfolio', icon: Gem },
    { id: 'about' as const, label: 'About', icon: User },
    { id: 'contact' as const, label: 'Contact', icon: Mail },
    { id: 'admin' as const, label: 'Admin', icon: Settings },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'portfolio':
        return <PortfolioPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'admin':
        return <AdminSection />;
      default:
        return <PortfolioPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Navigation Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Gem className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-serif font-bold text-stone-800">
                Atelier Jewellery
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      currentPage === item.id 
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                        : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100'
                    }`}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-stone-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className={`w-full justify-start space-x-2 ${
                      currentPage === item.id 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'text-stone-600 hover:text-stone-800'
                    }`}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gem className="h-6 w-6 text-amber-500" />
                <h3 className="text-xl font-serif font-bold">Atelier Jewellery</h3>
              </div>
              <p className="text-stone-400">
                Contemporary handcrafted jewellery pieces designed and created with passion and precision.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {navigation.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    className="block text-stone-400 hover:text-amber-500 transition-colors"
                    onClick={() => setCurrentPage(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {['Rings', 'Brooches', 'Earrings', 'Pendants', 'Cuff Links'].map((category) => (
                  <Badge key={category} variant="outline" className="text-stone-400 border-stone-600">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <Separator className="my-8 bg-stone-700" />
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-stone-400 text-sm">
              © {new Date().getFullYear()} Atelier Jewellery. All rights reserved.
            </p>
            <p className="text-stone-400 text-sm mt-2 md:mt-0">
              Handcrafted with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;