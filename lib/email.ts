import { Resend } from 'resend';
import { businessConfig } from '@/config/business.config';
import { formatDate, formatTime } from './booking-utils';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
}

const OZZY_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || businessConfig.contact.email;

interface BookingEmailData {
  customerName: string;
  email: string;
  confirmationCode: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  servicePrice: number;
  serviceDuration: number;
}

function customerHtml(data: BookingEmailData): string {
  const { currency } = businessConfig.booking;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
  .header{background:#1e293b;padding:32px;text-align:center}
  .header h1{color:#6366f1;margin:0;font-size:26px;letter-spacing:3px}
  .header p{color:#94a3b8;margin:6px 0 0;font-size:13px}
  .body{padding:32px}
  .body h2{color:#0f172a;font-size:20px;margin:0 0 8px}
  .body p{color:#475569;line-height:1.6;margin:0 0 16px;font-size:14px}
  .code{background:#f1f5f9;border:2px solid #6366f1;border-radius:8px;padding:16px;text-align:center;margin:24px 0}
  .code span{font-size:30px;font-weight:700;letter-spacing:5px;color:#1e293b}
  .details{background:#f8fafc;border-radius:8px;padding:20px;margin:16px 0}
  .details table{width:100%;border-collapse:collapse}
  .details td{padding:7px 0;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0}
  .details tr:last-child td{border-bottom:none}
  .details td:first-child{font-weight:600;width:40%;color:#1e293b}
  .footer{background:#1e293b;padding:20px 32px;text-align:center}
  .footer p{color:#64748b;font-size:12px;margin:4px 0}
</style></head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>${businessConfig.name.toUpperCase()}</h1>
      <p>Booking Confirmation</p>
    </div>
    <div class="body">
      <h2>You're booked in, ${data.customerName}! ✂️</h2>
      <p>Your appointment has been confirmed. See the details below and please arrive on time.</p>
      <div class="code">
        <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px">Your Confirmation Code</p>
        <span>${data.confirmationCode}</span>
      </div>
      <div class="details">
        <table>
          <tr><td>Service</td><td>${data.serviceName}</td></tr>
          <tr><td>Date</td><td>${formatDate(data.date)}</td></tr>
          <tr><td>Time</td><td>${formatTime(data.timeSlot)}</td></tr>
          <tr><td>Duration</td><td>${data.serviceDuration} mins</td></tr>
          <tr><td>Price</td><td>${currency}${data.servicePrice.toFixed(2)}</td></tr>
        </table>
      </div>
      <p style="font-size:13px;color:#94a3b8">Need to cancel? Please contact us at least ${businessConfig.booking.cancellationPolicyHours} hours before your appointment.</p>
      <p style="font-size:13px;color:#94a3b8">📞 ${businessConfig.contact.phone} &nbsp;|&nbsp; ✉️ ${businessConfig.contact.email}</p>
    </div>
    <div class="footer">
      <p>${businessConfig.name} · ${businessConfig.contact.address}</p>
    </div>
  </div>
</body>
</html>`;
}

function ozzyNotificationHtml(data: BookingEmailData): string {
  const { currency } = businessConfig.booking;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
  .header{background:#6366f1;padding:24px 32px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:20px;letter-spacing:1px}
  .body{padding:32px}
  .body p{color:#475569;line-height:1.6;margin:0 0 12px;font-size:14px}
  .details{background:#f8fafc;border-radius:8px;padding:20px;margin:16px 0}
  .details table{width:100%;border-collapse:collapse}
  .details td{padding:7px 0;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0}
  .details tr:last-child td{border-bottom:none}
  .details td:first-child{font-weight:600;width:40%;color:#1e293b}
</style></head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>📅 New Booking Received</h1>
    </div>
    <div class="body">
      <p>You have a new appointment booked through the website.</p>
      <div class="details">
        <table>
          <tr><td>Customer</td><td>${data.customerName}</td></tr>
          <tr><td>Email</td><td>${data.email}</td></tr>
          <tr><td>Service</td><td>${data.serviceName}</td></tr>
          <tr><td>Date</td><td>${formatDate(data.date)}</td></tr>
          <tr><td>Time</td><td>${formatTime(data.timeSlot)}</td></tr>
          <tr><td>Duration</td><td>${data.serviceDuration} mins</td></tr>
          <tr><td>Price</td><td>${currency}${data.servicePrice.toFixed(2)}</td></tr>
          <tr><td>Ref</td><td>${data.confirmationCode}</td></tr>
        </table>
      </div>
      <p style="font-size:13px;color:#94a3b8">Manage this booking in the admin panel.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendBookingConfirmation(data: BookingEmailData): Promise<void> {
  const resend = getResend();
  const from = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  await Promise.all([
    // Confirmation to customer
    resend.emails.send({
      from,
      to: data.email,
      subject: `Booking Confirmed — ${data.confirmationCode} | ${businessConfig.name}`,
      html: customerHtml(data),
    }),
    // Notification to Ozzy
    resend.emails.send({
      from,
      to: OZZY_EMAIL,
      subject: `New Booking: ${data.customerName} — ${formatDate(data.date)} at ${formatTime(data.timeSlot)}`,
      html: ozzyNotificationHtml(data),
    }),
  ]);
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  const from = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  await getResend().emails.send({
    from,
    to: OZZY_EMAIL,
    replyTo: data.email,
    subject: `New Contact Message from ${data.name}`,
    html: `
<p><strong>Name:</strong> ${data.name}</p>
<p><strong>Email:</strong> ${data.email}</p>
${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
<p><strong>Message:</strong><br>${data.message.replace(/\n/g, '<br>')}</p>
`,
  });
}
