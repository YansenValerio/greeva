<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;

/**
 * Utilitas penanganan uang untuk Greeva.
 *
 * SEMUA nilai uang di database disimpan dalam SEN RUPIAH (integer BIGINT).
 * 1 IDR = 100 sen. Rp 85.000 disimpan sebagai 8.500.000 sen.
 *
 * Konversi ke rupiah hanya dilakukan di response layer atau komponen UI.
 * JANGAN gunakan float untuk kalkulasi uang — floating point error = bug finance fatal.
 *
 * @see https://martinfowler.com/eaaCatalog/money.html
 */
final class Money
{
    /**
     * Konversi sen ke rupiah (pembulatan integer).
     *
     * @example Money::toRupiah(8_500_000) // 85000
     * @example Money::toRupiah(0)         // 0
     *
     * @throws InvalidArgumentException jika nilai negatif
     */
    public static function toRupiah(int $cents): int
    {
        self::assertNonNegative($cents, 'cents');

        return (int) round($cents / 100);
    }

    /**
     * Konversi rupiah ke sen.
     *
     * @example Money::toCents(85000)   // 8500000
     * @example Money::toCents(85000.5) // 8500050
     *
     * @throws InvalidArgumentException jika nilai negatif
     */
    public static function toCents(int|float $rupiah): int
    {
        if ($rupiah < 0) {
            throw new InvalidArgumentException(
                "Nilai rupiah tidak boleh negatif, diterima: {$rupiah}"
            );
        }

        return (int) round($rupiah * 100);
    }

    /**
     * Format sen ke string rupiah yang mudah dibaca.
     *
     * @example Money::format(8_500_000) // "Rp 85.000"
     * @example Money::format(100)       // "Rp 1"
     *
     * @throws InvalidArgumentException jika nilai negatif
     */
    public static function format(int $cents, string $locale = 'id_ID'): string
    {
        self::assertNonNegative($cents, 'cents');

        $rupiah = $cents / 100;

        return 'Rp ' . number_format($rupiah, 0, ',', '.');
    }

    /**
     * Parse string rupiah yang diformat ke sen.
     *
     * Mendukung format: "Rp 85.000", "85.000", "85000"
     *
     * @example Money::parse("Rp 85.000") // 8500000
     * @example Money::parse("85000")     // 8500000
     *
     * @throws InvalidArgumentException jika format tidak valid
     */
    public static function parse(string $formatted): int
    {
        // Hapus prefix "Rp", spasi, dan titik pemisah ribuan
        $cleaned = preg_replace('/[Rp\s\.]+/', '', $formatted);

        // Ganti koma desimal menjadi titik untuk is_numeric
        $cleaned = str_replace(',', '.', $cleaned ?? '');

        if ($cleaned === '' || !is_numeric($cleaned)) {
            throw new InvalidArgumentException(
                "Format harga tidak valid: \"{$formatted}\". Gunakan format: \"Rp 85.000\" atau \"85000\"."
            );
        }

        $rupiah = (float) $cleaned;

        if ($rupiah < 0) {
            throw new InvalidArgumentException(
                "Nilai harga tidak boleh negatif: \"{$formatted}\"."
            );
        }

        return self::toCents($rupiah);
    }

    /**
     * Hitung persentase dari nilai sen (untuk bagi hasil).
     *
     * @example Money::percentage(10_000_000, 80) // 8000000 (80% dari Rp 100.000)
     *
     * @throws InvalidArgumentException jika cents atau percent negatif
     */
    public static function percentage(int $cents, int|float $percent): int
    {
        self::assertNonNegative($cents, 'cents');

        if ($percent < 0 || $percent > 100) {
            throw new InvalidArgumentException(
                "Persentase harus antara 0–100, diterima: {$percent}"
            );
        }

        return (int) round($cents * $percent / 100);
    }

    private static function assertNonNegative(int $value, string $field): void
    {
        if ($value < 0) {
            throw new InvalidArgumentException(
                "Nilai {$field} tidak boleh negatif, diterima: {$value}"
            );
        }
    }
}
