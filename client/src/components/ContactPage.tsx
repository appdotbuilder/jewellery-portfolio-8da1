import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, MapPin, Clock, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { SubmitContactFormInput } from '../../../server/src/schema';

export function ContactPage() {
  const [formData, setFormData] = useState<SubmitContactFormInput>({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus('idle');
    
    try {
      await trpc.submitContactForm.mutate(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@atelierjewellery.com',
      description: 'For general inquiries and commissions'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+44 20 7123 4567',
      description: 'Available Monday to Friday, 9am-5pm'
    },
    {
      icon: MapPin,
      label: 'Studio',
      value: 'Hatton Garden, London EC1N',
      description: 'By appointment only'
    },
    {
      icon: Clock,
      label: 'Hours',
      value: 'Mon-Fri: 9am-5pm',
      description: 'Weekend consultations available'
    }
  ];

  const services = [
    {
      title: 'Bespoke Commissions',
      description: 'Custom jewellery pieces designed specifically for you',
      timeline: '4-8 weeks',
      badge: 'Popular'
    },
    {
      title: 'Restoration & Repair',
      description: 'Expert restoration of vintage and damaged pieces',
      timeline: '1-3 weeks',
      badge: 'Specialist'
    },
    {
      title: 'Consultation',
      description: 'Design consultation and technical advice',
      timeline: '1-2 hours',
      badge: 'Free'
    },
    {
      title: 'Workshop Tours',
      description: 'Behind-the-scenes look at our creative process',
      timeline: '1 hour',
      badge: 'Experience'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-serif font-bold text-stone-800">
          Get In Touch
        </h1>
        <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
          Whether you're interested in a piece from our collection, have a commission in mind, 
          or simply want to learn more about our work, we'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" />
                Send us a message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {submitStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Thank you for your message! We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}
              
              {submitStatus === 'error' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errorMessage || 'Something went wrong. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: SubmitContactFormInput) => ({ ...prev, name: e.target.value }))
                    }
                    className="border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: SubmitContactFormInput) => ({ ...prev, email: e.target.value }))
                    }
                    className="border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">
                    Your Message *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your project, questions, or how we can help you..."
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: SubmitContactFormInput) => ({ ...prev, message: e.target.value }))
                    }
                    className="border-stone-300 focus:border-amber-500 focus:ring-amber-500 min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              <div className="text-xs text-stone-500 pt-2">
                * Required fields. We'll never share your information with third parties.
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <CardTitle>Our Services</CardTitle>
              <CardDescription>
                What we can help you with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="p-3 border border-stone-200 rounded-md bg-stone-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-stone-800">{service.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {service.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-600 mb-2">{service.description}</p>
                  <div className="text-xs text-stone-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Timeline: {service.timeline}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Multiple ways to reach us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800">{info.label}</h4>
                      <p className="text-stone-900 font-medium">{info.value}</p>
                      <p className="text-sm text-stone-600">{info.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <CardTitle>Visit Our Studio</CardTitle>
              <CardDescription>
                Located in the heart of London's jewellery quarter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-48 bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-stone-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Hatton Garden, London</p>
                  <p className="text-sm">Interactive map coming soon</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Studio visits by appointment only.</strong> Please contact us to 
                  schedule a visit to see our collection and discuss your project in person.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200">
            <CardHeader>
              <CardTitle>Frequently Asked</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-stone-800 mb-1">How long does a commission take?</h5>
                  <p className="text-sm text-stone-600">
                    Typically 4-8 weeks, depending on complexity and current workload.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-stone-800 mb-1">Do you offer consultations?</h5>
                  <p className="text-sm text-stone-600">
                    Yes! Initial consultations are complimentary and can be done in-person or virtually.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-stone-800 mb-1">What materials do you work with?</h5>
                  <p className="text-sm text-stone-600">
                    Gold, silver, platinum, precious stones, and alternative materials upon request.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}