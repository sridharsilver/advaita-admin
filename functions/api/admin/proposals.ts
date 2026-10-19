export interface Env {
  DB: D1Database;
}

const migrateSchema = async (db: D1Database) => {
  try {
    await db.prepare("ALTER TABLE proposals ADD COLUMN password TEXT").run();
  } catch (e) {}
};

const generatePasscode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let passcode = "";
  for (let i = 0; i < 8; i++) {
    passcode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return passcode;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    await migrateSchema(context.env.DB);

    // Auto-backfill passcode for any legacy or seeded proposals that don't have one
    const unpassworded = await context.env.DB.prepare(
      "SELECT id FROM proposals WHERE password IS NULL OR password = ''"
    ).all<any>();

    if (unpassworded.results && unpassworded.results.length > 0) {
      for (const row of unpassworded.results) {
        const newCode = generatePasscode();
        await context.env.DB.prepare(
          "UPDATE proposals SET password = ? WHERE id = ?"
        ).bind(newCode, row.id).run();
      }
    }

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM proposals ORDER BY created_at DESC"
    ).all();
    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    await migrateSchema(context.env.DB);
    const body = await context.request.json() as any;
    const {
      title,
      slug,
      client_name,
      company_name,
      client_email,
      project_type,
      cover_image,
      status,
      valid_until,
      content_json,
      password,
      client_type
    } = body;

    if (!title || !slug || !client_name || !content_json) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await context.env.DB.prepare(
      "SELECT id FROM proposals WHERE slug = ?"
    ).bind(slug).first();

    if (existing) {
      return Response.json({ error: "Slug already exists. Please choose a unique URL." }, { status: 400 });
    }

    const passcode = password || generatePasscode();

    const { success } = await context.env.DB.prepare(
      `INSERT INTO proposals (
        title, slug, client_name, company_name, client_email, 
        project_type, client_type, cover_image, status, valid_until, content_json, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      title, slug, client_name, company_name || null, client_email || null,
      project_type || null, client_type || 'remote', cover_image || null, status || 'Draft', valid_until || null, content_json, passcode
    ).run();

    return Response.json({ success, password: passcode });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    await migrateSchema(context.env.DB);
    const body = await context.request.json() as any;
    const {
      id,
      action, // 'duplicate' or 'update'
      title,
      slug,
      client_name,
      company_name,
      client_email,
      project_type,
      cover_image,
      status,
      valid_until,
      content_json,
      password,
      client_type
    } = body;

    if (!id) {
      return Response.json({ error: "Missing proposal ID" }, { status: 400 });
    }

    if (action === "duplicate") {
      // Fetch the proposal to duplicate
      const original = await context.env.DB.prepare(
        "SELECT * FROM proposals WHERE id = ?"
      ).bind(id).first<any>();

      if (!original) {
        return Response.json({ error: "Original proposal not found" }, { status: 404 });
      }

      const duplicatedTitle = `${original.title} (Copy)`;
      const baseSlug = `${original.slug}-copy`;
      let finalSlug = baseSlug;
      
      // Ensure slug uniqueness for copy
      let suffix = 1;
      while (true) {
        const dupCheck = await context.env.DB.prepare(
          "SELECT id FROM proposals WHERE slug = ?"
        ).bind(finalSlug).first();
        if (!dupCheck) break;
        finalSlug = `${baseSlug}-${suffix}`;
        suffix++;
      }

      const passcode = generatePasscode();

      const { success } = await context.env.DB.prepare(
        `INSERT INTO proposals (
          title, slug, client_name, company_name, client_email, 
          project_type, client_type, cover_image, status, valid_until, content_json, password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        duplicatedTitle, finalSlug, original.client_name, original.company_name, original.client_email,
        original.project_type, original.client_type || 'remote', original.cover_image, "Draft", original.valid_until, original.content_json, passcode
      ).run();

      return Response.json({ success, slug: finalSlug, password: passcode });
    }

    // Normal Update
    if (!title || !slug || !client_name || !content_json) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check slug uniqueness (excluding current id)
    const existing = await context.env.DB.prepare(
      "SELECT id FROM proposals WHERE slug = ? AND id != ?"
    ).bind(slug, id).first();

    if (existing) {
      return Response.json({ error: "Slug already exists. Please choose a unique URL." }, { status: 400 });
    }

    // If password is not provided, check if proposal already has one, else generate
    const current = await context.env.DB.prepare(
      "SELECT password FROM proposals WHERE id = ?"
    ).bind(id).first<any>();
    const passcode = password || (current && current.password) || generatePasscode();

    const { success } = await context.env.DB.prepare(
      `UPDATE proposals SET 
        title = ?, slug = ?, client_name = ?, company_name = ?, client_email = ?, 
        project_type = ?, client_type = ?, cover_image = ?, status = ?, valid_until = ?, content_json = ?,
        password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).bind(
      title, slug, client_name, company_name || null, client_email || null,
      project_type || null, client_type || 'remote', cover_image || null, status, valid_until || null, content_json,
      passcode, id
    ).run();

    return Response.json({ success, password: passcode });
  } catch (e: any) {
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
      "DELETE FROM proposals WHERE id = ?"
    ).bind(id).run();

    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
