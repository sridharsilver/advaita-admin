import { sendPushNotification } from "../lib/sendPushNotification";
import { sendEmail } from "../lib/sendEmail";

export interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  RESEND_API_KEY?: string;
  SENDER_EMAIL?: string;
  ADMIN_EMAIL?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing agreement id" }, { status: 400 });
    }

    const agreement = await context.env.DB.prepare(
      "SELECT * FROM agreements WHERE id = ?"
    ).bind(id).first<any>();

    if (!agreement) {
      return Response.json({ error: "Agreement not found" }, { status: 404 });
    }

    return Response.json(agreement);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { action, id, signatureName, signatureImage, ipAddress, browserInfo } = body;

    if (!id || action !== 'sign') {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // 1. Update Agreement
    const { success } = await context.env.DB.prepare(
      `UPDATE agreements 
       SET status = 'Signed', signature_name = ?, signature_image = ?, signed_at = CURRENT_TIMESTAMP, 
           ip_address = ?, browser_info = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).bind(signatureName, signatureImage, ipAddress, browserInfo, id).run();

    if (success) {
      // 2. Fetch agreement details to create project
      const agreement = await context.env.DB.prepare(
        "SELECT * FROM agreements WHERE id = ?"
      ).bind(id).first<any>();

      if (agreement) {
        // 3. Create Project
        const projectRes = await context.env.DB.prepare(
          `INSERT INTO projects (
            agreement_id, name, client_name, company_name, budget, timeline, deliverables, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`
        ).bind(
          agreement.id, agreement.project_name, agreement.client_name, agreement.company_name, 
          agreement.project_value, agreement.timeline, agreement.deliverables
        ).run();

        const projectId = projectRes.meta.last_row_id;

        // 4. Generate Advance Invoice (50%)
        // Remove non-numeric characters from budget to calculate 50%
        const numericBudget = Number(agreement.project_value?.replace(/[^0-9.-]+/g,"")) || 0;
        const advanceAmount = numericBudget > 0 ? (numericBudget * 0.5).toFixed(2) : '50% Advance';

        await context.env.DB.prepare(
          `INSERT INTO invoices (project_id, type, amount, status) VALUES (?, 'Advance', ?, 'Draft')`
        ).bind(projectId, advanceAmount).run();

        // Send Email & Notification
        await sendPushNotification(context.env, {
          title: `✅ Agreement Signed: ${agreement.project_name}`,
          body: `${agreement.client_name} has signed the service agreement.`,
          url: "/admin/agreements",
          icon: "/admin-icon-192.png",
        });
        
        // Audit log
        await context.env.DB.prepare(
          `INSERT INTO audit_logs (entity_type, entity_id, action, details, ip_address, browser_info) 
           VALUES ('Agreement', ?, 'Signed', 'Client signed the agreement remotely.', ?, ?)`
        ).bind(agreement.id, ipAddress, browserInfo).run();
      }
    }

    return Response.json({ success });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
