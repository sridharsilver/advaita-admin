export interface Env {
  DB: D1Database;
}

// POST: Save a new push subscription
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return Response.json({ error: "Missing subscription data" }, { status: 400 });
    }

    // Upsert: if endpoint exists, update keys; otherwise insert
    await context.env.DB.prepare(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth) 
       VALUES (?, ?, ?) 
       ON CONFLICT(endpoint) DO UPDATE SET p256dh = ?, auth = ?`
    )
      .bind(endpoint, keys.p256dh, keys.auth, keys.p256dh, keys.auth)
      .run();

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

// DELETE: Remove a push subscription
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { endpoint } = body;

    if (!endpoint) {
      return Response.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await context.env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?")
      .bind(endpoint)
      .run();

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
