/**
 * Web Push Notification sender for Cloudflare Workers.
 * 
 * Implements the Web Push protocol (RFC 8030) with VAPID authentication
 * using the crypto.subtle API available in Workers runtime.
 * 
 * No npm dependencies required.
 */

interface PushSubscriptionRecord {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

/**
 * Base64url encode a buffer
 */
function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Base64 decode (standard or URL-safe) to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const standardBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (standardBase64.length % 4)) % 4);
  const raw = atob(standardBase64 + padding);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

/**
 * Create a VAPID JWT token for authorization
 */
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64url: string
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 60 * 60 * 12, // 12 hours
    sub: subject,
  };

  const headerB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the VAPID private key as ECDSA P-256
  const privateKeyBytes = base64ToUint8Array(privateKeyBase64url);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format (64 bytes)
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER format: parse r and s values
    const r = parseDerInteger(sigBytes, 3);
    const sOffset = 3 + 1 + sigBytes[3];
    const s = parseDerInteger(sigBytes, sOffset + 1);
    rawSig = new Uint8Array(64);
    rawSig.set(padTo32(r), 0);
    rawSig.set(padTo32(s), 32);
  }

  const signatureB64 = base64urlEncode(rawSig.buffer);
  return `${unsignedToken}.${signatureB64}`;
}

function parseDerInteger(buf: Uint8Array, offset: number): Uint8Array {
  const len = buf[offset];
  return buf.slice(offset + 1, offset + 1 + len);
}

function padTo32(bytes: Uint8Array): Uint8Array {
  if (bytes.length === 32) return bytes;
  if (bytes.length > 32) return bytes.slice(bytes.length - 32);
  const padded = new Uint8Array(32);
  padded.set(bytes, 32 - bytes.length);
  return padded;
}

/**
 * Send a push notification to a single subscription
 */
async function sendToSubscription(
  subscription: PushSubscriptionRecord,
  payload: NotificationPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode: number; expired: boolean }> {
  try {
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

    // Create VAPID JWT
    const jwt = await createVapidJwt(audience, vapidSubject, vapidPrivateKey);

    // Encode the payload as JSON
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

    // Send the push message
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
        "Urgency": "high",
      },
      body: payloadBytes,
    });

    const expired = response.status === 404 || response.status === 410;
    return { success: response.ok, statusCode: response.status, expired };
  } catch (error) {
    console.error("Push send error:", error);
    return { success: false, statusCode: 0, expired: false };
  }
}

/**
 * Send a push notification to all stored subscriptions.
 * Automatically removes expired/invalid subscriptions.
 */
export async function sendPushNotification(
  env: Env,
  payload: NotificationPayload
): Promise<{ sent: number; failed: number; removed: number }> {
  const vapidPublicKey = env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = env.VAPID_PRIVATE_KEY;
  const vapidSubject = env.VAPID_SUBJECT || "mailto:hello@advaita.design";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("VAPID keys not configured — skipping push notifications");
    return { sent: 0, failed: 0, removed: 0 };
  }

  // Add defaults
  const fullPayload: NotificationPayload = {
    icon: "/admin-icon-192.png",
    ...payload,
  };

  // Fetch all subscriptions
  const { results } = await env.DB.prepare(
    "SELECT id, endpoint, p256dh, auth FROM push_subscriptions"
  ).all<PushSubscriptionRecord>();

  if (!results || results.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  let sent = 0;
  let failed = 0;
  let removed = 0;

  // Send to all subscriptions in parallel
  const promises = results.map(async (sub) => {
    const result = await sendToSubscription(
      sub,
      fullPayload,
      vapidPublicKey,
      vapidPrivateKey,
      vapidSubject
    );

    if (result.success) {
      sent++;
    } else if (result.expired) {
      // Remove expired subscriptions
      await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?")
        .bind(sub.id)
        .run();
      removed++;
    } else {
      failed++;
    }
  });

  await Promise.all(promises);

  console.log(`Push notifications: sent=${sent}, failed=${failed}, removed=${removed}`);
  return { sent, failed, removed };
}
