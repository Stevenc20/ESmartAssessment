import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminUser, AdminRole } from '@/types/admin';

type PageProps = { user: AdminUser; roles: AdminRole[] };

export default function UsersEdit({ user, roles }: PageProps) {
    const { errors } = usePage().props;
    const { data, setData, put, processing } = useForm({
        name: user.name, email: user.email, password: '',
        role_id: String(user.role_id),
        no_hp: user.no_hp ?? '', status: user.status,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/users/${user.id}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Edit User" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <h1 className="text-xl font-bold">Edit User: {user.name}</h1>
                <Card className="max-w-2xl">
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Nama Lengkap</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div className="col-span-2">
                                <Label>Email</Label>
                                <Input value={data.email} onChange={e => setData('email', e.target.value)} />
                                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <Label>Password (kosongkan jika tidak diubah)</Label>
                                <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
                                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <Label>Role</Label>
                                <Select value={data.role_id} onValueChange={v => setData('role_id', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.role_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.role_id && <p className="text-sm text-red-500 mt-1">{errors.role_id}</p>}
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={v => setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>No. HP</Label>
                                <Input value={data.no_hp} onChange={e => setData('no_hp', e.target.value)} />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>Batal</Button>
                                <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UsersEdit.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Users', href: '/admin/users' }, { title: 'Edit', href: '' }],
};
