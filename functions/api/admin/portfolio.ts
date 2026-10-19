export interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { title, category, image_url, tone, description, project_link } = body;
    
    if (!title || !category || !image_url || !tone || !description || !project_link) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "INSERT INTO portfolio_items (title, category, image_url, tone, description, project_link) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(title, category, image_url, tone, description, project_link).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { id, title, category, image_url, tone, description, project_link } = body;
    
    if (!id || !title || !category || !image_url || !tone || !description || !project_link) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "UPDATE portfolio_items SET title = ?, category = ?, image_url = ?, tone = ?, description = ?, project_link = ? WHERE id = ?"
    ).bind(title, category, image_url, tone, description, project_link, id).run();

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
      "DELETE FROM portfolio_items WHERE id = ?"
    ).bind(id).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
