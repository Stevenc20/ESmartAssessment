import { Head, useForm } from '@inertiajs/react';
import {
    UserCheck,
    User,
    Mail,
    GraduationCap,
    BookOpen,
    Sparkles,
    Phone,
    Camera,
} from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/settings/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

const JURUSAN_LIST = [
    { value: 'PPLG', label: 'PPLG' },
    { value: 'DKV_1', label: 'DKV 1' },
    { value: 'DKV_2', label: 'DKV 2' },
    { value: 'AKL', label: 'AKL' },
    { value: 'MPLB', label: 'MPLB' },
    { value: 'BisnisRitel', label: 'Bisnis Ritel' },
] as const;

type Props = {
    googleUser: {
        google_id: string;
        name: string;
        email: string;
        avatar?: string;
    };
};

export default function CompleteRegistration({ googleUser }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: googleUser.name,
        no_hp: '',
        foto: null as File | null,
        kelas: '',
        jurusan: '',
    });

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function compressImage(file: File): Promise<File> {
        return new Promise((resolve) => {
            const maxDim = 800;
            const quality = 0.7;
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                let { width, height } = img;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height / width) * maxDim);
                        width = maxDim;
                    } else {
                        width = Math.round((width / height) * maxDim);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        const compressed = new File([blob!], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        URL.revokeObjectURL(url);
                        resolve(compressed);
                    },
                    'image/jpeg',
                    quality,
                );
            };
            img.src = url;
        });
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;

        if (!file) {
            setData('foto', null);
            setPreview(null);

            return;
        }

        const compressed = await compressImage(file);
        setData('foto', compressed);
        setPreview(URL.createObjectURL(compressed));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/register/complete', {
            forceFormData: true,
        });
    }

    const isFormComplete = data.kelas !== '' && data.jurusan !== '';

    return (
        <>
            <Head title="Lengkapi Data" />

            {/* Profile Header */}
            <div className="auth-profile-header">
                <div className="auth-profile-avatar-ring">
                    {googleUser.avatar ? (
                        <img
                            src={googleUser.avatar}
                            alt={googleUser.name}
                            className="auth-profile-avatar-img"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="auth-profile-avatar-fallback">
                            {googleUser.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="auth-profile-info">
                    <span className="auth-profile-name">{googleUser.name}</span>
                    <span className="auth-profile-email">
                        {googleUser.email}
                    </span>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="auth-step-indicator">
                <div className="auth-step completed">
                    <div className="auth-step-dot">
                        <UserCheck className="auth-step-icon" />
                    </div>
                    <span className="auth-step-label">Akun Google</span>
                </div>
                <div className="auth-step-connector" />
                <div
                    className={`auth-step ${isFormComplete ? 'completed' : 'active'}`}
                >
                    <div className="auth-step-dot">
                        <BookOpen className="auth-step-icon" />
                    </div>
                    <span className="auth-step-label">Data Diri</span>
                </div>
                <div className="auth-step-connector" />
                <div className="auth-step pending">
                    <div className="auth-step-dot">
                        <Sparkles className="auth-step-icon" />
                    </div>
                    <span className="auth-step-label">Mulai</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid gap-5">
                    {/* Name Input — Editable */}
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="auth-field-label">
                            <User className="auth-label-icon" />
                            Nama Lengkap
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            tabIndex={0}
                            placeholder="Nama lengkap Anda"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email — Readonly */}
                    <div className="auth-readonly-group">
                        <div className="auth-readonly-field">
                            <Mail className="auth-readonly-icon" />
                            <div className="auth-readonly-content">
                                <span className="auth-readonly-label">
                                    Email
                                </span>
                                <span className="auth-readonly-value">
                                    {googleUser.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* No HP */}
                    <div className="grid gap-2">
                        <Label htmlFor="no_hp" className="auth-field-label">
                            <Phone className="auth-label-icon" />
                            No. HP
                        </Label>
                        <Input
                            id="no_hp"
                            type="tel"
                            name="no_hp"
                            value={data.no_hp}
                            onChange={(e) => setData('no_hp', e.target.value)}
                            tabIndex={1}
                            placeholder="Nomor handphone"
                        />
                        <InputError message={errors.no_hp} />
                    </div>

                    {/* Foto Profile */}
                    <div className="grid gap-2">
                        <Label className="auth-field-label">
                            <Camera className="auth-label-icon" />
                            Foto Profile
                        </Label>
                        <div
                            className="auth-upload-area cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="auth-upload-preview"
                                />
                            ) : (
                                <div className="auth-upload-placeholder">
                                    <Camera className="auth-upload-icon" />
                                    <span>Klik untuk upload foto</span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <InputError message={errors.foto} />
                    </div>

                    {/* Editable Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="kelas" className="auth-field-label">
                                <GraduationCap className="auth-label-icon" />
                                Kelas
                            </Label>
                            <Select
                                value={data.kelas}
                                onValueChange={(v) => setData('kelas', v)}
                            >
                                <SelectTrigger id="kelas" tabIndex={1}>
                                    <SelectValue placeholder="Pilih kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">Kelas 10</SelectItem>
                                    <SelectItem value="11">Kelas 11</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.kelas} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="jurusan"
                                className="auth-field-label"
                            >
                                <BookOpen className="auth-label-icon" />
                                Jurusan
                            </Label>
                            <Select
                                value={data.jurusan}
                                onValueChange={(v) => setData('jurusan', v)}
                            >
                                <SelectTrigger id="jurusan" tabIndex={2}>
                                    <SelectValue placeholder="Pilih jurusan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {JURUSAN_LIST.map((j) => (
                                        <SelectItem
                                            key={j.value}
                                            value={j.value}
                                        >
                                            {j.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.jurusan} />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        tabIndex={3}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Simpan & Mulai
                    </Button>
                </div>
            </form>
        </>
    );
}

CompleteRegistration.layout = {
    title: 'Lengkapi Data Diri',
    description: 'Isi data tambahan untuk melengkapi profil Anda',
};
