export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT i.*, p.name as project_name, p.client_name FROM invoices i JOIN projects p ON i.project_id = p.id ORDER BY i.created_at DESC"
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
      return Response.json({ error: "Missing invoice id" }, { status: 400 });
    }

    let query = "UPDATE invoices SET updated_at = CURRENT_TIMESTAMP";
    const params: any[] = [];

    if (status) {
      query += ", status = ?";
      params.push(status);
      if (status === 'Paid') {
        query += ", payment_date = CURRENT_TIMESTAMP";
      }
    }
    
    if (pdf_url) {
      query += ", pdf_url = ?";
      params.push(pdf_url);
    }

    query += " WHERE id = ?";
    params.push(id);

    const { success } = await context.env.DB.prepare(query).bind(...params).run();

    // If invoice is Advance and Paid, update project to Active
    if (success && status === 'Paid') {
      const invoice = await context.env.DB.prepare(
        "SELECT project_id, type FROM invoices WHERE id = ?"
      ).bind(id).first<any>();

      if (invoice && invoice.type === 'Advance') {
        await context.env.DB.prepare(
          "UPDATE projects SET status = 'Active', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(invoice.project_id).run();
      } else if (invoice && invoice.type === 'Final') {
        // Automatically close project if final invoice paid
        await context.env.DB.prepare(
          "UPDATE projects SET status = 'Closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(invoice.project_id).run();
      }
    }

    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
