export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  ADMIN_PASSWORD?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM portfolio_items ORDER BY created_at DESC").all();
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
