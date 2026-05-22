<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Support\EmailVerificationToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $params = EmailVerificationToken::generate(
            (int) $notifiable->getKey(),
            $notifiable->getEmailForVerification(),
        );

        $frontendBase = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $url = "{$frontendBase}/verify-email?" . http_build_query($params);

        return (new MailMessage())
            ->subject('Verifikasi Email — Greeva')
            ->greeting("Halo {$notifiable->name},")
            ->line('Terima kasih sudah mendaftar di Greeva. Klik tombol di bawah untuk verifikasi email kamu.')
            ->action('Verifikasi Email', $url)
            ->line('Tautan ini berlaku selama 60 menit.')
            ->line('Jika kamu tidak mendaftar di Greeva, abaikan email ini.')
            ->salutation('Salam, Tim Greeva');
    }
}
