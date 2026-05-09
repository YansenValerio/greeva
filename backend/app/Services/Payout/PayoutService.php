<?php

declare(strict_types=1);

namespace App\Services\Payout;

use App\Enums\EarningStatus;
use App\Enums\PayoutStatus;
use App\Models\Partner;
use App\Models\PartnerEarning;
use App\Models\PayoutBatch;
use App\Models\PayoutItem;
use App\Models\User;
use App\Support\AuditLogger;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayoutService
{
    /**
     * Generate batch payout untuk satu mitra.
     * Mengambil semua earning dengan status available (atau subset jika earning_ids diberikan).
     *
     * @param  int[]  $earningIds  Kosong = ambil semua available
     */
    public function generate(
        Partner $partner,
        User $admin,
        array $earningIds,
        Carbon $periodStart,
        Carbon $periodEnd,
    ): PayoutBatch {
        return DB::transaction(function () use ($partner, $admin, $earningIds, $periodStart, $periodEnd) {
            $query = PartnerEarning::where('partner_id', $partner->id)
                ->where('status', EarningStatus::Available)
                ->whereNull('payout_batch_id')
                ->lockForUpdate();

            if (! empty($earningIds)) {
                $query->whereIn('id', $earningIds);
            }

            $earnings = $query->get();

            if ($earnings->isEmpty()) {
                abort(422, 'Tidak ada earning yang tersedia untuk di-payout.');
            }

            $totalAmount = $earnings->sum('amount');
            $itemCount   = $earnings->count();

            // Generate nomor payout: PYT-YYYYMMDD-NNN
            $seq          = PayoutBatch::whereDate('created_at', today())->lockForUpdate()->count() + 1;
            $payoutNumber = sprintf('PYT-%s-%03d', now()->format('Ymd'), $seq);

            $batch = PayoutBatch::create([
                'payout_number' => $payoutNumber,
                'partner_id'    => $partner->id,
                'processed_by'  => $admin->id,
                'status'        => PayoutStatus::Pending,
                'total_amount'  => $totalAmount,
                'item_count'    => $itemCount,
                'period_start'  => $periodStart->toDateString(),
                'period_end'    => $periodEnd->toDateString(),
            ]);

            foreach ($earnings as $earning) {
                PayoutItem::create([
                    'payout_batch_id'    => $batch->id,
                    'partner_earning_id' => $earning->id,
                    'amount'             => $earning->amount,
                ]);

                $earning->update(['payout_batch_id' => $batch->id]);
            }

            AuditLogger::log('created', $batch, [], [
                'payout_number' => $payoutNumber,
                'partner_id'    => $partner->id,
                'total_amount'  => $totalAmount,
                'item_count'    => $itemCount,
            ]);

            return $batch->fresh();
        });
    }

    /**
     * Tandai batch sebagai sedang diproses (admin mulai transfer).
     */
    public function markProcessing(PayoutBatch $batch, User $admin): PayoutBatch
    {
        if ($batch->status !== PayoutStatus::Pending) {
            abort(422, 'Batch tidak dalam status pending.');
        }

        $old = $batch->status->value;

        $batch->update([
            'status'       => PayoutStatus::Processing,
            'processed_by' => $admin->id,
        ]);

        AuditLogger::log('status_changed', $batch,
            ['status' => $old],
            ['status' => 'processing'],
        );

        return $batch->fresh();
    }

    /**
     * Tandai batch sebagai sudah dibayar. Upload bukti transfer dulu.
     * TIDAK BOLEH otomatis — selalu manual oleh admin (compliance).
     */
    public function markPaid(PayoutBatch $batch, User $admin, string $proofUrl): PayoutBatch
    {
        if (! in_array($batch->status, [PayoutStatus::Pending, PayoutStatus::Processing], strict: true)) {
            abort(422, 'Batch tidak dapat ditandai sebagai sudah dibayar.');
        }

        return DB::transaction(function () use ($batch, $admin, $proofUrl) {
            $old = $batch->status->value;
            $now = now();

            $batch->update([
                'status'        => PayoutStatus::Paid,
                'processed_by'  => $admin->id,
                'payment_proof' => $proofUrl,
                'paid_at'       => $now,
            ]);

            PartnerEarning::where('payout_batch_id', $batch->id)
                ->update([
                    'status'  => EarningStatus::Paid,
                    'paid_at' => $now,
                ]);

            AuditLogger::log('status_changed', $batch,
                ['status' => $old],
                ['status' => 'paid', 'payment_proof' => $proofUrl],
            );

            return $batch->fresh();
        });
    }

    /**
     * Batalkan batch payout dan kembalikan earnings ke available.
     */
    public function cancel(PayoutBatch $batch, User $admin, ?string $reason = null): PayoutBatch
    {
        if (! $batch->canBeCancelled()) {
            abort(422, 'Batch tidak dapat dibatalkan.');
        }

        return DB::transaction(function () use ($batch, $admin, $reason) {
            $old = $batch->status->value;

            // Lepaskan earnings dari batch — kembali siap di-payout
            PartnerEarning::where('payout_batch_id', $batch->id)
                ->update(['payout_batch_id' => null]);

            $batch->update([
                'status'       => PayoutStatus::Cancelled,
                'cancelled_at' => now(),
                'processed_by' => $admin->id,
                'notes'        => $reason,
            ]);

            AuditLogger::log('status_changed', $batch,
                ['status' => $old],
                ['status' => 'cancelled', 'reason' => $reason],
            );

            return $batch->fresh();
        });
    }
}
