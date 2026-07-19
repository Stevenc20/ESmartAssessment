export type AdminUser = {
    id: number;
    name: string;
    email: string;
    no_hp?: string;
    foto?: string;
    status: 'active' | 'inactive' | 'suspended';
    role_id: number;
    role?: { id: number; role_name: string; description?: string };
    created_at: string;
    updated_at: string;
};

export type AdminRole = {
    id: number;
    role_name: string;
    description?: string;
    permissions?: AdminPermission[];
    users_count?: number;
    created_at: string;
};

export type AdminPermission = {
    id: number;
    permission_name: string;
    module: string;
    created_at: string;
};

export type AdminTahunAjaran = {
    id: number;
    tahun: string;
    status: 'active' | 'inactive';
    kelas_count?: number;
    created_at: string;
};

export type AdminKelas = {
    id: number;
    nama_kelas: string;
    tingkat: string;
    tahun_ajaran_id: number;
    tahun_ajaran?: AdminTahunAjaran;
    siswa_count?: number;
    created_at: string;
};

export type AdminLog = {
    id: number;
    user_id: number;
    user_name?: string;
    activity: string;
    ip_address?: string;
    created_at: string;
};

export type AdminAnnouncement = {
    id: number;
    judul: string;
    isi: string;
    target_role?: string;
    created_by: number;
    creator?: { id: number; name: string };
    created_at: string;
};

export type AdminBackup = {
    filename: string;
    size: string;
    created_at: string;
};

export type AdminInactiveStudent = {
    id: number;
    siswa_id: number;
    siswa?: { id: number; name: string; email: string };
    alasan?: string;
    tanggal_nonaktif: string;
    status: string;
    created_at: string;
};

export type AdminStats = {
    totalUsers: number;
    totalSiswa: number;
    totalGuru: number;
    totalAdmin: number;
    totalKelas: number;
    totalTahunAjaran: number;
    totalAnnouncements: number;
    totalLogs: number;
    recentUsers: AdminUser[];
    recentLogs: AdminLog[];
};
