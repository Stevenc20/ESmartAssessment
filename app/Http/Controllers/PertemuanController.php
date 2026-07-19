<?php

namespace App\Http\Controllers;

use App\Models\Pertemuan;
use App\Models\Roadmap;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PertemuanController extends Controller
{
    public function index()
    {
        $roadmaps = Roadmap::with(['pertemuan' => fn ($q) => $q->orderBy('urutan')])
            ->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'judul' => $r->judul,
                'bulan' => $r->bulan,
                'tahun' => $r->tahun,
                'bulan_nama' => $this->bulanNama($r->bulan),
                'pertemuan' => $r->pertemuan->map(fn ($p) => [
                    'id' => $p->id,
                    'judul' => $p->judul,
                    'urutan' => $p->urutan,
                    'tanggal' => $p->tanggal?->format('Y-m-d'),
                    'status' => $p->status,
                ]),
            ]);

        return Inertia::render('pertemuan/index', [
            'roadmaps' => $roadmaps,
        ]);
    }

    public function storeRoadmap(Request $request)
    {
        $data = $request->validate([
            'judul' => 'nullable|string|max:255',
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer|min:2020|max:2099',
        ]);

        $roadmap = Roadmap::create([
            'judul' => $data['judul'] ?? $this->bulanNama($data['bulan']) . ' ' . $data['tahun'],
            'bulan' => $data['bulan'],
            'tahun' => $data['tahun'],
            'created_by' => $request->user()->id,
        ]);

        foreach (range(1, 4) as $i) {
            Pertemuan::create([
                'roadmap_id' => $roadmap->id,
                'judul' => "Pertemuan $i",
                'urutan' => $i,
                'tanggal' => null,
                'status' => 'draft',
            ]);
        }

        return redirect()->route('pertemuan.index')
            ->with('success', 'Roadmap dan 4 pertemuan berhasil dibuat.');
    }

    public function generate(Roadmap $roadmap)
    {
        if ($roadmap->pertemuan()->count() > 0) {
            return redirect()->route('pertemuan.index')
                ->with('error', 'Roadmap ini sudah memiliki pertemuan.');
        }

        foreach (range(1, 4) as $i) {
            Pertemuan::create([
                'roadmap_id' => $roadmap->id,
                'judul' => "Pertemuan $i",
                'urutan' => $i,
                'tanggal' => null,
                'status' => 'draft',
            ]);
        }

        return redirect()->route('pertemuan.index')
            ->with('success', '4 pertemuan default berhasil dibuat.');
    }

    public function update(Request $request, Pertemuan $pertemuan)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'tanggal' => 'nullable|date',
            'status' => 'required|in:draft,published,completed',
        ]);

        $pertemuan->update($data);

        return redirect()->route('pertemuan.index')
            ->with('success', 'Pertemuan berhasil diperbarui.');
    }

    private function bulanNama(int $bulan): string
    {
        $nama = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
        return $nama[$bulan] ?? 'Unknown';
    }
}
