import type { Availability, Booking } from '@/types';

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += durationMinutes;
  }

  return slots;
}

export function getAvailableSlots(
  availability: Availability,
  existingBookings: Booking[],
  durationMinutes: number
): string[] {
  const allSlots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    durationMinutes
  );

  const bookedSlots = new Set(
    existingBookings
      .filter((b) => b.status !== 'CANCELLED')
      .map((b) => b.timeSlot)
  );

  return allSlots.filter((slot) => {
    if (bookedSlots.has(slot)) return false;

    // Check if any existing booking overlaps this slot's time range
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + durationMinutes;

    for (const booking of existingBookings) {
      if (booking.status === 'CANCELLED') continue;
      const bookedStart = timeToMinutes(booking.timeSlot);
      const bookedEnd = bookedStart + booking.serviceDuration;
      if (slotStart < bookedEnd && slotEnd > bookedStart) return false;
    }

    return true;
  });
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function isPastSlot(date: string, timeSlot: string): boolean {
  const now = new Date();
  const [y, mo, d] = date.split('-').map(Number);
  const [h, m] = timeSlot.split(':').map(Number);
  const slotDate = new Date(y, mo - 1, d, h, m);
  return slotDate <= now;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
