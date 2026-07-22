<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CertificateTemplateController extends Controller
{
    public function index()
    {
        $templates = CertificateTemplate::with('creator')
            ->latest()
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'nama_template' => $t->nama_template,
                'nama_sekolah' => $t->nama_sekolah,
                'is_default' => $t->is_default,
                'is_active' => $t->is_active,
                'created_by' => $t->creator?->name ?? '-',
                'created_at' => $t->created_at->diffForHumans(),
            ]);

        return Inertia::render('admin/certificate-templates/index', ['templates' => $templates]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_template' => 'required|string|max:255',
            'nama_sekolah' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        $validated['created_by'] = $request->user()->id;

        if ($validated['is_default'] ?? false) {
            CertificateTemplate::where('is_default', true)->update(['is_default' => false]);
        }

        CertificateTemplate::create($validated);

        return back()->with('success', 'Template sertifikat berhasil dibuat');
    }

    public function update(Request $request, CertificateTemplate $certificateTemplate)
    {
        $validated = $request->validate([
            'nama_template' => 'required|string|max:255',
            'nama_sekolah' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            CertificateTemplate::where('is_default', true)->where('id', '!=', $certificateTemplate->id)->update(['is_default' => false]);
        }

        $certificateTemplate->update($validated);

        return back()->with('success', 'Template sertifikat berhasil diupdate');
    }

    public function destroy(CertificateTemplate $certificateTemplate)
    {
        $certificateTemplate->delete();

        return back()->with('success', 'Template sertifikat berhasil dihapus');
    }

    public function setDefault(CertificateTemplate $certificateTemplate)
    {
        CertificateTemplate::where('is_default', true)->update(['is_default' => false]);
        $certificateTemplate->update(['is_default' => true]);

        return back()->with('success', 'Template default berhasil diubah');
    }
}
