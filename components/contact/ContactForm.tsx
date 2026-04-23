'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { contactSchema, type ContactFormData } from '@/lib/validations/contact.schema';
import { CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();
      setSent(true);
      reset();
    } catch {
      toast.error("Couldn't send your message. Please try calling us instead.");
    }
  }

  if (sent) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="h-12 w-12 text-[#c0392b] mx-auto mb-4" />
        <h3 className="font-display text-2xl tracking-wide mb-2">Message Sent!</h3>
        <p className="text-muted-foreground">We&apos;ll get back to you as soon as possible.</p>
        <Button onClick={() => setSent(false)} variant="outline" className="mt-6">Send another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name')} className="mt-1" placeholder="Your name" />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1" placeholder="you@example.com" />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" {...register('phone')} className="mt-1" placeholder="+44 7700 900000" />
      </div>

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" {...register('message')} rows={5} className="mt-1" placeholder="How can we help?" />
        {errors.message && <p className="text-destructive text-xs mt-1">{errors.message.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#0f0f0f] hover:bg-[#1a1a1a] text-white"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
