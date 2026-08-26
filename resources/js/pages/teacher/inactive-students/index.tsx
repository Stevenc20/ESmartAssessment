import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserX } from "lucide-react";

type InactiveStudent = {
    id: number;
    siswa_id: number;
    name: string;
    kelas: string;
    tanggal_nonaktif: string;
    alasan: string;
    status: string;
};

export default function InactiveStudentsIndex({ inactiveStudents }: { inactiveStudents: InactiveStudent[] }) {
    return (
        <>
            <Head title="Siswa Pasif (Otomatis Dinonaktifkan)" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Siswa Pasif</h1>
                        <p className="text-sm text-slate-500">Daftar siswa yang dinonaktifkan otomatis oleh sistem</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5 text-red-500" />
                            Daftar Siswa Non-Aktif (Otomatis)
                        </CardTitle>
                        <CardDescription>
                            Siswa-siswa di bawah ini telah dinonaktifkan karena aktivitas belajar dan kehadiran yang sangat rendah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {inactiveStudents.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 border border-dashed border-slate-200 rounded-lg">
                                Tidak ada siswa yang dinonaktifkan secara otomatis saat ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border border-slate-200">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold border-b">Nama Siswa</th>
                                            <th className="px-4 py-3 font-semibold border-b">Kelas</th>
                                            <th className="px-4 py-3 font-semibold border-b">Tanggal Nonaktif</th>
                                            <th className="px-4 py-3 font-semibold border-b">Alasan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {inactiveStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{student.name ?? "Tidak diketahui"}</td>
                                                <td className="px-4 py-3">{student.kelas ?? "-"}</td>
                                                <td className="px-4 py-3">{student.tanggal_nonaktif}</td>
                                                <td className="px-4 py-3 max-w-[250px] truncate" title={student.alasan}>
                                                    {student.alasan}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Siswa Pasif", href: "/guru/siswa-pasif" },
];

InactiveStudentsIndex.layout = { breadcrumbs };
