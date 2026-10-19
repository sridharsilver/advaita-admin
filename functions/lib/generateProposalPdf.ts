export async function generateProposalPdf(env: any, proposal: any): Promise<ArrayBuffer | null> {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    console.warn("CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN not set");
    return null;
  }

  try {
    const content = JSON.parse(proposal.content_json || "{}");
    const sections = Array.isArray(content) ? content : (content.sections || []);

    const servicesSection = sections.find((s: any) => s.type === "services");
    const deliverablesSection = sections.find((s: any) => s.type === "deliverables");
    const timelineSection = sections.find((s: any) => s.type === "timeline");
    const pricingSection = sections.find((s: any) => s.type === "pricing");

    const h = (s: string) => (s || "").replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c
    );

    const servicesHtml = servicesSection?.items?.length
      ? servicesSection.items.map((item: any) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${h(item.service || item.name || "")}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">\u20B9${Number(item.price || 0).toLocaleString("en-IN")}</td></tr>`
        ).join("")
      : "";

    const total = pricingSection?.total || servicesSection?.items?.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0) || 0;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  @page { margin: 40px 48px; }
  * { margin: 0; padding: 0; box-sizing: border-box }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; font-size: 14px; line-height: 1.6 }
  .header { text-align: center; padding-bottom: 24px; margin-bottom: 24px; border-bottom: 2px solid #0f172a }
  .header h1 { font-size: 22px; color: #0f172a; margin-bottom: 4px }
  .header p { color: #64748b; font-size: 13px }
  h2 { font-size: 16px; color: #0f172a; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0 }
  .info-grid { display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0 }
  .info-item { flex: 1; min-width: 200px }
  .info-item label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px }
  .info-item p { font-size: 14px; color: #1e293b; font-weight: 500 }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 }
  th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: .5px; border-bottom: 2px solid #e2e8f0 }
  th:last-child { text-align: right }
  .total-row td { font-weight: 700; font-size: 16px; padding: 12px; border-top: 2px solid #0f172a }
  .total-row td:last-child { text-align: right }
  .section-content { white-space: pre-line; color: #475569 }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center }
</style></head>
<body>
  <div class="header">
    <h1>Proposal</h1>
    <p>${h(proposal.title)}</p>
  </div>
  <div class="info-grid">
    <div class="info-item"><label>Prepared for</label><p>${h(proposal.client_name)}</p></div>
    <div class="info-item"><label>Company</label><p>${h(proposal.company_name) || "\u2014"}</p></div>
    <div class="info-item"><label>Date</label><p>${proposal.signature_date ? new Date(proposal.signature_date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}</p></div>
    <div class="info-item"><label>Valid until</label><p>${proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString("en-IN") : "\u2014"}</p></div>
  </div>
  ${servicesSection ? `
  <h2>Scope of Work</h2>
  <table><tr><th>Service</th><th style="text-align:right">Price</th></tr>${servicesHtml}<tr class="total-row"><td>Total</td><td>\u20B9${Number(total).toLocaleString("en-IN")}</td></tr></table>` : ""}
  ${deliverablesSection ? `<h2>Deliverables</h2><div class="section-content">${h(deliverablesSection.content || "")}</div>` : ""}
  ${timelineSection ? `<h2>Timeline</h2><div class="section-content">${h(timelineSection.content || "")}</div>` : ""}
  ${pricingSection ? `<h2>Payment Terms</h2><div class="section-content">${h(pricingSection.content || "")}</div>` : ""}
  <h2>Terms &amp; Conditions</h2>
  <div class="section-content">Payment terms are as agreed upon. This proposal is valid for the period mentioned above. Any additional work outside the scope will be billed separately.</div>
  <h2>Signatures</h2>
  <div style="display:flex;justify-content:space-between;margin-top:16px">
    <div style="flex:1"><p style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">Client</p><p style="margin-top:40px;border-top:1px solid #cbd5e1;padding-top:6px;font-size:14px">${h(proposal.client_name)}</p><p style="font-size:12px;color:#64748b;margin-top:4px">${h(proposal.signature_name || proposal.client_name)}</p></div>
    <div style="flex:1;text-align:right"><p style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">Advaita Designs</p><p style="margin-top:40px;border-top:1px solid #cbd5e1;padding-top:6px;font-size:14px">Authorized Signatory</p><p style="font-size:12px;color:#64748b;margin-top:4px">Advaita Creative Studio</p></div>
  </div>
  <div class="footer">Advaita Creative Studio \u2014 ${new Date().getFullYear()}</div>
</body></html>`;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          pdfOptions: {
            format: "A4",
            printBackground: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("PDF REST API failed:", err);
      return null;
    }

    return response.arrayBuffer();
  } catch (err) {
    console.error("PDF generation failed:", err);
    return null;
  }
}
