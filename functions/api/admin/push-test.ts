import { sendPushNotification } from "../../lib/sendPushNotification";

export interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

// POST: Send a test push notification to all subscriptions
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await sendPushNotification(context.env, {
      title: "🔔 Test Notification",
      body: "Push notifications are working! You'll receive alerts for new inquiries, proposals, and testimonials.",
      url: "/admin",
      icon: "/admin-icon-192.png",
    });

    return Response.json({
      success: true,
      ...result,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
