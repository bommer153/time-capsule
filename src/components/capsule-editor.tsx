"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, ImagePlus, Italic } from "lucide-react";
import { useEffect } from "react";

type CapsuleEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export function CapsuleEditor({ value, onChange }: CapsuleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({
        placeholder: "Write your note…",
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "capsule-editor min-h-36 max-h-72 overflow-y-auto px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current && value === "<p></p>") {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  async function addImage() {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/gif,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 1.3 * 1024 * 1024) {
        alert("Please keep each image under ~1.3MB.");
        return;
      }
      const src = await readFileAsDataUrl(file);
      editor.chain().focus().setImage({ src, alt: file.name }).run();
    };
    input.click();
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-pink-200 bg-white">
      <div className="flex items-center gap-0.5 border-b border-pink-100 px-1.5 py-1">
        <button
          type="button"
          className={`rounded-md p-1.5 ${editor.isActive("bold") ? "bg-pink-100 text-pink-700" : "text-pink-800/70 hover:bg-pink-50"}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={`rounded-md p-1.5 ${editor.isActive("italic") ? "bg-pink-100 text-pink-700" : "text-pink-800/70 hover:bg-pink-50"}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded-md p-1.5 text-pink-800/70 hover:bg-pink-50"
          onClick={addImage}
          aria-label="Add image"
        >
          <ImagePlus className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
