"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, ImagePlus, Italic, List, ListOrdered } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@heroui/react";

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
      StarterKit,
      Image.configure({ allowBase64: true }),
      Placeholder.configure({
        placeholder: "Write your Bunny Radio anniversary note…",
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "capsule-editor min-h-48 max-h-[420px] overflow-y-auto px-4 py-3 focus:outline-none text-[var(--foreground)]",
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
    <div className="overflow-hidden rounded-2xl border border-pink-200/80 bg-white/80 shadow-sm backdrop-blur">
      <div className="flex flex-wrap gap-1 border-b border-pink-100 bg-pink-50/80 p-2">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bold") ? "primary" : "ghost"}
          onPress={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("italic") ? "primary" : "ghost"}
          onPress={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bulletList") ? "primary" : "ghost"}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("orderedList") ? "primary" : "ghost"}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button isIconOnly size="sm" variant="ghost" onPress={addImage} aria-label="Add image">
          <ImagePlus className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
