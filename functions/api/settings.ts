export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT key, value FROM site_settings"
    ).all();
    
    // Convert array of {key, value} into an object
    const settings = results.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return new Response(JSON.stringify(settings), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as Record<string, string>;

    const statements = Object.entries(body).map(([key, value]) => {
      const stringValue = value !== undefined && value !== null ? String(value) : "";
      return env.DB.prepare(
        "INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP"
      ).bind(key, stringValue);
    });

    if (statements.length > 0) {
      await env.DB.batch(statements);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
};
