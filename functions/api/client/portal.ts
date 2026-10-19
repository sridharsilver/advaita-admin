export async function onRequest(context: any) {
  if (context.request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(context.request.url);
  const email = url.searchParams.get("email");
  const code = url.searchParams.get("code");

  if (!email || !code) {
    return new Response(JSON.stringify({ error: "Missing credentials" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const db = context.env.DB;

    // Check credentials against the new clients table
    const client = await db.prepare(
      "SELECT * FROM clients WHERE email = ? AND access_code = ?"
    ).bind(email, code).first();

    if (!client) {
      return new Response(JSON.stringify({ error: "Invalid email or access code" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Update last login
    await db.prepare("UPDATE clients SET last_login = CURRENT_TIMESTAMP WHERE id = ?").bind(client.id).run();

    const clientName = client.name;

    // Get Projects
    const { results: projects } = await db.prepare(`
      SELECT p.*, a.client_name, a.company_name
      FROM projects p
      JOIN agreements a ON p.agreement_id = a.id
      JOIN proposals prop ON a.proposal_id = prop.id
      WHERE prop.client_email = ?
      ORDER BY p.created_at DESC
    `).bind(email).all();

    // Get Invoices
    const { results: invoices } = await db.prepare(`
      SELECT i.*
      FROM invoices i
      JOIN projects p ON i.project_id = p.id
      JOIN agreements a ON p.agreement_id = a.id
      JOIN proposals prop ON a.proposal_id = prop.id
      WHERE prop.client_email = ?
      ORDER BY i.created_at DESC
    `).bind(email).all();

    // Get Agreements
    const { results: agreements } = await db.prepare(`
      SELECT a.*
      FROM agreements a
      JOIN proposals prop ON a.proposal_id = prop.id
      WHERE prop.client_email = ?
      ORDER BY a.created_at DESC
    `).bind(email).all();

    // Attach milestones to projects
    for (let proj of projects) {
      const { results: milestones } = await db.prepare(
        "SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC"
      ).bind(proj.id).all();
      proj.milestones = milestones;
    }

    return new Response(JSON.stringify({
      clientName,
      projects,
      invoices,
      agreements
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
