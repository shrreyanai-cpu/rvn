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

export function buildShippingUpdateEmail(order: OrderData, rawStatus: string, trackingUrl?: string | null, waybill?: string | null) {
  const status = rawStatus.toLowerCase().trim();
  const statusConfig: Record<string, { label: string; heading: string; message: string }> = {
    shipped: {
      label: "Shipped",
      heading: "YOUR ORDER HAS BEEN SHIPPED!",
      message: "Your order is on its way! You can track your package using the button below.",
    },
    delivered: {
      label: "Delivered",
      heading: "YOUR ORDER HAS BEEN DELIVERED!",
      message: "Your order has been delivered. We hope you love your purchase!",
    },
    cancelled: {
      label: "Cancelled",
      heading: "YOUR ORDER HAS BEEN CANCELLED",
      message: "Your order has been cancelled. If you have any questions, please contact our support team.",
    },
    confirmed: {
      label: "Confirmed",
      heading: "YOUR ORDER WILL BE SHIPPED SOON!",
      message: "We have received your order and are preparing it for shipment. You will be notified once it's on its way.",
    },
  };

  const cfg = statusConfig[status] || { label: status, heading: `ORDER ${status.toUpperCase()}`, message: `Your order status has been updated to: ${status}` };

  const confirmedActive = ["confirmed", "shipped", "delivered"].includes(status);
  const shippedActive = ["shipped", "delivered"].includes(status);
  const deliveredActive = status === "delivered";

  const stepColor = (active: boolean) => active ? "#C9A961" : "#e1cabf";
  const stepWeight = (active: boolean) => active ? "700" : "400";
  const lineColor = (active: boolean) => active ? "#C9A961" : "#e1cabf";

  const items = (Array.isArray(order.items) ? order.items : []) as any[];
  const addr = order.shippingAddress as any;

  const itemsHtml = items.map(item => `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr>
        <td width="100" style="vertical-align:top; padding-right:16px;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" width="100" height="100" style="display:block; border-radius:8px; object-fit:cover;" alt="${item.name}" />` : `<div style="width:100px;height:100px;background:#e1cabf;border-radius:8px;"></div>`}
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 4px; font-family:'Open Sans',Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; color:#000000;">${item.name}</p>
          <p style="margin:0 0 4px; font-family:'Open Sans',Helvetica,Arial,sans-serif; font-size:14px; color:#666666;">
            Qty: ${item.quantity || 1}${item.size ? ` &bull; Size: ${item.size}` : ''}${item.color ? ` &bull; Color: ${item.color}` : ''}
          </p>
          <p style="margin:0; font-family:'Open Sans',Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; color:#2C3E50;">
            ${formatCurrency(Number(item.price) * (item.quantity || 1))}
          </p>
        </td>
      </tr>
    </table>
  `).join('');

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * (i.quantity || 1), 0);
  const delivery = Number(order.deliveryCharge || 0);

  const appUrl = process.env.APP_URL || "https://ravindrra-vastra-niketan.replit.app";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { margin:0; padding:0; background:#ffffff; font-family:'Open Sans',Helvetica,Arial,sans-serif; }
    .preview { display:none; max-height:0; overflow:hidden; }
    @media (max-width:700px) {
      .email-container { width:100% !important; }
      .mobile-pad { padding:20px !important; }
      .heading-main { font-size:26px !important; }
      .step-label { font-size:12px !important; }
      .item-img { width:80px !important; height:80px !important; }
      .addr-col { display:block !important; width:100% !important; padding:10px 0 !important; }
    }
  </style>
</head>
<body>
  <div class="preview">Your order #${order.id} - ${cfg.label} | ${BRAND.name}</div>
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr><td align="center">
      <table class="email-container" width="680" border="0" cellpadding="0" cellspacing="0" style="max-width:680px; width:100%; margin:0 auto;">

        <!-- LOGO BAR -->
        <tr>
          <td style="background:#f7f1ed; border-radius:0 0 20px 20px; padding:20px; text-align:center;">
            <img src="https://cdn.discordapp.com/attachments/1421094631709343754/1478722381005717505/rvnlogo.png?ex=69a96f08&is=69a81d88&hm=52bbf3bd1d13d11708d3b5cfc564587ae3826049fbdebf77639eb90fcc14e0e9" width="180" height="auto" alt="${BRAND.name}" style="display:inline-block;" />
          </td>
        </tr>

        <!-- HEADING -->
        <tr>
          <td class="mobile-pad" style="padding:40px 60px 10px; text-align:center;">
            <h1 class="heading-main" style="margin:0; font-family:'Open Sans',Helvetica,Arial,sans-serif; font-size:36px; font-weight:800; letter-spacing:-1px; line-height:1.2; color:#000000;">
              ${cfg.heading}
            </h1>
          </td>
        </tr>

        <!-- PROGRESS BAR -->
        ${status !== "cancelled" ? `
        <tr>
          <td style="padding:20px 50px 10px;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td width="25%" style="text-align:center; vertical-align:top;">
                  <div style="width:16px; height:16px; border-radius:50%; background:${stepColor(confirmedActive)}; margin:0 auto 8px;"></div>
                  <p class="step-label" style="margin:0; font-size:14px; font-weight:${stepWeight(confirmedActive)}; color:${stepColor(confirmedActive)};">Confirmed</p>
                </td>
                <td width="16%" style="vertical-align:top; padding-top:7px;">
                  <div style="border-top:2px solid ${lineColor(shippedActive)}; margin:0 4px;"></div>
                </td>
                <td width="17%" style="text-align:center; vertical-align:top;">
                  <div style="width:16px; height:16px; border-radius:50%; background:${stepColor(shippedActive)}; margin:0 auto 8px;"></div>
                  <p class="step-label" style="margin:0; font-size:14px; font-weight:${stepWeight(shippedActive)}; color:${stepColor(shippedActive)};">Shipped</p>
                </td>
                <td width="16%" style="vertical-align:top; padding-top:7px;">
                  <div style="border-top:2px solid ${lineColor(deliveredActive)}; margin:0 4px;"></div>
                </td>
                <td width="25%" style="text-align:center; vertical-align:top;">
                  <div style="width:16px; height:16px; border-radius:50%; background:${stepColor(deliveredActive)}; margin:0 auto 8px;"></div>
                  <p class="step-label" style="margin:0; font-size:14px; font-weight:${stepWeight(deliveredActive)}; color:${stepColor(deliveredActive)};">Delivered</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- MESSAGE + VIEW ORDER BUTTON -->
        <tr>
          <td class="mobile-pad" style="padding:20px 60px 10px; text-align:center;">
            <p style="margin:0 0 24px; font-size:15px; color:#555555; line-height:1.6;">${cfg.message}</p>
            <a href="${appUrl}/orders" style="display:inline-block; background:${BRAND.gold}; color:#ffffff; padding:12px 36px; border-radius:30px; text-decoration:none; font-weight:700; font-size:16px; letter-spacing:1px;">VIEW MY ORDER</a>
          </td>
        </tr>

        <!-- ORDER DETAILS SECTION -->
        <tr>
          <td style="padding:40px 0 0;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f7f1ed; border-radius:20px 20px 0 0;">
              <tr>
                <td class="mobile-pad" style="padding:40px 50px 10px;">
                  <h2 style="margin:0 0 4px; font-size:26px; font-weight:800; letter-spacing:-1px; text-align:center; color:#000000;">WHAT'S IN YOUR ORDER?</h2>
                  <p style="margin:0; text-align:center; font-size:16px; font-weight:700; color:${BRAND.gold};">Order #${order.id}</p>
                  <div style="margin:20px 0; border-top:1px solid #000000;"></div>
                </td>
              </tr>
              <tr>
                <td class="mobile-pad" style="padding:0 50px 20px;">
                  ${itemsHtml}
                </td>
              </tr>
              <!-- TOTALS -->
              <tr>
                <td class="mobile-pad" style="padding:0 50px 10px;">
                  <div style="border-top:1px solid #ccbbaa; margin-bottom:12px;"></div>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0; font-size:14px; color:#666666;">Subtotal</td>
                      <td style="padding:4px 0; font-size:14px; color:#666666; text-align:right;">${formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; font-size:14px; color:#666666;">Delivery</td>
                      <td style="padding:4px 0; font-size:14px; color:#666666; text-align:right;">${delivery > 0 ? formatCurrency(delivery) : 'FREE'}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 0; border-top:2px solid #2C3E50; font-size:18px; font-weight:800; color:#000000;">Total</td>
                      <td style="padding:8px 0 0; border-top:2px solid #2C3E50; font-size:18px; font-weight:800; color:#000000; text-align:right;">${formatCurrency(order.totalAmount)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SHIPPING ADDRESS -->
        <tr>
          <td>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f7f1ed;">
              <tr>
                <td class="mobile-pad" style="padding:20px 50px 30px;">
                  <div style="border-top:1px solid #ccbbaa; margin-bottom:20px;"></div>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="addr-col" width="50%" style="vertical-align:top; padding-right:20px;">
                        <p style="margin:0 0 8px; font-size:18px; font-weight:800; color:#000000;">Shipping Address</p>
                        <p style="margin:0; font-size:14px; color:#444444; line-height:1.6;">
                          ${addr?.fullName || ''}<br/>
                          ${addr?.addressLine1 || addr?.address || ''}${addr?.addressLine2 ? '<br/>' + addr.addressLine2 : ''}<br/>
                          ${addr?.city || ''}, ${addr?.state || ''} ${addr?.pincode || ''}<br/>
                          ${addr?.phone ? 'Phone: ' + addr.phone : ''}
                        </p>
                      </td>
                      <td class="addr-col" width="50%" style="vertical-align:top;">
                        <p style="margin:0 0 8px; font-size:18px; font-weight:800; color:#000000;">Order Info</p>
                        <p style="margin:0; font-size:14px; color:#444444; line-height:1.6;">
                          Order #${order.id}<br/>
                          Date: ${formatDate(order.createdAt || new Date())}
                          ${waybill ? '<br/>Waybill: ' + waybill : ''}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TRACK ORDER BUTTON -->
        ${trackingUrl ? `
        <tr>
          <td style="background:#f7f1ed; border-radius:0 0 20px 20px; padding:10px 50px 40px; text-align:center;">
            <a href="${trackingUrl}" style="display:inline-block; background:${BRAND.gold}; color:#ffffff; padding:12px 36px; border-radius:30px; text-decoration:none; font-weight:700; font-size:16px; letter-spacing:1px;">TRACK YOUR ORDER</a>
            ${waybill ? `<p style="margin:10px 0 0; font-size:12px; color:#888888;">Waybill: ${waybill}</p>` : ''}
          </td>
        </tr>
        ` : `
        <tr>
          <td style="background:#f7f1ed; border-radius:0 0 20px 20px; padding:0 0 30px;">&nbsp;</td>
        </tr>
        `}

        <!-- SPACER -->
        <tr><td style="height:20px;"></td></tr>

        <!-- FOOTER -->
        <tr>
          <td>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#2C3E50; border-radius:20px 20px 0 0;">
              <tr>
                <td style="padding:30px 50px 20px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:14px; font-weight:700; letter-spacing:2px; color:#C9A961; line-height:1.4;">
                        CRAFTED WITH TRADITION<br/>SINCE 1963
                      </td>
                      <td style="text-align:right; vertical-align:top;">
                        <a href="https://www.instagram.com/ravindrra_vastra_niketan/" style="display:inline-block; margin:0 4px;"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-white/instagram@2x.png" width="28" height="auto" alt="Instagram" style="display:inline-block;" /></a>
                        <a href="https://www.facebook.com/" style="display:inline-block; margin:0 4px;"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-white/facebook@2x.png" width="28" height="auto" alt="Facebook" style="display:inline-block;" /></a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 50px;">
                  <div style="border-top:1px solid #3a5060;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 50px;">
                  <p style="margin:0 0 10px; font-size:15px; color:#ffffff; line-height:1.4;">
                    <strong>Have a question?</strong> We'd love to help. Email us at <a href="mailto:support@ravindrra.com" style="color:#C9A961; text-decoration:none;">support@ravindrra.com</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 50px;">
                  <div style="border-top:1px solid #3a5060;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 50px 30px;">
                  <p style="margin:0; font-size:12px; color:#8899aa; text-align:center;">
                    &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved. &bull; Premium Indian Clothing
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

  return {
    subject: `Order ${cfg.label} - #${order.id} | ${BRAND.name}`,
    html,
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

const FROM_TRANSACTIONAL = `${BRAND.name} <care.customer@ravindrra.com>`;
const FROM_CAMPAIGN = `${BRAND.name} <no-reply@ravindrra.com>`;
const FROM_AUTH = `${BRAND.name} <auth@ravindrra.com>`;
const REPLY_TO = "support@ravindrra.com";

export async function sendEmail(to: string, subject: string, html: string, from?: string) {
  try {
    const { client } = await getResendClient();
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
    <div style="text-align:center; margin-bottom:24px;">
      <h2 style="margin:0; color:${BRAND.navy}; font-size:22px; font-family:Georgia,serif;">Verify Your Email</h2>
      <p style="margin:8px 0 0; color:${BRAND.gray};">Use the code below to verify your email address</p>
    </div>

    <div style="text-align:center; margin:32px 0;">
      <div style="display:inline-block; background:${BRAND.lightGold}; border:2px dashed ${BRAND.gold}; border-radius:8px; padding:20px 40px;">
        <span style="font-size:36px; font-weight:700; letter-spacing:8px; color:${BRAND.navy}; font-family:monospace;">${otp}</span>
      </div>
    </div>

    <p style="color:#374151; line-height:1.6; text-align:center;">
      This code expires in <strong>10 minutes</strong>. If you didn't create an account with us, you can safely ignore this email.
    </p>
  `;

  return {
    subject: `Your Verification Code - ${BRAND.name}`,
    html: baseLayout(content, `Your verification code is ${otp}`),
  };
}

export async function sendOtpEmail(email: string, otp: string) {
  const { subject, html } = buildOtpEmail(otp);
  return sendEmail(email, subject, html, FROM_AUTH);
}

export function buildReturnRequestEmail(orderId: number, status: string, adminNotes?: string | null) {
  const statusConfig: Record<string, { label: string; color: string; icon: string; message: string }> = {
    pending: {
      label: "Received",
      color: "#FF9800",
      icon: "&#128230;",
      message: "We have received your return request and will review it shortly. You will be notified once it is processed.",
    },
    approved: {
      label: "Approved",
      color: "#4CAF50",
      icon: "&#10003;",
      message: "Your return request has been approved. Please ship the item(s) back within 3 days. Once received and inspected, your refund will be processed.",
    },
    rejected: {
      label: "Rejected",
      color: "#F44336",
      icon: "&#10007;",
      message: "Unfortunately, your return request has been declined. Please contact our support team if you have any questions.",
    },
  };

  const cfg = statusConfig[status] || statusConfig.pending;

  const notesSection = adminNotes ? `
    <div style="background:#f9fafb; border-radius:6px; padding:16px; margin:20px 0;">
      <h3 style="margin:0 0 8px; color:${BRAND.navy}; font-size:14px;">Notes from our team</h3>
      <p style="margin:0; color:${BRAND.gray}; font-size:14px;">${adminNotes}</p>
    </div>
  ` : '';

  const content = `
    <div style="text-align:center; margin-bottom:24px;">
      <div style="width:56px; height:56px; border-radius:50%; background:${cfg.color}20; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <span style="font-size:28px; color:${cfg.color};">${cfg.icon}</span>
      </div>
      <h2 style="margin:0; color:${BRAND.navy}; font-size:22px; font-family:Georgia,serif;">Return Request ${cfg.label}</h2>
      <p style="margin:8px 0 0; color:${BRAND.gray};">Order #${orderId}</p>
    </div>
    <p style="color:#374151; line-height:1.6;">${cfg.message}</p>
    ${notesSection}
    <div style="background:${BRAND.lightGold}; border-radius:6px; padding:16px; margin:20px 0;">
      <p style="margin:0; color:${BRAND.navy}; font-size:14px; line-height:1.5;">
        <strong>Return Policy:</strong> Items must be unused, in original packaging, and returned within 2 days of delivery. Refunds are processed within 5-7 business days after inspection.
      </p>
    </div>
  `;

  return {
    subject: `Return Request ${cfg.label} - Order #${orderId} | ${BRAND.name}`,
    html: baseLayout(content, `Your return request for order #${orderId} is ${cfg.label.toLowerCase()}.`),
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
  const itemsList = (order.items || [])
    .map((item: any) => `<tr>
      <td style="padding:6px 0; border-bottom:1px solid #eee; color:#374151; font-size:13px;">${item.name}${item.size ? ` (${item.size})` : ""}${item.color ? ` – ${item.color}` : ""}</td>
      <td style="padding:6px 0; border-bottom:1px solid #eee; text-align:right; color:#374151; font-size:13px;">x${item.quantity}</td>
      <td style="padding:6px 0; border-bottom:1px solid #eee; text-align:right; color:#374151; font-size:13px;">Rs. ${(Number(item.price) * item.quantity).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  const addr = order.shippingAddress as any;
  const content = `
    <div style="margin-bottom:20px;">
      <h2 style="margin:0 0 4px; color:#2C3E50; font-size:20px; font-family:Georgia,serif;">🛍️ New Order Received</h2>
      <p style="margin:0; color:#6B7280; font-size:14px;">Order <strong>#${order.id}</strong> has been placed on your store.</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; background:#F9FAFB; border-radius:8px; overflow:hidden;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 6px; font-size:13px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px;">Customer</p>
        <p style="margin:0; font-size:15px; font-weight:600; color:#111827;">${addr?.fullName || "—"}</p>
        <p style="margin:2px 0 0; font-size:13px; color:#6B7280;">${addr?.phone || ""}</p>
      </td></tr>
      <tr><td style="padding:0 16px 16px;">
        <p style="margin:0 0 6px; font-size:13px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px;">Ship To</p>
        <p style="margin:0; font-size:13px; color:#374151;">${addr?.address || ""}${addr?.city ? `, ${addr.city}` : ""}${addr?.state ? `, ${addr.state}` : ""}${addr?.pincode ? ` – ${addr.pincode}` : ""}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <thead>
        <tr>
          <th style="text-align:left; padding:8px 0; border-bottom:2px solid #C9A961; font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px;">Item</th>
          <th style="text-align:right; padding:8px 0; border-bottom:2px solid #C9A961; font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px;">Qty</th>
          <th style="text-align:right; padding:8px 0; border-bottom:2px solid #C9A961; font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsList}</tbody>
    </table>
    <div style="text-align:right; padding:12px 0; border-top:2px solid #2C3E50;">
      <span style="font-size:18px; font-weight:700; color:#2C3E50;">Total: Rs. ${Number(order.totalAmount).toLocaleString("en-IN")}</span>
    </div>
    <div style="margin-top:20px; padding:12px 16px; background:#F0FDF4; border-radius:6px; border-left:4px solid #22C55E;">
      <p style="margin:0; font-size:13px; color:#166534;">
        <strong>Payment:</strong> ${order.paymentStatus === "paid" ? "✅ Paid" : order.paymentStatus === "pending" ? "⏳ Pending" : "💵 Cash on Delivery"}
      </p>
    </div>
    <div style="margin-top:16px; text-align:center;">
      <a href="${process.env.APP_URL || "https://your-store.com"}/admin" style="display:inline-block; padding:10px 24px; background:#2C3E50; color:#C9A961; text-decoration:none; border-radius:6px; font-size:14px; font-weight:600;">View in Admin Panel →</a>
    </div>
  `;
  const html = baseLayout(content, `New order #${order.id} — Rs. ${Number(order.totalAmount).toLocaleString("en-IN")}`);
  const subject = `🛍️ New Order #${order.id} — Rs. ${Number(order.totalAmount).toLocaleString("en-IN")}`;

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
