export interface Env {
  DB: D1Database;
}

function generateAccessCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No visually confusing characters
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const cookieHeader = context.request.headers.get("Cookie");
    const isAdmin = cookieHeader && cookieHeader.includes("admin_token=");
    if (!isAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM clients ORDER BY created_at DESC"
    ).all();

    return Response.json({ clients: results });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const cookieHeader = context.request.headers.get("Cookie");
    const isAdmin = cookieHeader && cookieHeader.includes("admin_token=");
    if (!isAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await context.request.json() as any;
    const { action, id, name, company_name, email, phone, address, access_code } = body;

    if (action === "create") {
      const code = access_code && access_code.trim() !== "" ? access_code : generateAccessCode();
      const res = await context.env.DB.prepare(
        "INSERT INTO clients (name, company_name, email, phone, address, access_code) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(name, company_name || null, email, phone || null, address || null, code).run();

      return Response.json({ success: res.success, id: res.meta.last_row_id });
    } else if (action === "update") {
      const res = await context.env.DB.prepare(
        "UPDATE clients SET name = ?, company_name = ?, email = ?, phone = ?, address = ?, access_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(name, company_name || null, email, phone || null, address || null, access_code, id).run();

      return Response.json({ success: res.success });
    } else if (action === "delete") {
      const res = await context.env.DB.prepare("DELETE FROM clients WHERE id = ?").bind(id).run();
      return Response.json({ success: res.success });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    if (e.message.includes("UNIQUE constraint failed: clients.email")) {
       return Response.json({ error: "A client with this email already exists." }, { status: 400 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
};
