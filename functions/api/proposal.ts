import { sendPushNotification } from "../lib/sendPushNotification";
import { sendEmail } from "../lib/sendEmail";
import { generateProposalPdf } from "../lib/generateProposalPdf";

export interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  RESEND_API_KEY?: string;
  SENDER_EMAIL?: string;
  ADMIN_EMAIL?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

const migrateSchema = async (db: D1Database) => {
  try {
    await db.prepare("ALTER TABLE proposals ADD COLUMN password TEXT").run();
  } catch (e) {}
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    await migrateSchema(context.env.DB);
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");
    const clientPwd = url.searchParams.get("pwd") || "";

    if (!slug) {
      return Response.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    // Fetch the proposal
    const proposal = await context.env.DB.prepare(
      "SELECT * FROM proposals WHERE slug = ?"
    ).bind(slug).first<any>();

    if (!proposal) {
      return Response.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Check password protection
    const cookieHeader = context.request.headers.get("Cookie");
    const isAdmin = cookieHeader && cookieHeader.includes("admin_token=");
    const isCorrectPassword = proposal.password ? clientPwd === proposal.password : true;

    if (!isCorrectPassword && !isAdmin) {
      return Response.json({ 
        isLocked: true, 
        title: proposal.title, 
        client_name: proposal.client_name 
      });
    }

    if (!isAdmin) {
      // Increment views count asynchronously
      await context.env.DB.prepare(
        "UPDATE proposals SET views = views + 1 WHERE id = ?"
      ).bind(proposal.id).run();
      
      proposal.views += 1;
    }

    return Response.json(proposal);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    await migrateSchema(context.env.DB);
    const body = await context.request.json() as any;
    const { slug, action, status } = body;

    if (!slug) {
      return Response.json({ error: "Missing slug" }, { status: 400 });
    }

    if (action === "download") {
      const { success } = await context.env.DB.prepare(
        "UPDATE proposals SET downloads = downloads + 1 WHERE slug = ?"
      ).bind(slug).run();
      return Response.json({ success });
    }

    if (action === "status") {
      if (!status || !["Approved", "Rejected", "Viewed", "Revision Requested"].includes(status)) {
        return Response.json({ error: "Invalid status" }, { status: 400 });
      }

      let success = false;
      if (status === "Approved") {
        const { signatureName } = body;
        const res = await context.env.DB.prepare(
          "UPDATE proposals SET status = ?, signature_name = ?, signature_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE slug = ?"
        ).bind(status, signatureName || "", slug).run();
        success = res.success;

        if (success) {
          try {
            const proposal = await context.env.DB.prepare(
              "SELECT id, title, client_name, client_email, company_name, content_json, signature_date, valid_until FROM proposals WHERE slug = ?"
            ).bind(slug).first<any>();

            if (proposal) {
              if (proposal.client_email) {
                const existingClient = await context.env.DB.prepare("SELECT id FROM clients WHERE email = ?").bind(proposal.client_email).first();
                if (!existingClient) {
                  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                  let code = '';
                  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
                  await context.env.DB.prepare(
                    "INSERT INTO clients (name, company_name, email, access_code) VALUES (?, ?, ?, ?)"
                  ).bind(proposal.client_name, proposal.company_name || null, proposal.client_email, code).run();
                }
              }

              await sendPushNotification(context.env, {
                title: `✅ Proposal Approved: ${proposal.title}`,
                body: `${proposal.client_name} has approved the proposal.`,
                url: "/admin/proposals",
                icon: "/admin-icon-192.png",
              });

              const adminEmail = context.env.ADMIN_EMAIL || "info@advaitadesigns.com";

              const pdfBuffer = await generateProposalPdf(context.env, proposal);
              const pdfFilename = `${proposal.title.replace(/[^a-zA-Z0-9]/g, "_")}_Signed.pdf`;
              const pdfAttachments = pdfBuffer ? [{ filename: pdfFilename, content: arrayBufferToBase64(pdfBuffer) }] : undefined;

              await sendEmail(context.env, {
                to: adminEmail,
                subject: `Proposal Approved: ${proposal.title} — ${proposal.client_name}`,
                html: `
                  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
                    <h2>Proposal Approved</h2>
                    <p><strong>${proposal.client_name}</strong> has approved <strong>${proposal.title}</strong>.</p>
                    <p>The signed proposal PDF is attached.</p>
                  </div>
                `,
                attachments: pdfAttachments
              });

              if (proposal.client_email) {
                await sendEmail(context.env, {
                  to: proposal.client_email,
                  subject: `Your Signed Proposal: ${proposal.title}`,
                  html: `
                    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
                      <h2>Proposal Accepted</h2>
                      <p>Hi ${proposal.client_name},</p>
                      <p>Thank you for accepting the proposal for <strong>${proposal.title}</strong>.</p>
                      <p>Please find the signed proposal PDF attached to this email for your records.</p>
                      <p>We will be in touch shortly to begin the project.</p>
                      <p style="margin-top:24px">Best regards,<br/>Advaita Creative Studio</p>
                    </div>
                  `,
                  attachments: pdfAttachments
                });
              }
            }
          } catch (err) {
            console.error("Post-approval processing failed:", err);
          }
        }
      } else {
        const res = await context.env.DB.prepare(
          "UPDATE proposals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?"
        ).bind(status, slug).run();
        success = res.success;
      }

      return Response.json({ success });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
