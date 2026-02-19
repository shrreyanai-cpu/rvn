import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken,
      },
    },
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email,
  };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return { client: new Resend(apiKey), fromEmail };
}

const BRAND = {
  name: "Ravindrra Vastra Niketan",
  navy: "#2C3E50",
  gold: "#C9A961",
  white: "#FFFFFF",
  lightGold: "#F5EFE0",
  gray: "#6B7280",
};

function baseLayout(content: string, previewText: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .preview { display: none; max-height: 0; overflow: hidden; }
  </style>
</head>
<body>
  <div class="preview">${previewText}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:${BRAND.white}; border-radius:8px; overflow:hidden; max-width:600px; width:100%;">
        <tr>
          <td style="background:${BRAND.navy}; padding:24px 32px; text-align:center;">
            <h1 style="margin:0; color:${BRAND.gold}; font-size:24px; font-family:Georgia,'Times New Roman',serif; letter-spacing:1px;">${BRAND.name}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:${BRAND.lightGold}; padding:20px 32px; text-align:center; border-top:1px solid #e5e5e5;">
            <p style="margin:0; color:${BRAND.gray}; font-size:12px;">
              &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
            </p>
            <p style="margin:4px 0 0; color:${BRAND.gray}; font-size:12px;">
              Premium Indian Clothing &bull; Crafted with Tradition
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function formatCurrency(amount: number | string) {
  return `Rs. ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface OrderData {
  id: number;
  totalAmount: string | number;
  items: any[];
  shippingAddress: any;
  deliveryCharge?: string | number;
  createdAt?: Date | string;
}

export function buildOrderConfirmationEmail(order: OrderData) {
  const items = (Array.isArray(order.items) ? order.items : []) as any[];
  const addr = order.shippingAddress as any;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #f0f0f0;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" width="60" height="60" style="border-radius:4px; object-fit:cover;" alt="${item.name}" />` : ''}
          <div>
            <p style="margin:0; font-weight:600; color:${BRAND.navy};">${item.name}</p>
            <p style="margin:2px 0 0; color:${BRAND.gray}; font-size:13px;">
              Qty: ${item.quantity}${item.size ? ` | Size: ${item.size}` : ''}${item.color ? ` | Color: ${item.color}` : ''}
            </p>
          </div>
        </div>
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; text-align:right; vertical-align:top; font-weight:600; color:${BRAND.navy};">
        ${formatCurrency(Number(item.price) * (item.quantity || 1))}
      </td>
    </tr>
  `).join('');

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * (i.quantity || 1), 0);
  const delivery = Number(order.deliveryCharge || 0);

  const content = `
    <div style="text-align:center; margin-bottom:24px;">
      <div style="width:56px; height:56px; border-radius:50%; background:#E8F5E9; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <span style="font-size:28px; color:#4CAF50;">&#10003;</span>
      </div>
      <h2 style="margin:0; color:${BRAND.navy}; font-size:22px; font-family:Georgia,serif;">Order Confirmed!</h2>
      <p style="margin:8px 0 0; color:${BRAND.gray};">Order #${order.id} &bull; ${formatDate(order.createdAt || new Date())}</p>
    </div>

    <p style="color:#374151; line-height:1.6;">
      Thank you for your order! We're preparing your items with care and will notify you once they're shipped.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      ${itemsHtml}
      <tr>
        <td style="padding:8px 0; color:${BRAND.gray};">Subtotal</td>
        <td style="padding:8px 0; text-align:right; color:${BRAND.gray};">${formatCurrency(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:${BRAND.gray};">Delivery</td>
        <td style="padding:8px 0; text-align:right; color:${BRAND.gray};">${delivery > 0 ? formatCurrency(delivery) : 'FREE'}</td>
      </tr>
      <tr>
        <td style="padding:12px 0; border-top:2px solid ${BRAND.navy}; font-weight:700; color:${BRAND.navy}; font-size:16px;">Total</td>
        <td style="padding:12px 0; border-top:2px solid ${BRAND.navy}; text-align:right; font-weight:700; color:${BRAND.navy}; font-size:16px;">${formatCurrency(order.totalAmount)}</td>
      </tr>
    </table>

    <div style="background:${BRAND.lightGold}; border-radius:6px; padding:16px; margin:20px 0;">
      <h3 style="margin:0 0 8px; color:${BRAND.navy}; font-size:14px;">Shipping Address</h3>
      <p style="margin:0; color:#374151; font-size:14px; line-height:1.5;">
        ${addr?.fullName || ''}<br/>
        ${addr?.addressLine1 || ''}${addr?.addressLine2 ? '<br/>' + addr.addressLine2 : ''}<br/>
        ${addr?.city || ''}, ${addr?.state || ''} ${addr?.pincode || ''}<br/>
        Phone: ${addr?.phone || ''}
      </p>
    </div>
  `;

  return {
    subject: `Order Confirmed - #${order.id} | ${BRAND.name}`,
    html: baseLayout(content, `Your order #${order.id} has been confirmed! Total: ${formatCurrency(order.totalAmount)}`),
  };
}

export function buildShippingUpdateEmail(order: OrderData, status: string, trackingUrl?: string | null, waybill?: string | null) {
  const statusConfig: Record<string, { label: string; color: string; icon: string; message: string }> = {
    shipped: {
      label: "Shipped",
      color: "#2196F3",
      icon: "&#128230;",
      message: "Your order has been shipped and is on its way to you!",
    },
    delivered: {
      label: "Delivered",
      color: "#4CAF50",
      icon: "&#10003;",
      message: "Your order has been delivered. We hope you love your purchase!",
    },
    cancelled: {
      label: "Cancelled",
      color: "#F44336",
      icon: "&#10007;",
      message: "Your order has been cancelled. If you have any questions, please contact us.",
    },
    confirmed: {
      label: "Confirmed",
      color: "#FF9800",
      icon: "&#9733;",
      message: "Your order has been confirmed and is being processed.",
    },
  };

  const cfg = statusConfig[status] || { label: status, color: BRAND.navy, icon: "&#9679;", message: `Your order status has been updated to: ${status}` };

  const trackingSection = trackingUrl ? `
    <div style="text-align:center; margin:20px 0;">
      <a href="${trackingUrl}" style="display:inline-block; background:${BRAND.navy}; color:${BRAND.gold}; padding:12px 32px; border-radius:6px; text-decoration:none; font-weight:600; font-size:14px;">
        Track Your Order
      </a>
      ${waybill ? `<p style="margin:8px 0 0; color:${BRAND.gray}; font-size:12px;">Waybill: ${waybill}</p>` : ''}
    </div>
  ` : '';

  const content = `
    <div style="text-align:center; margin-bottom:24px;">
      <div style="width:56px; height:56px; border-radius:50%; background:${cfg.color}20; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <span style="font-size:28px; color:${cfg.color};">${cfg.icon}</span>
      </div>
      <h2 style="margin:0; color:${BRAND.navy}; font-size:22px; font-family:Georgia,serif;">Order ${cfg.label}</h2>
      <p style="margin:8px 0 0; color:${BRAND.gray};">Order #${order.id}</p>
    </div>

    <p style="color:#374151; line-height:1.6;">${cfg.message}</p>

    ${trackingSection}

    <div style="background:#f9fafb; border-radius:6px; padding:16px; margin:20px 0;">
      <h3 style="margin:0 0 8px; color:${BRAND.navy}; font-size:14px;">Order Summary</h3>
      <p style="margin:0; color:${BRAND.gray}; font-size:14px;">
        Total: <strong style="color:${BRAND.navy};">${formatCurrency(order.totalAmount)}</strong>
      </p>
    </div>
  `;

  return {
    subject: `Order ${cfg.label} - #${order.id} | ${BRAND.name}`,
    html: baseLayout(content, `Your order #${order.id} is now ${cfg.label.toLowerCase()}.`),
  };
}

export function buildPromotionalEmail(subject: string, heading: string, body: string, ctaText?: string, ctaUrl?: string) {
  const ctaSection = ctaText && ctaUrl ? `
    <div style="text-align:center; margin:28px 0;">
      <a href="${ctaUrl}" style="display:inline-block; background:${BRAND.navy}; color:${BRAND.gold}; padding:14px 40px; border-radius:6px; text-decoration:none; font-weight:600; font-size:15px; letter-spacing:0.5px;">
        ${ctaText}
      </a>
    </div>
  ` : '';

  const content = `
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="margin:0; color:${BRAND.navy}; font-size:24px; font-family:Georgia,serif;">${heading}</h2>
    </div>
    <div style="color:#374151; line-height:1.7; font-size:15px;">
      ${body}
    </div>
    ${ctaSection}
  `;

  return {
    subject: `${subject} | ${BRAND.name}`,
    html: baseLayout(content, subject),
  };
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    const result = await client.emails.send({
      from: fromEmail || `${BRAND.name} <onboarding@resend.dev>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    return null;
  }
}

export async function sendOrderConfirmation(email: string, order: OrderData) {
  const { subject, html } = buildOrderConfirmationEmail(order);
  return sendEmail(email, subject, html);
}

export async function sendShippingUpdate(email: string, order: OrderData, status: string, trackingUrl?: string | null, waybill?: string | null) {
  const { subject, html } = buildShippingUpdateEmail(order, status, trackingUrl, waybill);
  return sendEmail(email, subject, html);
}

export async function sendPromotionalEmail(to: string[], subject: string, heading: string, body: string, ctaText?: string, ctaUrl?: string) {
  const { subject: fullSubject, html } = buildPromotionalEmail(subject, heading, body, ctaText, ctaUrl);
  const results = [];
  for (const email of to) {
    const result = await sendEmail(email, fullSubject, html);
    results.push({ email, result });
  }
  return results;
}
