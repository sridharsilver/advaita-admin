export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const projectId = url.searchParams.get("project_id");
    
    if (!projectId) {
      return Response.json({ error: "Missing project_id" }, { status: 400 });
    }

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM files WHERE project_id = ? ORDER BY uploaded_at DESC"
    ).bind(projectId).all();
    
    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { project_id, type, name, url } = body;

    if (!project_id || !type || !name || !url) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      "INSERT INTO files (project_id, type, name, url) VALUES (?, ?, ?, ?)"
    ).bind(project_id, type, name, url).run();

    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
