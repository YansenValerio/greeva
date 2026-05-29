<?php

declare(strict_types=1);

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Enums\ReturnRequestStatus;
use App\Models\AppNotification;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Support\Facades\DB;

class ReturnRequestService
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * Buyer mengajukan retur untuk order miliknya.
     *
     * @param  array<string, mixed>  $data  reason, description, photos[]
     */
    public function create(Order $order, User $buyer, array $data): ReturnRequest
    {
        if (! $order->canRequestReturn()) {
            abort(422, 'Retur hanya dapat diajukan untuk pesanan yang sudah diterima atau selesai.');
        }

        $hasPending = $order->returnRequests()
            ->where('status', ReturnRequestStatus::Pending->value)
            ->exists();

        if ($hasPending) {
            abort(422, 'Sudah ada pengajuan retur yang sedang ditinjau untuk pesanan ini.');
        }

        return DB::transaction(function () use ($order, $buyer, $data) {
            $seq = ReturnRequest::whereDate('created_at', today())->count() + 1;
            $returnNumber = sprintf('RTN-%s-%04d', now()->format('Ymd'), $seq);

            $return = ReturnRequest::create([
                'return_number' => $returnNumber,
                'order_id'      => $order->id,
                'user_id'       => $buyer->id,
                'reason'        => $data['reason'],
                'description'   => $data['description'],
                'photos'        => $data['photos'] ?? null,
                'status'        => ReturnRequestStatus::Pending,
            ]);

            AuditLogger::log('return.requested', $return, [], [
                'order_number' => $order->order_number,
                'reason'       => $data['reason'],
            ]);

            return $return;
        });
    }

    /**
     * Admin menyetujui retur → order direfund, earning di-reverse otomatis.
     */
    public function approve(ReturnRequest $return, User $admin, ?string $adminNote = null): ReturnRequest
    {
        if (! $return->isPending()) {
            abort(422, 'Pengajuan retur ini sudah ditinjau sebelumnya.');
        }

        return DB::transaction(function () use ($return, $admin, $adminNote) {
            $order = $return->order;

            // Refund order — OrderService menangani reverse earning, release stok, & notifikasi
            $this->orderService->updateStatus($order, OrderStatus::Refunded, [
                'note' => "Disetujui via retur {$return->return_number}",
            ]);

            $return->update([
                'status'      => ReturnRequestStatus::Approved,
                'admin_note'  => $adminNote,
                'resolved_by' => $admin->id,
                'resolved_at' => now(),
            ]);

            AuditLogger::log('return.approved', $return, ['status' => 'pending'], [
                'status'     => ReturnRequestStatus::Approved->value,
                'admin_note' => $adminNote,
            ]);

            AppNotification::create([
                'user_id' => $return->user_id,
                'type'    => 'return_approved',
                'title'   => 'Pengajuan Retur Disetujui',
                'body'    => "Retur {$return->return_number} disetujui. Dana akan dikembalikan dalam 3–7 hari kerja.",
                'data'    => ['return_number' => $return->return_number, 'order_id' => $order->id],
            ]);

            return $return->fresh(['order', 'resolvedBy']);
        });
    }

    /**
     * Admin menolak retur → order tidak berubah.
     */
    public function reject(ReturnRequest $return, User $admin, string $adminNote): ReturnRequest
    {
        if (! $return->isPending()) {
            abort(422, 'Pengajuan retur ini sudah ditinjau sebelumnya.');
        }

        return DB::transaction(function () use ($return, $admin, $adminNote) {
            $return->update([
                'status'      => ReturnRequestStatus::Rejected,
                'admin_note'  => $adminNote,
                'resolved_by' => $admin->id,
                'resolved_at' => now(),
            ]);

            AuditLogger::log('return.rejected', $return, ['status' => 'pending'], [
                'status'     => ReturnRequestStatus::Rejected->value,
                'admin_note' => $adminNote,
            ]);

            AppNotification::create([
                'user_id' => $return->user_id,
                'type'    => 'return_rejected',
                'title'   => 'Pengajuan Retur Ditolak',
                'body'    => "Retur {$return->return_number} ditolak. Alasan: {$adminNote}",
                'data'    => ['return_number' => $return->return_number, 'order_id' => $return->order_id],
            ]);

            return $return->fresh(['order', 'resolvedBy']);
        });
    }
}
