export interface Env {
  JWT_SECRET?: string;
}

const DEFAULT_SECRET = "super_secret_dev_key_do_not_use_in_prod";

async function verifyJWT(token: string, secret: string) {
  try {
    const [header, payload, signature] = token.split(".");
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    // Quick validation of signature
    const signatureBytes = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(`${header}.${payload}`)
    );
    
    if (!isValid) return null;
    
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decodedPayload;
  } catch (e) {
    return null;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const cookieHeader = context.request.headers.get("Cookie");
  let token = null;
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('admin_token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = context.env.JWT_SECRET || DEFAULT_SECRET;
  const payload = await verifyJWT(token, secret);
  
  if (!payload || payload.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Inject user info if needed
  context.data = { user: payload };

  return context.next();
};
