export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM requirement_forms ORDER BY created_at DESC"
    ).all();
    
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { title, slug, description, fields_json } = body;
    
    if (!title || !slug || !fields_json) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "INSERT INTO requirement_forms (title, slug, description, fields_json) VALUES (?, ?, ?, ?)"
    ).bind(title, slug, description || null, fields_json).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { id, title, slug, description, fields_json } = body;
    
    if (!id || !title || !slug || !fields_json) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "UPDATE requirement_forms SET title = ?, slug = ?, description = ?, fields_json = ? WHERE id = ?"
    ).bind(title, slug, description || null, fields_json, id).run();

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

    // Also delete associated submissions to maintain referential integrity
    await context.env.DB.prepare(
      "DELETE FROM requirement_submissions WHERE form_id = ?"
    ).bind(id).run();

    const { success } = await context.env.DB.prepare(
      "DELETE FROM requirement_forms WHERE id = ?"
    ).bind(id).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
