export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM testimonials ORDER BY created_at DESC"
    ).all();
    
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { quote, name, role, image_url } = body;
    
    if (!quote || !name || !role) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "INSERT INTO testimonials (quote, name, role, image_url) VALUES (?, ?, ?, ?)"
    ).bind(quote, name, role, image_url || null).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { id, quote, name, role, image_url, status } = body;
    
    if (!id || !quote || !name || !role) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "UPDATE testimonials SET quote = ?, name = ?, role = ?, image_url = ?, status = ? WHERE id = ?"
    ).bind(quote, name, role, image_url || null, status || 'pending', id).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "DELETE FROM testimonials WHERE id = ?"
    ).bind(id).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
