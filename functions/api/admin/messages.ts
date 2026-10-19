export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM messages ORDER BY created_at DESC"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
    
    if (!id) return new Response("Missing id", { status: 400 });

    const { success } = await context.env.DB.prepare(
      "DELETE FROM messages WHERE id = ?"
    )
      .bind(id)
      .run();

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response("Failed to delete message", { status: 500 });
  } catch (error) {
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const { request, env } = context;
    const { id, status } = await request.json() as { id: number; status: string };

    if (!id || !status) return new Response("Missing required fields", { status: 400 });

    const { success } = await env.DB.prepare(
      "UPDATE messages SET status = ? WHERE id = ?"
    )
      .bind(status, id)
      .run();

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Failed to update message", { status: 500 });
  } catch (error) {
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
};
