// Twilio WhatsApp Integration (Replit Connector)
import twilio from 'twilio';
import { storage } from './storage';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.account_sid || !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret)) {
    throw new Error('Twilio not connected');
  }
  return {
    accountSid: connectionSettings.settings.account_sid,
    apiKey: connectionSettings.settings.api_key,
    apiKeySecret: connectionSettings.settings.api_key_secret,
    phoneNumber: connectionSettings.settings.phone_number
  };
}

async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, { accountSid });
}

async function getTwilioFromPhoneNumber() {
  const { phoneNumber } = await getCredentials();
  return phoneNumber;
}

async function sendWhatsAppMessage(to: string, body: string) {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();

    const toFormatted = to.startsWith('+') ? to : `+${to}`;
    const fromFormatted = fromNumber.startsWith('+') ? fromNumber : `+${fromNumber}`;

    const message = await client.messages.create({
      body,
      from: `whatsapp:${fromFormatted}`,
      to: `whatsapp:${toFormatted}`,
    });

    console.log(`WhatsApp message sent: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('WhatsApp message failed:', error);
    throw error;
  }
}

type OrderInfo = {
  id: number;
  totalAmount: string;
  items: Array<{ name: string; quantity: number; price: string; size?: string; color?: string }>;
  shippingAddress: { fullName: string; address: string; city: string; state: string; pincode: string; phone: string };
  paymentStatus: string;
  status: string;
};

export async function sendOrderNotification(order: OrderInfo) {
  try {
    const settings = await storage.getDeliverySettings();
    if (!settings?.whatsappOrderNotifications || !settings?.whatsappNotifyNumber) {
      return;
    }

    const itemsList = order.items
      .map((item, i) => `${i + 1}. ${item.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''} x${item.quantity} - Rs. ${Number(item.price) * item.quantity}`)
      .join('\n');

    const message = `🛍️ *NEW ORDER RECEIVED*\n\n` +
      `*Order #${order.id}*\n` +
      `*Customer:* ${order.shippingAddress.fullName}\n` +
      `*Phone:* ${order.shippingAddress.phone}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `*Total:* Rs. ${Number(order.totalAmount).toLocaleString('en-IN')}\n` +
      `*Payment:* ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}\n\n` +
      `*Shipping To:*\n${order.shippingAddress.address}\n${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}\n\n` +
      `_Ravindrra Vastra Niketan_`;

    await sendWhatsAppMessage(settings.whatsappNotifyNumber, message);
  } catch (error) {
    console.error('Order WhatsApp notification failed:', error);
  }
}

type AbandonedCartInfo = {
  customerName: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  totalValue: string;
};

export async function sendAbandonedCartNotification(cart: AbandonedCartInfo) {
  try {
    const settings = await storage.getDeliverySettings();
    if (!settings?.whatsappAbandonedCartEnabled || !settings?.whatsappNotifyNumber) {
      return;
    }

    const itemsList = cart.items
      .map((item, i) => `${i + 1}. ${item.name} x${item.quantity} - Rs. ${Number(item.price) * item.quantity}`)
      .join('\n');

    const message = `🛒 *ABANDONED CART ALERT*\n\n` +
      `*Customer:* ${cart.customerName}\n` +
      `*Phone:* ${cart.customerPhone}\n\n` +
      `*Items Left in Cart:*\n${itemsList}\n\n` +
      `*Cart Value:* Rs. ${Number(cart.totalValue).toLocaleString('en-IN')}\n\n` +
      `_Follow up with the customer to complete their purchase!_\n\n` +
      `_Ravindrra Vastra Niketan_`;

    await sendWhatsAppMessage(settings.whatsappNotifyNumber, message);
  } catch (error) {
    console.error('Abandoned cart WhatsApp notification failed:', error);
  }
}

export async function checkAbandonedCarts() {
  try {
    const settings = await storage.getDeliverySettings();
    if (!settings?.whatsappAbandonedCartEnabled || !settings?.whatsappNotifyNumber) {
      return;
    }

    const minutes = settings.whatsappAbandonedCartMinutes || 30;
    const abandonedCarts = await storage.getAbandonedCarts(minutes);

    for (const cart of abandonedCarts) {
      await sendAbandonedCartNotification(cart);
      await storage.markCartNotified(cart.userId);
    }
  } catch (error) {
    console.error('Abandoned cart check failed:', error);
  }
}

let abandonedCartInterval: ReturnType<typeof setInterval> | null = null;

export function startAbandonedCartChecker() {
  if (abandonedCartInterval) return;

  abandonedCartInterval = setInterval(async () => {
    await checkAbandonedCarts();
  }, 10 * 60 * 1000);

  console.log('Abandoned cart checker started (runs every 10 minutes)');
}

export function stopAbandonedCartChecker() {
  if (abandonedCartInterval) {
    clearInterval(abandonedCartInterval);
    abandonedCartInterval = null;
  }
}
