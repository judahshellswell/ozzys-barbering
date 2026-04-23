'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { formatTime } from '@/lib/booking-utils';

interface TimeSlotPickerProps {
  serviceId: string;
  date: string;
  onSelect: (timeSlot: string) => void;
  onBack: () => void;
}

export function TimeSlotPicker({ serviceId, date, onSelect, onBack }: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    setSlots([]);
    setSelected('');
    fetch(`/api/bookings/available-slots?serviceId=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [serviceId, date]);

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide mb-2">Choose a Time</h2>
      <p className="text-muted-foreground mb-6">
        {new Date(date + 'T00:00').toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long',
        })}
      </p>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-11 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-2">No slots available on this day.</p>
          <p className="text-sm text-muted-foreground">Please go back and choose a different date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelected(slot)}
              className={`py-2.5 px-3 rounded-md text-sm font-medium border transition-all ${
                selected === slot
                  ? 'bg-[#0f0f0f] text-white border-[#0f0f0f] ring-2 ring-[#6366f1]'
                  : 'bg-card border-border hover:border-[#6366f1] hover:text-[#6366f1]'
              }`}
            >
              {formatTime(slot)}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
          className="flex-1 bg-[#0f0f0f] hover:bg-[#1a1a1a] text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
