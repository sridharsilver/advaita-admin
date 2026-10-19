export interface EmailAttachment {
  filename: string;
  content: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(env: any, options: EmailOptions) {
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const SENDER_EMAIL = env.SENDER_EMAIL || "onboarding@resend.dev";

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent:", options.subject);
    return false;
  }

  try {
    const payload: any = {
      from: `Advaita Designs <${SENDER_EMAIL}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    };

    if (options.attachments?.length) {
      payload.attachments = options.attachments;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email via Resend:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
