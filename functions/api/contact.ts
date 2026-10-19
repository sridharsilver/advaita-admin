import { sendPushNotification } from "../lib/sendPushNotification";

export interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { name, email, phone, company, budget, message } = body as any;

    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const { success } = await env.DB.prepare(
      "INSERT INTO messages (name, email, phone, company, budget, message) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(name, email, phone || null, company || null, budget || null, message)
      .run();

    if (success) {
      // Send push notification to admin
      try {
        await sendPushNotification(env, {
          title: `📩 New Inquiry from ${name}`,
          body: (message as string).length > 100 ? (message as string).substring(0, 100) + "..." : message as string,
          url: "/admin/inquiries",
          icon: "/admin-icon-192.png",
        });
      } catch (pushErr) {
        // Don't fail the contact form if push fails
        console.error("Push notification failed:", pushErr);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Failed to save message", { status: 500 });
  } catch (error) {
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
};
