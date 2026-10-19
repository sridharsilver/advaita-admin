export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM agreements ORDER BY created_at DESC"
    ).all();
    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { id, status, pdf_url } = body;

    if (!id) {
      return Response.json({ error: "Missing agreement id" }, { status: 400 });
    }

    let query = "UPDATE agreements SET updated_at = CURRENT_TIMESTAMP";
    const params: any[] = [];

    if (status) {
      query += ", status = ?";
      params.push(status);
    }
    if (pdf_url) {
      query += ", pdf_url = ?";
      params.push(pdf_url);
    }

    query += " WHERE id = ?";
    params.push(id);

    const { success } = await context.env.DB.prepare(query).bind(...params).run();
    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
