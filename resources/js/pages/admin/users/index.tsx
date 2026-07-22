import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { AdminUser, AdminRole } from '@/types/admin';

type PageProps = {
    users: { data: AdminUser[] };
    roles: AdminRole[];
    filters?: { search?: string; role_id?: string };
};

export default function UsersIndex({ users, roles, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role_id ?? '');
    const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

    function doSearch(e: React.FormEvent) {
        e.preventDefault();
        const params: Record<string, string> = {};

        if (search) {
params.search = search;
}

        if (roleFilter) {
params.role_id = roleFilter;
}

        router.get('/admin/users', params, {
            preserveState: true,
            replace: true,
        });
    }

    function confirmDeactivate() {
        if (!deactivateTarget) {
return;
}

        router.delete(`/admin/users/${deactivateTarget.id}`, {
            preserveScroll: true,
        });
        setDeactivateTarget(null);
    }

    function confirmDelete() {
        if (!deleteTarget) {
return;
}

        router.delete(`/admin/users/${deleteTarget.id}/force`, {
            preserveScroll: true,
        });
        setDeleteTarget(null);
    }

    function restore(userId: number) {
        router.post(
            `/admin/users/${userId}/restore`,
            {},
            { preserveScroll: true },
        );
    }

    const statusVariant = (s: string) =>
        s === 'active'
            ? 'default'
            : s === 'suspended'
              ? ('destructive' as const)
              : ('secondary' as const);

    return (
        <>
            <Head title="Management Users" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Management Users</h1>
                    <Button onClick={() => router.visit('/admin/users/create')}>
                        Tambah User
                    </Button>
                </div>

                <form onSubmit={doSearch} className="flex gap-2">
                    <Input
                        placeholder="Cari nama/email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-48"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="h-9 rounded-md border px-3 text-sm"
                    >
                        <option value="">Semua Role</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.role_name}
                            </option>
                        ))}
                    </select>
                    <Button type="submit" variant="outline">
                        Filter
                    </Button>
                </form>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="p-3 font-medium">Nama</th>
                                    <th className="p-3 font-medium">Email</th>
                                    <th className="p-3 font-medium">Role</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b last:border-0 hover:bg-muted/50"
                                    >
                                        <td className="p-3 font-medium">
                                            {user.name}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="outline">
                                                {user.role?.role_name ?? '-'}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <Badge
                                                variant={statusVariant(
                                                    user.status,
                                                )}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/admin/users/${user.id}/edit`,
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                {user.status === 'inactive' ? (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                restore(user.id)
                                                            }
                                                        >
                                                            Aktifkan
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    user,
                                                                )
                                                            }
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDeactivateTarget(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        Nonaktifkan
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            Belum ada user.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={!!deactivateTarget}
                onOpenChange={() => setDeactivateTarget(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nonaktifkan User</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menonaktifkan user{' '}
                            <strong>{deactivateTarget?.name}</strong>? User ini
                            tidak dapat masuk sampai diaktifkan kembali.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeactivateTarget(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeactivate}
                        >
                            Nonaktifkan
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus User Permanen</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus user{' '}
                            <strong>{deleteTarget?.name}</strong> secara
                            permanen? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
    ],
};
