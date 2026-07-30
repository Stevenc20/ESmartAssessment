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
} from 'lucide-react';
import { useCallback } from 'react';

type TiptapEditorProps = {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
};

export default function TiptapEditor({
    content,
    onChange,
    placeholder = 'Tulis konten di sini...',
    editable = true,
}: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: true }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Placeholder.configure({ placeholder }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const addImage = useCallback(() => {
        const url = window.prompt('Masukkan URL gambar:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

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

                <ToolButton onClick={addImage} title="Insert Image">
                    <ImageIcon className="h-4 w-4" />
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
