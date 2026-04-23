import { Resend } from 'resend';
import { businessConfig } from '@/config/business.config';
import { formatDate, formatTime } from './booking-utils';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
}

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

export async function sendBookingConfirmation(data: BookingEmailData): Promise<void> {
  const { currency } = businessConfig.booking;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f9f6f1; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #0f0f0f; padding: 32px; text-align: center; }
    .header h1 { color: #6366f1; margin: 0; font-size: 28px; letter-spacing: 3px; font-family: Georgia, serif; }
    .header p { color: #aaa; margin: 8px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .body h2 { color: #0f0f0f; font-size: 20px; margin: 0 0 8px; }
    .body p { color: #444; line-height: 1.6; margin: 0 0 16px; }
    .code { background: #f9f6f1; border: 2px solid #6366f1; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0; }
    .code span { font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #0f0f0f; }
    .details { background: #f9f6f1; border-radius: 6px; padding: 20px; margin: 16px 0; }
    .details table { width: 100%; border-collapse: collapse; }
    .details td { padding: 6px 0; font-size: 14px; color: #333; }
    .details td:first-child { font-weight: 600; width: 40%; }
    .footer { background: #0f0f0f; padding: 20px 32px; text-align: center; }
    .footer p { color: #777; font-size: 12px; margin: 4px 0; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${businessConfig.name.toUpperCase()}</h1>
      <p>Booking Confirmation</p>
    </div>
    <div class="body">
      <h2>You're booked in, ${data.customerName}! ✂️</h2>
      <p>We've confirmed your appointment. See you soon!</p>
      <div class="code">
        <p style="margin:0 0 4px;font-size:12px;color:#777;text-transform:uppercase;letter-spacing:1px">Confirmation Code</p>
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
      <p style="font-size:13px;color:#777;">Need to cancel or reschedule? Please contact us at least ${businessConfig.booking.cancellationPolicyHours} hours before your appointment.</p>
      <p style="font-size:13px;color:#777;">📞 ${businessConfig.contact.phone} | ✉️ ${businessConfig.contact.email}</p>
    </div>
    <div class="footer">
      <p>${businessConfig.name} | ${businessConfig.contact.address}</p>
      <p><a href="tel:${businessConfig.contact.phone}">${businessConfig.contact.phone}</a></p>
    </div>
  </div>
</body>
</html>`;

  await getResend().emails.send({
    from: process.env.FROM_EMAIL || `noreply@${businessConfig.contact.email.split('@')[1]}`,
    to: data.email,
    subject: `Booking Confirmed — ${data.confirmationCode} | ${businessConfig.name}`,
    html,
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  await getResend().emails.send({
    from: process.env.FROM_EMAIL || `noreply@${businessConfig.contact.email.split('@')[1]}`,
    to: businessConfig.contact.email,
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
