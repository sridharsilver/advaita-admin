export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Fetch single project and its related data (milestones, invoices, files)
      const project = await context.env.DB.prepare(
        "SELECT * FROM projects WHERE id = ?"
      ).bind(id).first<any>();

      if (!project) {
        return Response.json({ error: "Project not found" }, { status: 404 });
      }

      const milestones = await context.env.DB.prepare(
        "SELECT * FROM milestones WHERE project_id = ? ORDER BY created_at ASC"
      ).bind(id).all();

      const invoices = await context.env.DB.prepare(
        "SELECT * FROM invoices WHERE project_id = ? ORDER BY created_at ASC"
      ).bind(id).all();

      return Response.json({ ...project, milestones: milestones.results, invoices: invoices.results });
    } else {
      // Fetch all projects
      const { results } = await context.env.DB.prepare(
        "SELECT * FROM projects ORDER BY created_at DESC"
      ).all();
      return Response.json(results);
    }
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ error: "Missing id or status" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(status, id).run();

    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
