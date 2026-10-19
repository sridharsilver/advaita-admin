import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, Quote, Link as LinkIcon, Image, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Pilcrow
} from "lucide-react";
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-indigo-600 underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageExtension.configure({ inline: true }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[120px] px-3 py-2.5 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_p]:mb-1",
      },
    },
  });

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = (active?: boolean) =>
    `p-1.5 rounded-md text-xs transition border ${
      active
        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
        : "text-slate-500 hover:bg-slate-100 border-transparent hover:border-slate-200"
    }`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-slate-100 bg-slate-50/50">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="Underline">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive("heading", { level: 1 }))} title="Heading 1">
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} title="Heading 2">
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().setParagraph().run()} className={btnClass(editor.isActive("paragraph"))} title="Paragraph">
          <Pilcrow className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="Bullet List">
          <List className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="Ordered List">
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} title="Quote">
          <Quote className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btnClass(editor.isActive({ textAlign: "left" }))} title="Align Left">
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btnClass(editor.isActive({ textAlign: "center" }))} title="Align Center">
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btnClass(editor.isActive({ textAlign: "right" }))} title="Align Right">
          <AlignRight className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <button onClick={addLink} className={btnClass(editor.isActive("link"))} title="Link">
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button onClick={addImage} className={btnClass()} title="Image">
          <Image className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <button onClick={() => editor.chain().focus().undo().run()} className={btnClass()} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className={btnClass()} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
