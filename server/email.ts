import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  return new Resend(apiKey);
}

const BRAND = {
  name: "Ravindrra Vastra Niketan",
  navy: "#1a1a2e",
  gold: "#C9A961",
  white: "#FFFFFF",
  cream: "#FAF7F2",
  warmGray: "#f5f0eb",
  darkText: "#1a1a1a",
  bodyText: "#4a4a4a",
  mutedText: "#8a8a8a",
  emerald: "#0d9465",
  emeraldLight: "#ecfdf3",
  red: "#dc2626",
  redLight: "#fef2f2",
  amber: "#d97706",
  amberLight: "#fffbeb",
  blue: "#2563eb",
  blueLight: "#eff6ff",
};

const APP_URL = process.env.APP_URL || "https://ravindrra-vastra-niketan.replit.app";
const LOGO_URL = "https://cdn.discordapp.com/attachments/1421094631709343754/1478722381005717505/rvnlogo.png?ex=69a96f08&is=69a81d88&hm=52bbf3bd1d13d11708d3b5cfc564587ae3826049fbdebf77639eb90fcc14e0e9";

function premiumLayout(content: string, previewText: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { margin:0; padding:0; background:#f0ece6; font-family:'Inter',Helvetica,Arial,sans-serif; -webkit-text-size-adjust:none; }
    .preview { display:none; max-height:0; overflow:hidden; mso-hide:all; }
    @media (max-width:680px) {
      .email-wrap { width:100% !important; }
      .mob-pad { padding-left:20px !important; padding-right:20px !important; }
      .mob-stack { display:block !important; width:100% !important; padding:8px 0 !important; }
      .mob-heading { font-size:26px !important; }
      .mob-hide { display:none !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f0ece6;">
  <div class="preview">${previewText}</div>
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f0ece6;">
    <tr><td align="center" style="padding:30px 10px;">
      <table class="email-wrap" width="620" border="0" cellpadding="0" cellspacing="0" style="max-width:620px; width:100%; margin:0 auto;">

        <tr>
          <td style="padding:0 0 24px; text-align:center;">
            <img src="${LOGO_URL}" width="160" height="auto" alt="${BRAND.name}" style="display:inline-block;" />
          </td>
        </tr>

        <tr>
          <td>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              ${content}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 0 0;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:${BRAND.navy}; border-radius:16px; overflow:hidden;">
              <tr>
                <td style="padding:28px 36px 20px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family:'Playfair Display',Georgia,serif; font-size:15px; font-weight:700; letter-spacing:1px; color:${BRAND.gold}; line-height:1.5;">
                        CRAFTED WITH TRADITION<br/>SINCE 1963
                      </td>
                      <td style="text-align:right; vertical-align:middle;">
                        <a href="https://www.instagram.com/ravindrra_vastra_niketan/" style="display:inline-block; margin:0 3px;"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-white/instagram@2x.png" width="24" height="auto" alt="Instagram" style="display:inline-block;" /></a>
                        <a href="https://www.facebook.com/" style="display:inline-block; margin:0 3px;"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-white/facebook@2x.png" width="24" height="auto" alt="Facebook" style="display:inline-block;" /></a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 36px;"><div style="border-top:1px solid #2a2a42;"></div></td>
              </tr>
              <tr>
                <td style="padding:18px 36px;">
                  <p style="margin:0; font-size:13px; color:#b0b0c0; line-height:1.5;">
                    Need help? Email us at <a href="mailto:support@ravindrra.com" style="color:${BRAND.gold}; text-decoration:none;">support@ravindrra.com</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 36px;"><div style="border-top:1px solid #2a2a42;"></div></td>
              </tr>
              <tr>
                <td style="padding:16px 36px 24px; text-align:center;">
                  <p style="margin:0; font-size:11px; color:#6a6a80;">
                    &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function accentButton(text: string, href: string, color: string = BRAND.emerald) {
  return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
    <tr>
      <td style="border-radius:8px; background:${color};" align="center">
        <a href="${href}" target="_blank" style="display:inline-block; padding:14px 40px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; letter-spacing:0.8px; text-transform:uppercase;">${text}</a>
      </td>
    </tr>
  </table>`;
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
  paymentStatus?: string;
}

function buildItemsBlock(items: any[]) {
  return items.map(item => `
    <tr>
      <td style="padding:14px 0; border-bottom:1px solid #f0ece6;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td width="72" style="vertical-align:top;">
              ${item.imageUrl
                ? `<img src="${item.imageUrl}" width="64" height="64" style="display:block; border-radius:10px; object-fit:cover; border:1px solid #f0ece6;" alt="${item.name}" />`
                : `<div style="width:64px;height:64px;background:${BRAND.cream};border-radius:10px;border:1px solid #e8e0d6;"></div>`}
            </td>
            <td style="vertical-align:top; padding-left:4px;">
              <p style="margin:0 0 3px; font-size:14px; font-weight:600; color:${BRAND.darkText};">${item.name}</p>
              <p style="margin:0; font-size:12px; color:${BRAND.mutedText};">
                Qty: ${item.quantity || 1}${item.size ? ` &middot; Size: ${item.size}` : ''}${item.color ? ` &middot; ${item.color}` : ''}
              </p>
            </td>
            <td style="vertical-align:top; text-align:right; white-space:nowrap;">
              <p style="margin:0; font-size:14px; font-weight:700; color:${BRAND.darkText};">${formatCurrency(Number(item.price) * (item.quantity || 1))}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');
}

function buildTotalsBlock(items: any[], deliveryCharge: number | string, totalAmount: number | string) {
  const subtotal = items.reduce((sum: number, i: any) => sum + Number(i.price) * (i.quantity || 1), 0);
  const delivery = Number(deliveryCharge || 0);
  return `
    <tr>
      <td style="padding:12px 0 4px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px; color:${BRAND.mutedText}; padding:3px 0;">Subtotal</td>
            <td style="font-size:13px; color:${BRAND.mutedText}; padding:3px 0; text-align:right;">${formatCurrency(subtotal)}</td>
          </tr>
          <tr>
            <td style="font-size:13px; color:${BRAND.mutedText}; padding:3px 0;">Shipping</td>
            <td style="font-size:13px; color:${delivery > 0 ? BRAND.mutedText : BRAND.emerald}; padding:3px 0; text-align:right; font-weight:${delivery > 0 ? '400' : '600'};">${delivery > 0 ? formatCurrency(delivery) : 'FREE'}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 0 0;">
        <div style="border-top:2px solid ${BRAND.darkText};"></div>
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:16px; font-weight:800; color:${BRAND.darkText}; padding:12px 0;">Total</td>
            <td style="font-size:16px; font-weight:800; color:${BRAND.darkText}; padding:12px 0; text-align:right;">${formatCurrency(totalAmount)}</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildAddressBlock(addr: any, orderId: number, orderDate: Date | string, waybill?: string | null) {
  return `
    <tr>
      <td style="padding:20px 0 0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="mob-stack" width="50%" style="vertical-align:top; padding-right:16px;">
              <p style="margin:0 0 6px; font-size:11px; font-weight:700; color:${BRAND.mutedText}; text-transform:uppercase; letter-spacing:1px;">Ship To</p>
              <p style="margin:0; font-size:13px; color:${BRAND.bodyText}; line-height:1.6;">
                ${addr?.fullName || ''}<br/>
                ${addr?.addressLine1 || addr?.address || ''}${addr?.addressLine2 ? '<br/>' + addr.addressLine2 : ''}<br/>
                ${addr?.city || ''}, ${addr?.state || ''} ${addr?.pincode || ''}<br/>
                ${addr?.phone ? addr.phone : ''}
              </p>
            </td>
            <td class="mob-stack" width="50%" style="vertical-align:top;">
              <p style="margin:0 0 6px; font-size:11px; font-weight:700; color:${BRAND.mutedText}; text-transform:uppercase; letter-spacing:1px;">Order Details</p>
              <p style="margin:0; font-size:13px; color:${BRAND.bodyText}; line-height:1.6;">
                Order #${orderId}<br/>
                ${formatDate(orderDate || new Date())}
                ${waybill ? '<br/>AWB: ' + waybill : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export function buildOrderConfirmationEmail(order: OrderData) {
  const items = (Array.isArray(order.items) ? order.items : []) as any[];
  const addr = order.shippingAddress as any;

  const content = `
    <tr>
      <td style="padding:48px 40px 0; text-align:center;">
        <div style="width:64px; height:64px; border-radius:50%; background:${BRAND.emeraldLight}; display:inline-block; line-height:64px; text-align:center; margin-bottom:16px;">
          <span style="font-size:30px; color:${BRAND.emerald};">&#10003;</span>
        </div>
        <h1 class="mob-heading" style="margin:0; font-family:'Playfair Display',Georgia,serif; font-size:32px; font-weight:800; color:${BRAND.darkText}; line-height:1.2;">
          Order Confirmed
        </h1>
        <p style="margin:10px 0 0; font-size:14px; color:${BRAND.mutedText};">
          Order #${order.id} &middot; ${formatDate(order.createdAt || new Date())}
        </p>
      </td>
    </tr>

    <tr>
      <td class="mob-pad" style="padding:24px 40px 0; text-align:center;">
        <p style="margin:0 0 28px; font-size:15px; color:${BRAND.bodyText}; line-height:1.7;">
          Thank you for your order! We're preparing your items with care and will notify you once they're shipped.
        </p>
        ${accentButton('View My Order', `${APP_URL}/orders`)}
      </td>
    </tr>

    <tr><td style="padding:32px 40px 0;"><div style="border-top:1px solid #f0ece6;"></div></td></tr>

    <tr>
      <td class="mob-pad" style="padding:24px 40px 0;">
        <p style="margin:0 0 16px; font-family:'Playfair Display',Georgia,serif; font-size:20px; font-weight:700; color:${BRAND.darkText};">Your Items</p>
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          ${buildItemsBlock(items)}
          ${buildTotalsBlock(items, order.deliveryCharge || 0, order.totalAmount)}
        </table>
      </td>
    </tr>

    <tr><td style="padding:20px 40px 0;"><div style="border-top:1px solid #f0ece6;"></div></td></tr>

    <tr>
      <td class="mob-pad" style="padding:0 40px 40px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          ${buildAddressBlock(addr, order.id, order.createdAt || new Date())}
        </table>
      </td>
    </tr>
  `;

  return {
    subject: `Order Confirmed - #${order.id} | ${BRAND.name}`,
    html: premiumLayout(content, `Your order #${order.id} has been confirmed! Total: ${formatCurrency(order.totalAmount)}`),
  };
}

export function buildShippingUpdateEmail(order: OrderData, rawStatus: string, trackingUrl?: string | null, waybill?: string | null) {
  const status = rawStatus.toLowerCase().trim();
  const statusConfig: Record<string, { label: string; heading: string; message: string; accentColor: string; accentBg: string; icon: string }> = {
    confirmed: {
      label: "Confirmed",
      heading: "Your Order Will Be Shipped Soon",
      message: "We have received your order and are preparing it for shipment. You'll be notified once it's on its way.",
      accentColor: BRAND.emerald,
      accentBg: BRAND.emeraldLight,
      icon: "&#10003;",
    },
    shipped: {
      label: "Shipped",
      heading: "Your Order Is On Its Way",
      message: "Great news! Your order has been shipped and is heading to you. Track your package below.",
      accentColor: BRAND.blue,
      accentBg: BRAND.blueLight,
      icon: "&#9992;",
    },
    delivered: {
      label: "Delivered",
      heading: "Your Order Has Been Delivered",
      message: "Your order has been delivered successfully. We hope you love your purchase!",
      accentColor: BRAND.emerald,
      accentBg: BRAND.emeraldLight,
      icon: "&#10003;",
    },
    cancelled: {
      label: "Cancelled",
      heading: "Your Order Has Been Cancelled",
      message: "Your order has been cancelled. If you have any questions, please don't hesitate to reach out to our support team.",
      accentColor: BRAND.red,
      accentBg: BRAND.redLight,
      icon: "&#10007;",
    },
  };

  const cfg = statusConfig[status] || {
    label: rawStatus,
    heading: `Order Update: ${rawStatus}`,
    message: `Your order status has been updated to: ${rawStatus}`,
    accentColor: BRAND.navy,
    accentBg: BRAND.cream,
    icon: "&#9679;",
  };

  const confirmedDone = ["confirmed", "shipped", "delivered"].includes(status);
  const shippedDone = ["shipped", "delivered"].includes(status);
  const deliveredDone = status === "delivered";

  const stepDot = (done: boolean) => done ? BRAND.emerald : "#d4d4d4";
  const stepLine = (done: boolean) => done ? BRAND.emerald : "#e5e5e5";
  const stepTextColor = (done: boolean) => done ? BRAND.darkText : "#b0b0b0";
  const stepTextWeight = (done: boolean) => done ? "700" : "400";

  const items = (Array.isArray(order.items) ? order.items : []) as any[];
  const addr = order.shippingAddress as any;

  const progressBar = status !== "cancelled" ? `
    <tr>
      <td class="mob-pad" style="padding:28px 40px 0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td width="28%" style="text-align:center; vertical-align:top;">
              <div style="width:20px; height:20px; border-radius:50%; background:${stepDot(confirmedDone)}; margin:0 auto 8px; ${confirmedDone ? 'box-shadow:0 0 0 4px ' + BRAND.emeraldLight + ';' : ''}"></div>
              <p style="margin:0; font-size:12px; font-weight:${stepTextWeight(confirmedDone)}; color:${stepTextColor(confirmedDone)};">Confirmed</p>
            </td>
            <td width="22%" style="vertical-align:top; padding-top:9px;">
              <div style="height:3px; background:${stepLine(shippedDone)}; border-radius:2px; margin:0 2px;"></div>
            </td>
            <td width="22%" style="text-align:center; vertical-align:top;">
              <div style="width:20px; height:20px; border-radius:50%; background:${stepDot(shippedDone)}; margin:0 auto 8px; ${shippedDone ? 'box-shadow:0 0 0 4px ' + BRAND.emeraldLight + ';' : ''}"></div>
              <p style="margin:0; font-size:12px; font-weight:${stepTextWeight(shippedDone)}; color:${stepTextColor(shippedDone)};">Shipped</p>
            </td>
            <td width="22%" style="vertical-align:top; padding-top:9px;">
              <div style="height:3px; background:${stepLine(deliveredDone)}; border-radius:2px; margin:0 2px;"></div>
            </td>
            <td width="28%" style="text-align:center; vertical-align:top;">
              <div style="width:20px; height:20px; border-radius:50%; background:${stepDot(deliveredDone)}; margin:0 auto 8px; ${deliveredDone ? 'box-shadow:0 0 0 4px ' + BRAND.emeraldLight + ';' : ''}"></div>
              <p style="margin:0; font-size:12px; font-weight:${stepTextWeight(deliveredDone)}; color:${stepTextColor(deliveredDone)};">Delivered</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';

  const trackSection = trackingUrl ? `
    <tr>
      <td style="padding:24px 40px 0; text-align:center;">
        ${accentButton('Track Your Order', trackingUrl, BRAND.blue)}
        ${waybill ? `<p style="margin:10px 0 0; font-size:12px; color:${BRAND.mutedText};">AWB: ${waybill}</p>` : ''}
      </td>
    </tr>` : '';

  const content = `
    <tr>
      <td style="padding:48px 40px 0; text-align:center;">
        <div style="width:64px; height:64px; border-radius:50%; background:${cfg.accentBg}; display:inline-block; line-height:64px; text-align:center; margin-bottom:16px;">
          <span style="font-size:28px; color:${cfg.accentColor};">${cfg.icon}</span>
        </div>
        <h1 class="mob-heading" style="margin:0; font-family:'Playfair Display',Georgia,serif; font-size:30px; font-weight:800; color:${BRAND.darkText}; line-height:1.2;">
          ${cfg.heading}
        </h1>
        <p style="margin:10px 0 0; font-size:14px; color:${BRAND.mutedText};">Order #${order.id}</p>
      </td>
    </tr>

    ${progressBar}

    <tr>
      <td class="mob-pad" style="padding:24px 40px 0; text-align:center;">
        <p style="margin:0 0 24px; font-size:15px; color:${BRAND.bodyText}; line-height:1.7;">${cfg.message}</p>
        ${accentButton('View My Order', `${APP_URL}/orders`)}
      </td>
    </tr>

    ${trackSection}

    <tr><td style="padding:32px 40px 0;"><div style="border-top:1px solid #f0ece6;"></div></td></tr>

    <tr>
      <td class="mob-pad" style="padding:24px 40px 0;">
        <p style="margin:0 0 4px; font-family:'Playfair Display',Georgia,serif; font-size:20px; font-weight:700; color:${BRAND.darkText};">Order Summary</p>
        <p style="margin:0 0 16px; font-size:13px; font-weight:600; color:${BRAND.gold};">Order #${order.id}</p>
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          ${buildItemsBlock(items)}
          ${buildTotalsBlock(items, order.deliveryCharge || 0, order.totalAmount)}
        </table>
      </td>
    </tr>

    <tr><td style="padding:20px 40px 0;"><div style="border-top:1px solid #f0ece6;"></div></td></tr>

    <tr>
      <td class="mob-pad" style="padding:0 40px 40px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          ${buildAddressBlock(addr, order.id, order.createdAt || new Date(), waybill)}
        </table>
      </td>
    </tr>
  `;

  return {
    subject: `Order ${cfg.label} - #${order.id} | ${BRAND.name}`,
    html: premiumLayout(content, `Your order #${order.id} is now ${cfg.label.toLowerCase()}.`),
  };
}

export function buildPromotionalEmail(subject: string, heading: string, body: string, ctaText?: string, ctaUrl?: string) {
  const content = `
    <tr>
      <td style="padding:48px 40px 0; text-align:center;">
        <h1 class="mob-heading" style="margin:0; font-family:'Playfair Display',Georgia,serif; font-size:30px; font-weight:800; color:${BRAND.darkText}; line-height:1.3;">
          ${heading}
        </h1>
      </td>
    </tr>
    <tr>
      <td class="mob-pad" style="padding:20px 40px 40px;">
        <div style="font-size:15px; color:${BRAND.bodyText}; line-height:1.8;">
          ${body}
        </div>
        ${ctaText && ctaUrl ? `<div style="text-align:center; padding-top:28px;">${accentButton(ctaText, ctaUrl, BRAND.gold)}</div>` : ''}
      </td>
    </tr>
  `;

  return {
    subject: `${subject} | ${BRAND.name}`,
    html: premiumLayout(content, subject),
  };
}

const FROM_TRANSACTIONAL = `${BRAND.name} <care.customer@ravindrra.com>`;
const FROM_CAMPAIGN = `${BRAND.name} <no-reply@ravindrra.com>`;
const FROM_AUTH = `${BRAND.name} <auth@ravindrra.com>`;
const REPLY_TO = "support@ravindrra.com";

export async function sendEmail(to: string, subject: string, html: string, from?: string) {
  try {
    const client = getResendClient();
    const result = await client.emails.send({
      from: from || FROM_TRANSACTIONAL,
      to,
      subject,
      html,
      replyTo: REPLY_TO,
    });
    console.log(`Email sent to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    return null;
  }
}

export function buildOtpEmail(otp: string) {
  const content = `
    <tr>
      <td style="padding:48px 40px 0; text-align:center;">
        <div style="width:64px; height:64px; border-radius:50%; background:${BRAND.amberLight}; display:inline-block; line-height:64px; text-align:center; margin-bottom:16px;">
          <span style="font-size:28px; color:${BRAND.amber};">&#128274;</span>
        </div>
        <h1 class="mob-heading" style="margin:0; font-family:'Playfair Display',Georgia,serif; font-size:30px; font-weight:800; color:${BRAND.darkText}; line-height:1.2;">
          Verify Your Email
        </h1>
        <p style="margin:12px 0 0; font-size:14px; color:${BRAND.mutedText}; line-height:1.5;">
          Enter the code below to verify your email address
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px; text-align:center;">
        <div style="display:inline-block; background:${BRAND.cream}; border:2px solid ${BRAND.gold}; border-radius:12px; padding:24px 48px;">
          <span style="font-size:40px; font-weight:800; letter-spacing:10px; color:${BRAND.darkText}; font-family:'Inter',monospace;">${otp}</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 48px; text-align:center;">
        <p style="margin:0; font-size:14px; color:${BRAND.bodyText}; line-height:1.6;">
          This code expires in <strong>10 minutes</strong>.<br/>
          If you didn't create an account, you can safely ignore this email.
        </p>
      </td>
    </tr>
  `;

  return {
    subject: `Your Verification Code - ${BRAND.name}`,
    html: premiumLayout(content, `Your verification code is ${otp}`),
  };
}

export async function sendOtpEmail(email: string, otp: string) {
  const { subject, html } = buildOtpEmail(otp);
  return sendEmail(email, subject, html, FROM_AUTH);
}

export function buildPasswordResetEmail(resetUrl: string) {
  const content = `
    <tr>
      <td style="padding:48px 40px 0; text-align:center;">
        <div style="width:64px; height:64px; border-radius:50%; background:${BRAND.blueLight}; display:inline-block; line-height:64px; text-align:center; margin-bottom:16px;">
          <span style="font-size:28px; color:${BRAND.blue};">&#128273;</span>
        </div>
        <h1 class="mob-heading" style="margin:0; font-family:'Playfair Display',Georgia,serif; font-size:30px; font-weight:800; color:${BRAND.darkText}; line-height:1.2;">
          Reset Your Password
        </h1>
        <p style="margin:12px 0 0; font-size:14px; color:${BRAND.mutedText}; line-height:1.5;">
          Click the button below to set a new password for your account
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px; text-align:center;">
        ${accentButton('Reset Password', resetUrl, BRAND.navy)}
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 48px; text-align:center;">
        <p style="margin:0; font-size:14px; color:${BRAND.bodyText}; line-height:1.6;">
          This link expires in <strong>1 hour</strong>.<br/>
          If you didn't request this, you can safely ignore this email.
        </p>
      </td>
    </tr>
  `;

  return {
    subject: `Reset Your Password - ${BRAND.name}`,
    html: premiumLayout(content, `Reset your password for ${BRAND.name}`),
  };
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { subject, html } = buildPasswordResetEmail(resetUrl);
  return sendEmail(email, subject, html, FROM_AUTH);
}


export function buildReturnRequestEmail(orderId: number, status: string, adminNotes?: string | null) {
  const statusConfig: Record<string, { label: string; accentColor: string; accentBg: string; icon: string; message: string }> = {
    pending: {
      label: "Received",
      accentColor: BRAND.amber,
      accentBg: BRAND.amberLight,
      icon: "&#128230;",
      message: "We have received your return request and will review it shortly. You will be notified once it is processed.",
    },
    approved: {
      label: "Approved",
      accentColor: BRAND.emerald,
      accentBg: BRAND.emeraldLight,
      icon: "&#10003;",
      message: "Your return request has been approved. Please ship the item(s) back within 3 days. Once received and inspected, your refund will be processed within 5-7 business days.",
    },
    rejected: {
      label: "Rejected",
      accentColor: BRAND.red,
      accentBg: BRAND.redLight,
      icon: "&#10007;",
      message: "Unfortunately, your return request has been declined. Please contact our support team if you have any questions.",
    },
  };

  const cfg = statusConfig[status] || statusConfig.pending;

  const notesBlock = adminNotes ? `
    <tr>
      <td class="mob-pad" style="padding:0 40px 20px;">
        <div style="background:${BRAND.cream}; border-radius:10px; padding:16px 20px; border-left:4px solid ${cfg.accentColor};">
          <p style="margin:0 0 4px; font-size:11px; font-weight:700; color:${BRAND.mutedText}; text-transform:uppercase; letter-spacing:1px;">Note from our team</p>
          <p style="margin:0; font-size:14px; color:${BRAND.bodyText}; line-height:1.6;">${adminNotes}</p>
        </div>
      </td>
    </tr>` : '';

  const content = `
    <tr>
      <td style="padding:48px 40px 0; text-align:center;">
        <div style="width:64px; height:64px; border-radius:50%; background:${cfg.accentBg}; display:inline-block; line-height:64px; text-align:center; margin-bottom:16px;">
          <span style="font-size:28px; color:${cfg.accentColor};">${cfg.icon}</span>
        </div>
        <h1 class="mob-heading" style="margin:0; font-family:'Playfair Display',Georgia,serif; font-size:28px; font-weight:800; color:${BRAND.darkText}; line-height:1.2;">
          Return Request ${cfg.label}
        </h1>
        <p style="margin:10px 0 0; font-size:14px; color:${BRAND.mutedText};">Order #${orderId}</p>
      </td>
    </tr>
    <tr>
      <td class="mob-pad" style="padding:24px 40px;">
        <p style="margin:0; font-size:15px; color:${BRAND.bodyText}; line-height:1.7; text-align:center;">${cfg.message}</p>
      </td>
    </tr>
    ${notesBlock}
    <tr>
      <td class="mob-pad" style="padding:0 40px 40px;">
        <div style="background:${BRAND.cream}; border-radius:10px; padding:16px 20px;">
          <p style="margin:0; font-size:13px; color:${BRAND.bodyText}; line-height:1.6;">
            <strong style="color:${BRAND.darkText};">Return Policy:</strong> Items must be unused, in original packaging, with unboxing video proof. Returns accepted within 2 days of delivery for damage only. Refunds processed within 5-7 business days.
          </p>
        </div>
      </td>
    </tr>
  `;

  return {
    subject: `Return Request ${cfg.label} - Order #${orderId} | ${BRAND.name}`,
    html: premiumLayout(content, `Your return request for order #${orderId} is ${cfg.label.toLowerCase()}.`),
  };
}

export async function sendReturnRequestEmail(email: string, orderId: number, status: string, adminNotes?: string | null) {
  const { subject, html } = buildReturnRequestEmail(orderId, status, adminNotes);
  return sendEmail(email, subject, html);
}

export async function sendOrderConfirmation(email: string, order: OrderData) {
  const { subject, html } = buildOrderConfirmationEmail(order);
  return sendEmail(email, subject, html);
}

export async function sendAdminOrderNotification(adminEmails: string[], order: OrderData) {
  if (!adminEmails.length) return;
  const items = (order.items || []) as any[];
  const addr = order.shippingAddress as any;

  const itemsList = items.map((item: any) => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #f0ece6;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px; color:${BRAND.darkText}; font-weight:500;">
              ${item.name}${item.size ? ` <span style="color:${BRAND.mutedText};">(${item.size})</span>` : ""}${item.color ? ` <span style="color:${BRAND.mutedText};">&middot; ${item.color}</span>` : ""}
            </td>
            <td style="font-size:13px; color:${BRAND.mutedText}; text-align:right; white-space:nowrap; width:40px;">x${item.quantity}</td>
            <td style="font-size:13px; color:${BRAND.darkText}; text-align:right; font-weight:600; white-space:nowrap; width:90px;">${formatCurrency(Number(item.price) * item.quantity)}</td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const ps = order.paymentStatus || "pending";
  const paymentLabel = ps === "paid" ? "Paid" : ps === "cod" ? "Cash on Delivery" : "Pending";
  const paymentColor = ps === "paid" ? BRAND.emerald : ps === "cod" ? BRAND.blue : BRAND.amber;

  const content = `
    <tr>
      <td style="padding:40px 40px 0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 4px; font-family:'Playfair Display',Georgia,serif; font-size:24px; font-weight:800; color:${BRAND.darkText};">New Order Received</p>
              <p style="margin:0; font-size:14px; color:${BRAND.mutedText};">Order <strong style="color:${BRAND.darkText};">#${order.id}</strong> &middot; ${formatDate(order.createdAt || new Date())}</p>
            </td>
            <td style="text-align:right; vertical-align:top;">
              <div style="display:inline-block; background:${paymentColor}; color:#fff; font-size:11px; font-weight:700; padding:5px 14px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">${paymentLabel}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td class="mob-pad" style="padding:20px 40px 0;">
        <div style="background:${BRAND.cream}; border-radius:10px; padding:16px 20px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td class="mob-stack" width="50%" style="vertical-align:top; padding-right:12px;">
                <p style="margin:0 0 4px; font-size:11px; font-weight:700; color:${BRAND.mutedText}; text-transform:uppercase; letter-spacing:1px;">Customer</p>
                <p style="margin:0; font-size:14px; font-weight:600; color:${BRAND.darkText};">${addr?.fullName || "—"}</p>
                <p style="margin:2px 0 0; font-size:13px; color:${BRAND.mutedText};">${addr?.phone || ""}</p>
              </td>
              <td class="mob-stack" width="50%" style="vertical-align:top;">
                <p style="margin:0 0 4px; font-size:11px; font-weight:700; color:${BRAND.mutedText}; text-transform:uppercase; letter-spacing:1px;">Ship To</p>
                <p style="margin:0; font-size:13px; color:${BRAND.bodyText}; line-height:1.5;">${addr?.addressLine1 || addr?.address || ""}${addr?.city ? `, ${addr.city}` : ""}${addr?.state ? `, ${addr.state}` : ""}${addr?.pincode ? ` - ${addr.pincode}` : ""}</p>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <tr>
      <td class="mob-pad" style="padding:20px 40px 0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          ${itemsList}
        </table>
        <div style="border-top:2px solid ${BRAND.darkText}; margin-top:8px;"></div>
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:12px 0; font-size:18px; font-weight:800; color:${BRAND.darkText};">Total</td>
            <td style="padding:12px 0; font-size:18px; font-weight:800; color:${BRAND.darkText}; text-align:right;">${formatCurrency(order.totalAmount)}</td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:20px 40px 40px; text-align:center;">
        ${accentButton('View in Admin Panel', `${APP_URL}/admin`, BRAND.navy)}
      </td>
    </tr>
  `;

  const html = premiumLayout(content, `New order #${order.id} — ${formatCurrency(order.totalAmount)}`);
  const subject = `New Order #${order.id} — ${formatCurrency(order.totalAmount)} | ${BRAND.name}`;

  for (const email of adminEmails) {
    sendEmail(email, subject, html).catch(err => console.error("Admin order email error:", err));
  }
}

export async function sendShippingUpdate(email: string, order: OrderData, status: string, trackingUrl?: string | null, waybill?: string | null) {
  const { subject, html } = buildShippingUpdateEmail(order, status, trackingUrl, waybill);
  return sendEmail(email, subject, html);
}

export async function sendPromotionalEmail(to: string[], subject: string, heading: string, body: string, ctaText?: string, ctaUrl?: string) {
  const { subject: fullSubject, html } = buildPromotionalEmail(subject, heading, body, ctaText, ctaUrl);
  const results = [];
  for (const email of to) {
    const result = await sendEmail(email, fullSubject, html, FROM_CAMPAIGN);
    results.push({ email, result });
  }
  return results;
}
