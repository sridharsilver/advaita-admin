export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT s.*, f.title as form_title 
       FROM requirement_submissions s
       JOIN requirement_forms f ON s.form_id = f.id
       ORDER BY s.created_at DESC`
    ).all();
    
    return Response.json(results);
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
      "DELETE FROM requirement_submissions WHERE id = ?"
    ).bind(id).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

// Toggle submission status (e.g. read/unread)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { id, status } = body;
    
    if (!id || !status) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "UPDATE requirement_submissions SET status = ? WHERE id = ?"
    ).bind(status, id).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
