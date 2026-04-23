'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface DatePickerStepProps {
  advanceBookingDays: number;
  onSelect: (date: string) => void;
  onBack: () => void;
}

export function DatePickerStep({ advanceBookingDays, onSelect, onBack }: DatePickerStepProps) {
  const [selected, setSelected] = useState<Date | undefined>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + advanceBookingDays);

  function toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide mb-2">Pick a Date</h2>
      <p className="text-muted-foreground mb-6">Select an available date for your appointment.</p>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day: Date | undefined) => setSelected(day)}
          disabled={(date) => date < today || date > maxDate}
          className="rounded-md border shadow-sm bg-card"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          disabled={!selected}
          onClick={() => selected && onSelect(toDateString(selected))}
          className="flex-1 bg-[#0f0f0f] hover:bg-[#1a1a1a] text-white border-transparent"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
