<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeatureController extends Controller
{
    public function index()
    {
        $features = SystemSetting::where('type', 'feature_toggle')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'key' => $f->key,
                'label' => $f->label,
                'description' => $f->description,
                'group' => $f->group,
                'enabled' => filter_var($f->value, FILTER_VALIDATE_BOOLEAN),
            ]);

        return Inertia::render('admin/features/index', ['features' => $features]);
    }

    public function toggle(Request $request, SystemSetting $feature)
    {
        $request->validate(['enabled' => 'required|boolean']);

        $feature->update([
            'value' => $request->enabled ? 'true' : 'false',
        ]);

        return back()->with('success', "Fitur {$feature->label} berhasil " . ($request->enabled ? 'diaktifkan' : 'dinonaktifkan'));
    }
}
