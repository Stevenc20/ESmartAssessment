<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DataSiswaGuruController extends Controller
{
    private function formatKelasDisplay(?string $tingkat, ?string $jurusan, ?string $namaKelasFallback = null): string
    {
        $tingkatStr = trim((string) $tingkat);
        $romanTingkat = '';

        if ($tingkatStr === '10' || strtoupper($tingkatStr) === 'X') {
            $romanTingkat = 'X';
        } elseif ($tingkatStr === '11' || strtoupper($tingkatStr) === 'XI') {
            $romanTingkat = 'XI';
        } elseif ($tingkatStr === '12' || strtoupper($tingkatStr) === 'XII') {
            $romanTingkat = 'XII';
        }

        $jurusanFormatted = '';
        if ($jurusan) {
            $j = trim($jurusan);
            if (in_array(strtoupper($j), ['RPL', 'PPLG', 'RPL_PPLG', 'RPL/PPLG'])) {
                $jurusanFormatted = 'RPL/PPLG';
            } elseif (in_array(strtoupper($j), ['DKV_1', 'DKV 1', 'DKV-1'])) {
                $jurusanFormatted = 'DKV-1';
            } elseif (in_array(strtoupper($j), ['DKV_2', 'DKV 2', 'DKV-2'])) {
                $jurusanFormatted = 'DKV-2';
            } elseif (in_array(strtoupper($j), ['DKV'])) {
                $jurusanFormatted = 'DKV';
            } elseif (in_array(strtoupper($j), ['AKL', 'AKUNTANSI'])) {
                $jurusanFormatted = 'AKL';
            } elseif (in_array(strtoupper($j), ['BISNISRITEL', 'BISNIS RITEL', 'BR', 'BDP'])) {
                $jurusanFormatted = 'Bisnis Ritel';
            } elseif (in_array(strtoupper($j), ['MPLB', 'OTKP', 'AP'])) {
                $jurusanFormatted = 'MPLB';
            } else {
                $jurusanFormatted = $j;
            }
        }

        if ($romanTingkat !== '' && $jurusanFormatted !== '') {
            return "{$romanTingkat}-{$jurusanFormatted}";
        }

        if ($romanTingkat !== '') {
            return $romanTingkat;
        }

        return !empty($namaKelasFallback) ? $namaKelasFallback : '-';
    }

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless(in_array($user->role?->role_name, ['guru', 'admin', 'super_admin'], true), 403);

        $query = User::whereHas('role', function ($q) {
            $q->where('role_name', 'siswa');
        });

        if ($request->filled('kelas_id')) {
            $kelasFilter = $request->kelas_id;
            $query->where(function ($q) use ($kelasFilter) {
                $q->where('kelas', $kelasFilter)
                    ->orWhereHas('kelas', function ($k) use ($kelasFilter) {
                        $k->where('kelas.id', $kelasFilter);
                    });
            });
        }

        if ($request->filled('jurusan')) {
            $query->where('jurusan', $request->jurusan);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        $students = $query->get()->sortBy(function ($siswa) {
            $kelasObj = $siswa->kelas()
                ->whereNull('siswa_kelas.tanggal_keluar')
                ->first() ?? $siswa->kelas()->latest('siswa_kelas.tanggal_masuk')->first();
            $tingkatRaw = (string) ($kelasObj?->tingkat ?? $siswa->kelas ?? '99');
            $tingkatNum = 99;
            if ($tingkatRaw === '10' || strtoupper($tingkatRaw) === 'X') {
                $tingkatNum = 10;
            } elseif ($tingkatRaw === '11' || strtoupper($tingkatRaw) === 'XI') {
                $tingkatNum = 11;
            } elseif ($tingkatRaw === '12' || strtoupper($tingkatRaw) === 'XII') {
                $tingkatNum = 12;
            } elseif (is_numeric($tingkatRaw)) {
                $tingkatNum = (int) $tingkatRaw;
            }

            $jurusan = (string) ($siswa->jurusan ?? '');

            return sprintf('%02d-%s-%s', $tingkatNum, $jurusan, $siswa->name);
        })->values()->map(function ($siswa) {
            $kelasObj = $siswa->kelas()
                ->whereNull('siswa_kelas.tanggal_keluar')
                ->first() ?? $siswa->kelas()->latest('siswa_kelas.tanggal_masuk')->first();
            $namaKelas = $kelasObj?->nama_kelas;
            if (!$namaKelas && is_string($siswa->kelas) && !empty($siswa->kelas)) {
                $namaKelas = $siswa->kelas;
            }

            $jurusan = $siswa->jurusan ?? '-';
            $tingkat = $kelasObj?->tingkat ?? $siswa->kelas;
            $formattedKelas = $this->formatKelasDisplay($tingkat, $jurusan, $namaKelas);

            return [
                'id' => $siswa->id,
                'name' => $siswa->name,
                'email' => $siswa->email,
                'no_hp' => $siswa->no_hp ?? '-',
                'foto' => $siswa->foto ? Storage::url($siswa->foto) : null,
                'kelas_id' => $kelasObj?->id,
                'nama_kelas' => $namaKelas,
                'kelas_formatted' => $formattedKelas,
                'tingkat' => $tingkat,
                'jurusan' => $siswa->jurusan ?? '',
                'status' => $siswa->status ?? 'active',
                'created_at' => $siswa->created_at ? $siswa->created_at->format('d M Y H:i') : '-',
            ];
        });

        $kelasList = Kelas::orderBy('nama_kelas')->get(['id', 'nama_kelas', 'tingkat']);

        return Inertia::render('teacher/data-siswa/index', [
            'students' => $students,
            'kelasList' => $kelasList,
            'filters' => $request->only(['kelas_id', 'jurusan', 'status', 'search']),
        ]);
    }

    public function update(Request $request, User $siswa)
    {
        $user = $request->user();
        abort_unless(in_array($user->role?->role_name, ['guru', 'admin', 'super_admin'], true), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($siswa->id)],
            'no_hp' => ['nullable', 'string', 'max:25'],
            'kelas_id' => ['nullable', 'integer', 'exists:kelas,id'],
            'jurusan' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:active,inactive,suspended'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'no_hp' => $validated['no_hp'] ?? null,
            'status' => $validated['status'],
        ];

        if (!empty($validated['jurusan'])) {
            $updateData['jurusan'] = $validated['jurusan'];
        }

        if (!empty($validated['kelas_id'])) {
            $kelas = Kelas::find($validated['kelas_id']);
            if ($kelas) {
                $updateData['kelas'] = $kelas->tingkat;

                $active = $siswa->kelas()
                    ->whereNull('siswa_kelas.tanggal_keluar')
                    ->first();

                if ($active) {
                    if ($active->id !== $kelas->id) {
                        $siswa->kelas()->updateExistingPivot($active->id, ['tanggal_keluar' => now()->toDateString()]);
                        $siswa->kelas()->attach($kelas->id, ['tanggal_masuk' => now()->toDateString()]);
                    }
                } else {
                    $siswa->kelas()->attach($kelas->id, ['tanggal_masuk' => now()->toDateString()]);
                }
            }
        }

        $siswa->update($updateData);

        return back()->with('success', "Data siswa {$siswa->name} berhasil diperbarui.");
    }
}
