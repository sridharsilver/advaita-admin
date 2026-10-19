import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

function Markdown({ content, isUser }: { content: string; isUser: boolean }) {
  const html = useMemo(() => {
    if (isUser) return content;
    const lines = content.split("\n");
    const out: string[] = [];
    let inList = false;

    for (const raw of lines) {
      let line = raw
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.+?)`/g, "<code>$1</code>");

      const isBullet = /^\s*[-*]\s+(.+)/.test(line);
      const isNumbered = /^\s*\d+[.)]\s+(.+)/.test(line);

      if (isBullet || isNumbered) {
        const text = line.replace(/^\s*(?:[-*]\s+|\d+[.)]\s+)/, "");
        if (!inList) { out.push('<ul class="chat-list">'); inList = true; }
        out.push(`<li>${text}</li>`);
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        if (line.trim() === "") {
          out.push("<br/>");
        } else {
          out.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) out.push("</ul>");

    return out.join("\n");
  }, [content, isUser]);

  return (
    <>
      <style>{`
        .chat-list { list-style: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
        .chat-list li { margin-bottom: 0.25rem; }
        .md-content p { margin-bottom: 0.25rem; }
        .md-content strong { font-weight: 600; }
        .md-content code {
          background: var(--color-muted, #f1f5f9);
          padding: 0.125rem 0.375rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
        }
      `}</style>
      <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "What services do you offer?",
  "How can I get a quote?",
  "What's your design process?",
  "Do you work with international clients?",
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm the Advaita AI assistant. Ask me anything about our services, process, or portfolio." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Request failed");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[360px] sm:w-[400px] h-[560px] glass-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Advaita AI</p>
                  <p className="text-[11px] text-muted-foreground">Powered by Advaita Designs</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-brand text-primary-foreground rounded-br-md"
                        : "glass rounded-bl-md"
                    }`}
                  >
                    <Markdown content={msg.content} isUser={msg.role === "user"} />
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              {messages.length === 1 && !loading && (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1">Quick questions</p>
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="w-full text-left glass hover:bg-muted/80 text-sm px-3.5 py-2.5 rounded-xl transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2 glass rounded-2xl px-3 py-1.5"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm outline-none py-2 placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0 transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-40 disabled:hover:shadow-none"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="h-14 w-14 rounded-2xl bg-gradient-brand text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center transition-shadow hover:shadow-2xl hover:shadow-primary/30"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
    </>
  );
}
