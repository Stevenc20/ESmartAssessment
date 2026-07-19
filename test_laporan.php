<?php
require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $controller = new App\Http\Controllers\LaporanController();
    $request = new Illuminate\Http\Request();
    $request->merge(['bulan' => 6, 'tahun' => 2026]);
    $result = $controller->absensi($request);
    echo "SUCCESS: " . get_class($result) . "\n";
    echo "Component: " . $result->name . "\n";
    echo "Data keys: " . implode(', ', array_keys($result->data ?? [])) . "\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
