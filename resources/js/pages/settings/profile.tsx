import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import DeleteUser from '@/components/settings/delete-user';
import Heading from '@/components/settings/heading';
import InputError from '@/components/settings/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    mustVerifyEmail?: boolean;
    status?: string;
};

export default function Profile() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        name: user.name ?? '',
        email: user.email ?? '',
        no_hp: (user as any).no_hp ?? '',
        foto: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/profile', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Profile Settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name, email address, and profile photo"
                />

                <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                    {/* Foto Profile Upload */}
                    <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                        <div className="relative group">
                            <Avatar className="h-20 w-20 border-2 border-slate-200 shadow-xs">
                                <AvatarImage
                                    src={previewUrl ?? (user as any).avatar ?? undefined}
                                    alt={user.name}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-slate-200 text-lg font-bold text-slate-700">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
                                title="Ubah Foto"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div>
                            <p className="text-sm font-bold text-slate-800">Foto Profil</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Format JPG, PNG, atau WEBP (Maksimal 2MB)
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 text-xs font-semibold gap-1.5"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Unggah Foto Baru
                            </Button>
                        </div>
                    </div>
                    {errors.foto && <InputError message={errors.foto} />}

                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Nama Lengkap"
                            className="bg-white"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="Alamat Email"
                            className="bg-white"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* No HP */}
                    <div className="grid gap-2">
                        <Label htmlFor="no_hp">No. Telepon / WhatsApp</Label>
                        <Input
                            id="no_hp"
                            type="text"
                            value={data.no_hp}
                            onChange={(e) => setData('no_hp', e.target.value)}
                            placeholder="Contoh: 081234567890"
                            className="bg-white"
                        />
                        <InputError message={errors.no_hp} />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <Button disabled={processing} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile Settings',
            href: '/settings/profile',
        },
    ],
};
