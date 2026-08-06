import { Folder, FolderPlus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export type PickedFolder = {
    id: number;
    nama: string;
    files: File[];
};

export default function MateriFolderUpload({
    folders,
    onChange,
}: {
    folders: PickedFolder[];
    onChange: (folders: PickedFolder[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    function pick(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const rel = files[0].webkitRelativePath || files[0].name;
        const root = rel.split('/')[0];
        const nama = root || 'Folder';
        const id = Date.now() + Math.floor(Math.random() * 1000);

        onChange([...folders, { id, nama, files }]);
        if (inputRef.current) inputRef.current.value = '';
    }

    function remove(id: number) {
        onChange(folders.filter((f) => f.id !== id));
    }

    return (
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-bold text-amber-900">
                        Folder Materi
                    </h3>
                    <p className="text-xs text-amber-700">
                        Pilih folder dari komputer — semua isi + subfolder ikut
                        ter-upload. Siswa tinggal klik download (.zip).
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={pick}
                    {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    className="text-xs font-semibold"
                >
                    <FolderPlus className="h-3.5 w-3.5" />
                    Pilih Folder
                </Button>

                {folders.length > 0 && (
                    <ul className="space-y-2">
                        {folders.map((f) => (
                            <li
                                key={f.id}
                                className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs"
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    <Folder className="h-4 w-4 shrink-0 text-amber-600" />
                                    <span className="truncate font-semibold text-slate-700">
                                        {f.nama}
                                    </span>
                                    <span className="shrink-0 text-slate-400">
                                        {f.files.length} file
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => remove(f.id)}
                                    className="shrink-0 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
