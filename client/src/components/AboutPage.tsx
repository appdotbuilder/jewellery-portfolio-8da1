import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Award, Sparkles, Users, Clock, MapPin } from 'lucide-react';

export function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'Every piece is crafted with genuine love for the art of jewellery making.'
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'We use only the finest materials and time-tested techniques.'
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Contemporary designs that push the boundaries of traditional jewellery.'
    },
    {
      icon: Users,
      title: 'Personal',
      description: 'Each client receives individual attention and custom solutions.'
    }
  ];

  const milestones = [
    {
      year: '2018',
      title: 'The Beginning',
      description: 'Founded Atelier Jewellery with a vision to create contemporary pieces that tell stories.'
    },
    {
      year: '2019',
      title: 'First Collection',
      description: 'Launched our debut collection "Organic Forms" inspired by nature\'s geometry.'
    },
    {
      year: '2021',
      title: 'Recognition',
      description: 'Received the Contemporary Jewellery Designer Award from the Craft Council.'
    },
    {
      year: '2023',
      title: 'Expansion',
      description: 'Opened our workshop to private commissions and bespoke design services.'
    }
  ];

  const skills = [
    'Hand Forging',
    'Stone Setting',
    'Wax Carving',
    'CAD Design',
    'Precious Metal Clay',
    'Enameling',
    'Textile Integration',
    'Mixed Media'
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-serif font-bold text-stone-800">
          About Atelier Jewellery
        </h1>
        <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
          We are a contemporary jewellery studio dedicated to creating unique, handcrafted pieces 
          that blend traditional techniques with modern aesthetics. Each creation tells a story 
          and captures a moment in time.
        </p>
      </div>

      {/* Artist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-stone-800">
            Meet the Artist
          </h2>
          <div className="space-y-4 text-stone-600">
            <p>
              Sarah Chen is the creative force behind Atelier Jewellery. With over a decade 
              of experience in fine jewellery making, Sarah combines her background in 
              metalworking with a passion for contemporary design.
            </p>
            <p>
              Trained at the prestigious London College of Fashion and having worked with 
              renowned jewellers across Europe, Sarah brings a unique perspective to each piece. 
              Her work has been featured in Vogue, Elle, and Harper's Bazaar.
            </p>
            <p>
              When not in the workshop, Sarah teaches advanced metalworking techniques and 
              mentors emerging jewellery designers.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-stone-500 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>London, UK</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Est. 2018</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full h-96 bg-gradient-to-br from-amber-100 to-stone-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-stone-400">
              <div className="text-6xl mb-4">👩‍🎨</div>
              <p className="text-lg font-medium">Sarah Chen</p>
              <p className="text-sm">Founder & Creative Director</p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-stone-300" />

      {/* Values Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4">
            Our Values
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            These core principles guide everything we do, from the initial design concept 
            to the final polish of each piece.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="text-center p-6 bg-white/80 backdrop-blur-sm border-stone-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Icon className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator className="bg-stone-300" />

      {/* Process Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4">
            Our Process
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            From concept to completion, each piece follows a carefully orchestrated 
            journey of creativity and craftsmanship.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold mb-2">
                1
              </div>
              <CardTitle>Concept & Design</CardTitle>
              <CardDescription>
                Every piece begins with an idea, sketched and refined until the perfect 
                form emerges. We explore materials, proportions, and technical possibilities.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold mb-2">
                2
              </div>
              <CardTitle>Crafting</CardTitle>
              <CardDescription>
                Using traditional hand tools and techniques, each piece is carefully 
                formed, soldered, and shaped. This is where the design comes to life.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold mb-2">
                3
              </div>
              <CardTitle>Finishing</CardTitle>
              <CardDescription>
                The final stage involves careful polishing, texturing, and quality 
                control to ensure each piece meets our exacting standards.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Separator className="bg-stone-300" />

      {/* Skills & Techniques */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4">
            Techniques & Skills
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Our expertise spans traditional goldsmithing techniques and contemporary 
            digital fabrication methods.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="px-4 py-2 text-stone-700 border-stone-300 bg-white/60"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="bg-stone-300" />

      {/* Timeline */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4">
            Our Journey
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Key milestones in the evolution of Atelier Jewellery.
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-amber-300 transform md:-translate-x-0.5"></div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex items-start ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                <div className={`flex-1 ${
                  index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'
                }`}>
                  <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500">{milestone.year}</Badge>
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      </div>
                      <CardDescription>{milestone.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
                
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full border-4 border-white shadow-lg z-10 relative"></div>
                
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-amber-50 to-stone-50 rounded-lg p-8">
        <h3 className="text-2xl font-serif font-bold text-stone-800 mb-4">
          Ready to Create Something Unique?
        </h3>
        <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
          Whether you're looking for a statement piece from our collection or interested 
          in commissioning a bespoke design, we'd love to hear from you.
        </p>
        <div className="text-stone-500 text-sm">
          Get in touch through our contact page to discuss your project.
        </div>
      </div>
    </div>
  );
}