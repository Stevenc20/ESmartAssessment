import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    LoaderCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';

type TiptapEditorProps = {
    initialContent: string;
    onChange: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
};

export default function TiptapEditor({
    initialContent,
    onChange,
    placeholder = 'Tulis konten di sini...',
    editable = true,
}: TiptapEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const materiId = Number(window.location.pathname.match(/\/materi\/(\d+)/)?.[1]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: true }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Placeholder.configure({ placeholder }),
        ],
        content: initialContent,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    function handleImageClick() {
        if (materiId) {
            fileRef.current?.click();
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !editor || !materiId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(
                `${window.location.origin}/materi/${materiId}/upload-image`,
                { method: 'POST', body: formData },
            );

            if (!res.ok) throw new Error('Upload gagal');

            const data = await res.json();
            editor.chain().focus().setImage({ src: data.url }).run();
        } catch (err) {
            alert('Gagal upload gambar');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    }

    if (!editor) return null;

    const ToolButton = ({
        active,
        onClick,
        children,
        title,
    }: {
        active?: boolean;
        onClick: () => void;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

            <div className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </ToolButton>

                <span className="mx-1 w-px bg-slate-200" />

                <ToolButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolButton>

                <span className="mx-1 w-px bg-slate-200" />

                <ToolButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </ToolButton>

                <span className="mx-1 w-px bg-slate-200" />

                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </ToolButton>

                <span className="mx-1 w-px bg-slate-200" />

                <ToolButton
                    onClick={handleImageClick}
                    title={uploading ? 'Mengupload...' : 'Insert Image'}
                >
                    {uploading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                        <ImageIcon className="h-4 w-4" />
                    )}
                </ToolButton>

                <span className="mx-1 w-px bg-slate-200" />

                <div className="ml-auto flex gap-0.5">
                    <ToolButton
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Undo"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Redo"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolButton>
                </div>
            </div>

            <EditorContent
                editor={editor}
                className="prose prose-slate max-w-none px-4 py-3 focus:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-2"
            />
        </div>
    );
}
