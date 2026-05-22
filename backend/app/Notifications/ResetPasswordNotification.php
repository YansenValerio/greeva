<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/')
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage())
            ->subject('Reset Password — Greeva')
            ->greeting("Halo {$notifiable->name},")
            ->line('Kami menerima permintaan reset password untuk akun kamu di Greeva.')
            ->action('Reset Password', $url)
            ->line('Tautan ini berlaku selama 60 menit.')
            ->line('Jika kamu tidak meminta reset password, abaikan email ini — akun kamu aman.')
            ->salutation('Salam, Tim Greeva');
    }
}
