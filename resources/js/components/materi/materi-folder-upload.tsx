import { FileText, Folder, FolderPlus, Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export type PickedFile = {
    id: number;
    nama: string;
    size: number;
    file: File;
};

export type PickedFolder = {
    id: number;
    nama: string;
    files: File[];
};

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function MateriFolderUpload({
    folders,
    files,
    onFoldersChange,
    onFilesChange,
}: {
    folders: PickedFolder[];
    files: PickedFile[];
    onFoldersChange: (folders: PickedFolder[]) => void;
    onFilesChange: (files: PickedFile[]) => void;
}) {
    const folderInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function pickFolder(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        if (picked.length === 0) return;

        const rel = picked[0].webkitRelativePath || picked[0].name;
        const root = rel.split('/')[0];
        const nama = root || 'Folder';
        const id = Date.now() + Math.floor(Math.random() * 1000);

        onFoldersChange([...folders, { id, nama, files: picked }]);
        if (folderInputRef.current) folderInputRef.current.value = '';
    }

    function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        if (picked.length === 0) return;

        const items: PickedFile[] = picked.map((file) => ({
            id: Date.now() + Math.floor(Math.random() * 1000),
            nama: file.name,
            size: file.size,
            file,
        }));

        onFilesChange([...files, ...items]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function removeFolder(id: number) {
        onFoldersChange(folders.filter((f) => f.id !== id));
    }

    function removeFile(id: number) {
        onFilesChange(files.filter((f) => f.id !== id));
    }

    return (
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-bold text-amber-900">
                        Lampiran (File & Folder)
                    </h3>
                    <p className="text-xs text-amber-700">
                        Upload file satu per satu atau seluruh folder — siswa bisa
                        download per file atau folder (.zip).
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={pickFiles}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Pilih File
                    </Button>
                    <input
                        ref={folderInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={pickFolder}
                        {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => folderInputRef.current?.click()}
                        className="text-xs font-semibold"
                    >
                        <FolderPlus className="h-3.5 w-3.5" />
                        Pilih Folder
                    </Button>
                </div>

                {files.length > 0 && (
                    <ul className="space-y-2">
                        {files.map((f) => (
                            <li
                                key={f.id}
                                className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs"
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    <FileText className="h-4 w-4 shrink-0 text-amber-600" />
                                    <span className="truncate font-semibold text-slate-700">
                                        {f.nama}
                                    </span>
                                    <span className="shrink-0 text-slate-400">
                                        {formatBytes(f.size)}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(f.id)}
                                    className="shrink-0 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

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
                                    onClick={() => removeFolder(f.id)}
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
