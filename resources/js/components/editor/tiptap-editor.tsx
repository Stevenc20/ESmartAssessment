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
                ? 'bg-slate-300 text-indigo-700 shadow-inner'
                : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        {children}
    </button>
);

export default function TiptapEditor({
    initialContent,
    onChange,
    placeholder = 'Tulis konten di sini...',
    editable = true,
}: TiptapEditorProps) {
    // Force re-renders for active states
    const [updater, setUpdater] = useState(0);
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
        onSelectionUpdate: () => {
            setUpdater(prev => prev + 1); // trigger re-render on selection to ensure active states update
        },
        onTransaction: () => {
            setUpdater(prev => prev + 1);
        },
        editorProps: {
            handlePaste: (view, event, slice) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type.indexOf('image') === 0) {
                        const file = item.getAsFile();
                        if (file && materiId) {
                            setUploading(true);
                            const formData = new FormData();
                            formData.append('image', file);

                            fetch(`${window.location.origin}/materi/${materiId}/upload-image`, {
                                method: 'POST',
                                body: formData,
                            })
                            .then(res => {
                                if (!res.ok) throw new Error('Upload gagal');
                                return res.json();
                            })
                            .then(data => {
                                // Insert the uploaded image URL into the editor
                                view.dispatch(
                                    view.state.tr.replaceSelectionWith(
                                        view.state.schema.nodes.image.create({ src: data.url })
                                    )
                                );
                            })
                            .catch(err => alert('Gagal memproses paste gambar'))
                            .finally(() => setUploading(false));
                            
                            return true; // We handled the paste event
                        }
                    }
                }
                return false;
            }
        }
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
                className="max-w-none px-4 py-3 focus:outline-none 
[&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:leading-relaxed 
[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 
[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3 
[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2 
[&_.ProseMirror_strong]:font-bold [&_.ProseMirror_b]:font-bold 
[&_.ProseMirror_em]:italic [&_.ProseMirror_i]:italic 
[&_.ProseMirror_u]:underline 
[&_.ProseMirror_s]:line-through 
[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-4 
[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-4 
[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-slate-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic 
[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-2"
            />
        </div>
    );
}
