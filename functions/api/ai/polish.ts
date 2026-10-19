export interface Env {
  AI: any;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    const systemPrompt = `You are a professional copywriter for a premium creative studio called Advaita Designs. Your task is to polish rough notes into beautifully structured, professional HTML content for a client proposal.

Rules:
- Return ONLY valid HTML (no markdown, no code fences, no extra text).
- Use <p> tags for paragraphs.
- Use <strong> for emphasis on important words or phrases.
- Use <br> for line breaks where appropriate.
- Keep the tone professional, polished, and compelling.
- Preserve all key information and intent from the original notes.
- Structure the content logically with clear paragraphs.`;

    const result = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Polish the following rough notes into professional HTML content:\n\n${text}` }
      ]
    });

    const polished = (result as any).response.trim();

    return Response.json({ polished });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
