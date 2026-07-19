<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Roles ──────────────────────────────────────────
        $roles = ['super_admin', 'admin', 'guru', 'siswa'];
        $roleIds = [];
        foreach ($roles as $name) {
            $roleIds[$name] = DB::table('roles')->where('role_name', $name)->value('id')
                ?? DB::table('roles')->insertGetId([
                    'role_name' => $name,
                    'description' => match ($name) {
                        'super_admin' => 'Full access to all platform features and settings',
                        'admin' => 'Administrative access to manage content and users',
                        'guru' => 'Teacher access for managing classes and assessments',
                        'siswa' => 'Student access for learning and assessments',
                    },
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        }

        $superAdminRoleId = $roleIds['super_admin'];
        $adminRoleId = $roleIds['admin'];
        $guruRoleId = $roleIds['guru'];
        $siswaRoleId = $roleIds['siswa'];

        // ── 2. Helper ──────────────────────────────────────────
        $upsert = function (array $data) {
            $existing = User::where('email', $data['email'])->first();
            if ($existing) {
                $existing->update($data);
                return $existing;
            }
            return User::create($data);
        };

        // ── 3. Super Admin ─────────────────────────────────────
        $upsert([
            'name' => 'Steven Christian',
            'email' => 'superadmin@esmart.test',
            'password' => 'password',
            'role_id' => $superAdminRoleId,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // ── 4. Admin ───────────────────────────────────────────
        $upsert([
            'name' => 'Admin User',
            'email' => 'admin@esmart.test',
            'password' => 'password',
            'role_id' => $adminRoleId,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // ── 5. Guru ────────────────────────────────────────────
        $guruList = [
            ['Budi Santoso', 'budi@esmart.test'],
            ['Siti Rahmawati', 'siti@esmart.test'],
            ['Ahmad Fauzi', 'ahmad@esmart.test'],
        ];
        foreach ($guruList as [$name, $email]) {
            $upsert([
                'name' => $name,
                'email' => $email,
                'password' => 'password',
                'role_id' => $guruRoleId,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }

        // ── 6. Siswa ───────────────────────────────────────────
        $siswaList = [
            ['Ahmad Rizki', 'ahmadrizki@esmart.test'],
            ['Dewi Lestari', 'dewi@esmart.test'],
            ['Fajar Nugroho', 'fajar@esmart.test'],
            ['Siti Nurhaliza', 'sitinur@esmart.test'],
            ['Bagas Pratama', 'bagas@esmart.test'],
        ];
        foreach ($siswaList as [$name, $email]) {
            $upsert([
                'name' => $name,
                'email' => $email,
                'password' => 'password',
                'role_id' => $siswaRoleId,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }

        // ── 7. Update existing test@example.com ────────────────
        $testUser = User::where('email', 'test@example.com')->first();
        if ($testUser && !$testUser->role_id) {
            $testUser->update([
                'role_id' => $siswaRoleId,
                'status' => 'active',
            ]);
        }

        $this->command->info('Roles & users seeded successfully!');
        $this->command->info('Super Admin: superadmin@esmart.test / password');
    }
}
