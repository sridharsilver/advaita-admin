export interface Env {
  AI: any;
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseContentLines(text: string): string {
  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
  return lines.map((l: string) => `<p>${l}</p>`).join('\n');
}

function parseSections(raw: string, result: { title?: string }): any[] {
  const sections: any[] = [];
  const sectionRegex = /##\s*(\w+)\s*##\s*([\s\S]*?)(?=##\s*\w+\s*##|$)/g;
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(raw)) !== null) {
    const type = match[1].trim();
    const body = match[2].trim();
    if (!type) continue;

    if (type === 'meta') {
      const titleMatch = body.match(/^Title:\s*(.+)$/m);
      if (titleMatch) result.title = titleMatch[1].trim();
      continue;
    }

    const section: any = { type };

    const titleMatch = body.match(/^Title:\s*(.+)$/m);
    if (titleMatch) section.title = titleMatch[1].trim();

    const contentMatch = body.match(/^Content:\s*([\s\S]*?)(?=^Items:|$)/m);
    if (contentMatch) {
      section.content = parseContentLines(contentMatch[1]);
    }

    const itemsSection = body.match(/^Items:\s*([\s\S]*?)$/m);
    if (itemsSection) {
      const itemLines = itemsSection[1].trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
      const items: any[] = [];

      for (const line of itemLines) {
        if (!line || line.startsWith('-')) continue;
        const parts = line.split('|').map((p: string) => p.trim());
        if (parts.length >= 2) {
          if (type === 'goals' || type === 'scope') {
            items.push({ title: parts[0], description: parts.slice(1).join(' | ') });
          } else if (type === 'deliverables') {
            items.push({ name: parts[0], detail: parts.slice(1).join(' | ') });
          } else if (type === 'process') {
            items.push({ step: parts[0], name: parts[1], desc: parts.slice(2).join(' ') || '' });
          } else if (type === 'timeline') {
            items.push({ milestone: parts[0], duration: parts.slice(1).join(' | ') });
          } else if (type === 'pricing') {
            if (parts.length >= 3) {
              items.push({ name: parts[0], price: parsePrice(parts[1]), features: parts[2].split(',').map((f: string) => f.trim()) });
            } else {
              items.push({ name: parts[0], price: parsePrice(parts[1]), features: [] });
            }
          } else {
            items.push({ title: parts[0], description: parts.slice(1).join(' | ') });
          }
        }
      }

      if (items.length > 0) section.items = items;
    }

    // If pricing section has Content but no Items, auto-create an item from content
    if (type === 'pricing' && section.content && !section.items) {
      const contentText = section.content.replace(/<\/?p>/g, '').trim();
      section.items = [{
        name: section.title || 'Professional Fee',
        price: parsePrice(contentText),
        features: contentText.split(/[•\n,;]/).map((f: string) => f.trim()).filter(Boolean)
      }];
    }

    sections.push(section);
  }

  return sections;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    const systemPrompt = `You are a proposal generation AI for a premium creative studio. Analyze raw notes and output structured section data.

Output format for each section (use EXACTLY this format):

## meta ##
Title: Proposal for Book Pagination & Interior Layout
## about ##
Title: About Us
Content:
Advaita Designs is a premium creative studio...
We specialize in web design and branding.
## understanding ##
Title: Project Understanding
Content:
We understand your need for a modern digital presence.
## goals ##
Title: Goals & Objectives
Items:
Brand Elevation | Establish a premium digital presence
Performance | Achieve fast loading speeds
## scope ##
Title: Scope of Work
Items:
UI/UX Design | Figma mockups for all pages
Development | React and Tailwind implementation
## deliverables ##
Title: Key Deliverables
Items:
Responsive Website | Pixel-perfect across all devices
Brand Assets | Logo and identity guide
## process ##
Title: Our Process
Items:
Discovery | Research | User interviews and competitor analysis
Design | UI/UX | High-fidelity mockups and prototyping
## timeline ##
Title: Project Timeline
Items:
Design Phase | Weeks 1-2
Development Phase | Weeks 3-6
## pricing ##
Title: Pricing Packages
Items:
Book Layout Design | 25000 | Complete pagination, Typography styling, Print-ready PDF, 2 revision rounds
## terms ##
Title: Terms & Conditions
Content:
50% advance payment required to initiate the project.
50% due upon final approval before delivery of source files.
Additional revisions may be charged separately.
## contact ##
Title: Ready to Start?
Content:
Click Accept to begin the engagement.

RULES:
- Use ## section_type ## as separators between sections.
- Start each section with ## type ## on its own line.
- After Content: each line is a separate paragraph.
- After Items: each line is pipe-separated values with NO pipes in the values.
- Use single quotes for any quoted text, never double quotes.
- Only include sections that are relevant to the notes.
- Write professionally and compellingly.
- ALWAYS include a pricing section when notes mention fees, budget, costs, or prices.
- For pricing, use plain numbers (no currency symbols, no commas). Example: 25000 not ₹25,000.
- For pricing, feature list is comma-separated. Example: Feature 1, Feature 2, Feature 3`;

    const result = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Convert these notes into the section format described above:\n\n${text}` }
      ]
    });

    const raw = (result as any).response.trim();
    const meta = {};
    const sections = parseSections(raw, meta);

    if (sections.length === 0) {
      const first200 = raw.slice(0, 200);
      return Response.json({ error: `AI didn't produce valid sections. Response: ${first200}...` }, { status: 500 });
    }

    return Response.json({ sections, title: (meta as any).title });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
