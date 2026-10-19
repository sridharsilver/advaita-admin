import { sendPushNotification } from "../lib/sendPushNotification";

export interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM testimonials WHERE status = 'active' ORDER BY created_at DESC"
    ).all();
    
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: (e as any).message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { quote, name, role, image_url } = body;
    
    if (!quote || !name || !role) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // New submissions default to 'pending'
    const { success } = await context.env.DB.prepare(
      "INSERT INTO testimonials (quote, name, role, image_url, status) VALUES (?, ?, ?, ?, 'pending')"
    ).bind(quote, name, role, image_url || null).run();

    if (success) {
      // Send push notification to admin
      try {
        await sendPushNotification(context.env, {
          title: `⭐ New Testimonial from ${name}`,
          body: (quote as string).length > 100 ? (quote as string).substring(0, 100) + "..." : quote as string,
          url: "/admin/testimonials",
          icon: "/admin-icon-192.png",
        });
      } catch (pushErr) {
        console.error("Push notification failed:", pushErr);
      }
    }

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: (e as any).message }, { status: 500 });
  }
};
