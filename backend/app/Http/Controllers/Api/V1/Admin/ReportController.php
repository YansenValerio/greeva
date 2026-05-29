<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Report\ReportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reports,
    ) {}

    /**
     * GET /api/v1/admin/reports/sales?from=&to=
     */
    public function sales(Request $request): StreamedResponse
    {
        return $this->streamCsv(
            $this->reports->sales($request->query('from'), $request->query('to'))
        );
    }

    /**
     * GET /api/v1/admin/reports/earnings?from=&to=&partner_id=
     */
    public function earnings(Request $request): StreamedResponse
    {
        return $this->streamCsv(
            $this->reports->earnings(
                $request->query('from'),
                $request->query('to'),
                $request->filled('partner_id') ? $request->integer('partner_id') : null,
            )
        );
    }

    /**
     * GET /api/v1/admin/reports/payouts?from=&to=
     */
    public function payouts(Request $request): StreamedResponse
    {
        return $this->streamCsv(
            $this->reports->payouts($request->query('from'), $request->query('to'))
        );
    }

    /**
     * Stream array laporan ke response CSV (dengan BOM agar Excel membaca UTF-8).
     *
     * @param  array{filename: string, header: array<int, string>, rows: array<int, array<int, string|int>>}  $report
     */
    private function streamCsv(array $report): StreamedResponse
    {
        $callback = function () use ($report) {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8 — agar karakter Indonesia & "Rp" tampil benar di Excel
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, $report['header']);
            foreach ($report['rows'] as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        };

        return response()->streamDownload($callback, $report['filename'], [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
