export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface Availability {
  id?: string;
  dayOfWeek: number; // 0=Sunday … 6=Saturday
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  isActive: boolean;
}

export interface BlockedDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason: string | null;
}

export interface Booking {
  id: string;
  confirmationCode: string;
  customerName: string;
  email: string;
  phone: string | null;
  notes: string | null;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  date: string;       // "YYYY-MM-DD"
  timeSlot: string;   // "10:00"
  status: BookingStatus;
  emailSent: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  storagePath: string;
  caption: string | null;
  order: number;
  createdAt: string;
}
