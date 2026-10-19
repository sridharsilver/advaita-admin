export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");
    
    if (!slug) {
      return Response.json({ error: "Missing slug" }, { status: 400 });
    }

    const form = await context.env.DB.prepare(
      "SELECT id, title, description, fields_json FROM requirement_forms WHERE slug = ?"
    ).bind(slug).first();

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }
    
    return Response.json(form);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { form_id, client_name, client_email, answers_json } = body;
    
    if (!form_id || !client_name || !client_email || !answers_json) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      `INSERT INTO requirement_submissions (form_id, client_name, client_email, answers_json) 
       VALUES (?, ?, ?, ?)`
    ).bind(form_id, client_name, client_email, answers_json).run();

    return Response.json({ success });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
