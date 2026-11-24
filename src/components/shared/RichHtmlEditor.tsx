"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * RichHtmlEditor built with Tiptap.
 * Strictly adheres to Django backend bleach-allowed tags:
 * p, br, strong, b, i, em, u, ul, ol, li, h2, h3, blockquote (all attributes stripped)
 */
export function RichHtmlEditor({
  value,
  onChange,
  placeholder = "Explain service scope, steps, tools, warranty, and exclusions...",
  className,
}: RichHtmlEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-5 my-2 space-y-1",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-5 my-2 space-y-1",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-teal-700 pl-4 py-1 italic my-2 text-stone-700 bg-stone-50 rounded-r-lg",
          },
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[160px] max-h-[360px] overflow-y-auto px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 focus:outline-none leading-relaxed",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-stone-900 [&_h2]:my-2",
          "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-stone-900 [&_h3]:my-1.5",
          "[&_p]:my-1.5 [&_p.is-editor-empty:first-child::before]:text-stone-400 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:h-0"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor only has an empty paragraph, pass empty string
      if (html === "<p></p>") {
        onChange("");
      } else {
        onChange(html);
      }
    },
  });

  // Sync external value if changed externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (value === "" && editor.getHTML() === "<p></p>") return;
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="h-40 rounded-xl border border-stone-200 bg-stone-50/50 animate-pulse" />
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/20 transition-all",
        className
      )}
    >
      {/* Sanitized Toolbar (Bleach allowed tags only) */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-50/90 border-b border-stone-200 text-stone-600">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-0.5",
            editor.isActive("heading", { level: 2 })
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Heading 2 (<h2>)"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-0.5",
            editor.isActive("heading", { level: 3 })
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Heading 3 (<h3>)"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />

        {/* Inline Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded-lg text-xs font-semibold transition-colors",
            editor.isActive("bold")
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Bold (<strong>)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded-lg text-xs italic transition-colors",
            editor.isActive("italic")
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Italic (<em>)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded-lg text-xs underline transition-colors",
            editor.isActive("underline")
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Underline (<u>)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded-lg text-xs transition-colors",
            editor.isActive("bulletList")
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Bullet List (<ul><li>)"
        >
          <List className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded-lg text-xs transition-colors",
            editor.isActive("orderedList")
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Numbered List (<ol><li>)"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "p-1.5 rounded-lg text-xs transition-colors",
            editor.isActive("blockquote")
              ? "bg-teal-800 text-white shadow-sm"
              : "hover:bg-stone-200/70 text-stone-700"
          )}
          title="Blockquote (<blockquote>)"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-xs text-stone-500 hover:bg-stone-200/70 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-xs text-stone-500 hover:bg-stone-200/70 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Surface */}
      <EditorContent editor={editor} />
    </div>
  );
}
