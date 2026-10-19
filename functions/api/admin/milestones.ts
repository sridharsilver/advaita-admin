export interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { project_id, title } = body;

    if (!project_id || !title) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "INSERT INTO milestones (project_id, title, status, progress_percentage) VALUES (?, ?, 'Pending', 0)"
    ).bind(project_id, title).run();

    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { id, status, progress_percentage } = body;

    if (!id) {
      return Response.json({ error: "Missing milestone id" }, { status: 400 });
    }

    let query = "UPDATE milestones SET updated_at = CURRENT_TIMESTAMP";
    const params: any[] = [];

    if (status) {
      query += ", status = ?";
      params.push(status);
    }
    
    if (progress_percentage !== undefined) {
      query += ", progress_percentage = ?";
      params.push(progress_percentage);
    }

    query += " WHERE id = ?";
    params.push(id);

    const { success } = await context.env.DB.prepare(query).bind(...params).run();

    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
