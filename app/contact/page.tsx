import { ContactForm } from '@/components/contact/ContactForm';
import { businessConfig } from '@/config/business.config';
import { Phone, Mail, MapPin } from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#1e293b] text-white py-16 px-4 text-center">
        <h1 className="font-display text-6xl tracking-wide">Get in Touch</h1>
        <p className="text-gray-400 mt-3">Questions, feedback, or just want to say hi?</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-3xl tracking-wide mb-6">Send a Message</h2>
          <ContactForm />
        </div>

        <div>
          <h2 className="font-display text-3xl tracking-wide mb-6">Find Us</h2>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-muted-foreground text-sm">{businessConfig.contact.address}</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <a href={`tel:${businessConfig.contact.phone}`} className="text-muted-foreground text-sm hover:text-[#6366f1] transition-colors">
                  {businessConfig.contact.phone}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <a href={`mailto:${businessConfig.contact.email}`} className="text-muted-foreground text-sm hover:text-[#6366f1] transition-colors">
                  {businessConfig.contact.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                <InstagramIcon className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <p className="font-semibold">Instagram</p>
                <a href={businessConfig.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-[#6366f1] transition-colors">
                  @ozzysbarbering
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                <FacebookIcon className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <p className="font-semibold">Facebook</p>
                <a href={businessConfig.contact.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-[#6366f1] transition-colors">
                  Ozzy&apos;s Barbering
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
