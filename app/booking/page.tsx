'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number | string;
};

type Step = 'service' | 'date' | 'time' | 'details' | 'confirmed';

function formatDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatPrice(price: number | string) {
  if (typeof price === 'string') {
    return '£' + price.split('-').join(' – £');
  }
  return '£' + Number(price).toFixed(2);
}

export default function BookingPage() {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  // Calendar state
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [calMonth, setCalMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d : []))
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedTime('');
    fetch(`/api/bookings/available-slots?serviceId=${selectedService.id}&date=${selectedDate}`)
      .then(r => r.json())
      .then(d => setSlots(Array.isArray(d) ? d : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, selectedDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          timeSlot: selectedTime,
          customerName: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Booking failed. Please try again.');
        return;
      }
      setConfirmationCode(data.confirmationCode);
      setStep('confirmed');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Build calendar days for current month view
  function getCalendarDays() {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);

    const days: { date: Date; disabled: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ date: new Date(0), disabled: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({ date, disabled: date < today || date > maxDate });
    }
    return days;
  }

  const STEP_LABELS = ['Service', 'Date', 'Time', 'Details'];
  const stepIndex = { service: 0, date: 1, time: 2, details: 3, confirmed: 4 }[step];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl tracking-wide">Book an Appointment</h1>
          <p className="text-muted-foreground mt-2">Select a service, pick a date and time, and you&apos;re all set.</p>
        </div>

        {/* Step indicator */}
        {step !== 'confirmed' && (
          <div className="flex items-center gap-2 mb-8 justify-center">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < stepIndex ? 'bg-[#6366f1] text-white' :
                  i === stepIndex ? 'bg-[#1e293b] text-white ring-2 ring-[#6366f1]' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i === stepIndex ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-px w-6 sm:w-12 ${i < stepIndex ? 'bg-[#6366f1]' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: Service ── */}
        {step === 'service' && (
          <div>
            <h2 className="font-display text-3xl tracking-wide mb-2">Choose a Service</h2>
            <p className="text-muted-foreground mb-6">Select what you&apos;d like done today.</p>
            {loadingServices ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1,2,3].map(i => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : services.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No services available right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setSelectedDate(''); setSelectedTime(''); setStep('date'); }}
                    className={`text-left p-5 rounded-xl border transition-all ${
                      selectedService?.id === s.id
                        ? 'border-[#6366f1] ring-2 ring-[#6366f1]'
                        : 'border-border hover:border-[#6366f1]/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-xl tracking-wide">{s.name}</p>
                        {s.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{s.duration} min</p>
                      </div>
                      <p className="text-2xl font-bold text-[#6366f1] shrink-0">{formatPrice(s.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Date ── */}
        {step === 'date' && (
          <div>
            <h2 className="font-display text-3xl tracking-wide mb-2">Pick a Date</h2>
            <p className="text-muted-foreground mb-6">Select an available date for your appointment.</p>

            <div className="bg-card border border-border rounded-xl p-4 inline-block w-full max-w-sm mx-auto">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  ‹
                </button>
                <span className="font-semibold text-sm">
                  {calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {getCalendarDays().map((cell, i) => {
                  if (cell.date.getTime() === 0) return <div key={i} />;
                  const ds = formatDateStr(cell.date);
                  const isSelected = ds === selectedDate;
                  return (
                    <button
                      key={i}
                      disabled={cell.disabled}
                      onClick={() => { setSelectedDate(ds); setStep('time'); }}
                      className={`aspect-square rounded-md text-sm font-medium transition-colors ${
                        cell.disabled ? 'text-muted-foreground/30 cursor-not-allowed' :
                        isSelected ? 'bg-[#6366f1] text-white' :
                        'hover:bg-muted'
                      }`}
                    >
                      {cell.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                ‹ Back
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Time ── */}
        {step === 'time' && (
          <div>
            <h2 className="font-display text-3xl tracking-wide mb-2">Choose a Time</h2>
            <p className="text-muted-foreground mb-6">{formatDateDisplay(selectedDate)}</p>

            {loadingSlots ? (
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
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 px-3 rounded-md text-sm font-medium border transition-all ${
                      selectedTime === slot
                        ? 'bg-[#6366f1] text-white border-[#6366f1]'
                        : 'bg-card border-border hover:border-[#6366f1] hover:text-[#6366f1]'
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('date')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 border border-border rounded-lg">
                ‹ Back
              </button>
              <button
                disabled={!selectedTime}
                onClick={() => setStep('details')}
                className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Details ── */}
        {step === 'details' && (
          <div>
            <h2 className="font-display text-3xl tracking-wide mb-2">Your Details</h2>
            <p className="text-muted-foreground mb-6">Almost done — just fill in your info.</p>

            {/* Summary */}
            <div className="bg-[#1e293b] text-white rounded-lg p-4 mb-6 text-sm grid grid-cols-2 gap-2">
              <div><p className="text-gray-400 text-xs">Service</p><p className="font-medium">{selectedService?.name}</p></div>
              <div><p className="text-gray-400 text-xs">Price</p><p className="font-medium text-[#6366f1]">{selectedService ? formatPrice(selectedService.price) : ''}</p></div>
              <div><p className="text-gray-400 text-xs">Date</p><p className="font-medium">{formatDateDisplay(selectedDate)}</p></div>
              <div><p className="text-gray-400 text-xs">Time</p><p className="font-medium">{formatTime(selectedTime)}</p></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any preferences or notes for Ozzy..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#6366f1] resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('time')}
                  className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ‹ Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-40 text-white font-semibold rounded-lg py-2 transition-colors"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 5: Confirmed ── */}
        {step === 'confirmed' && (
          <div className="text-center max-w-sm mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6366f1]/10 mb-6">
              <svg className="w-10 h-10 text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="font-display text-4xl tracking-wide mb-2">You&apos;re Booked!</h2>
            <p className="text-muted-foreground mb-8">A confirmation has been sent to <strong>{email}</strong></p>

            <div className="bg-[#1e293b] text-white rounded-xl p-6 mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Confirmation Code</p>
              <p className="text-3xl font-bold tracking-widest text-[#6366f1]">{confirmationCode}</p>
            </div>

            <div className="bg-muted rounded-xl p-5 text-left mb-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-[#6366f1]">{selectedService ? formatPrice(selectedService.price) : ''}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              Need to cancel? Please contact us at least 24 hours before your appointment.
            </p>

            <Link
              href="/"
              className="inline-block bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
