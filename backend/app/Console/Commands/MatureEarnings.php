<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\EarningStatus;
use App\Models\PartnerEarning;
use Illuminate\Console\Command;

class MatureEarnings extends Command
{
    protected $signature   = 'greeva:mature-earnings';
    protected $description = 'Transisi earning dari pending ke available setelah cooling period selesai';

    public function handle(): int
    {
        $count = PartnerEarning::where('status', EarningStatus::Pending)
            ->where('available_at', '<=', now())
            ->update(['status' => EarningStatus::Available]);

        if ($count > 0) {
            $this->info("Matured {$count} earning(s) menjadi available.");
        }

        return Command::SUCCESS;
    }
}
