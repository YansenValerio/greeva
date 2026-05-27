'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Badge } from '@/components/shared/Badge';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';
import {
  updateProfile,
  changePassword,
  getMe,
  resendVerificationEmail,
  type UpdateProfilePayload,
} from '@/lib/api/auth';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface FieldErrors {
  [field: string]: string[];
}

const EMPTY_PASSWORD: PasswordForm = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

export default function AccountPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(EMPTY_PASSWORD);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Redirect if not authenticated; sync form with user
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login?next=/account');
      return;
    }
    // Refresh from server to get latest data
    getMe()
      .then((u) => {
        setUser(u);
        setProfileForm({
          name: u.name,
          email: u.email,
          phone: u.phone ?? '',
        });
      })
      .catch(() => {
        // Fallback to store
        if (user) {
          setProfileForm({
            name: user.name,
            email: user.email,
            phone: user.phone ?? '',
          });
        }
      });
  }, [hydrated, isAuthenticated, router, setUser, user]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    setProfileErrors({});

    const payload: UpdateProfilePayload = {
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim() || null,
    };

    try {
      const updated = await updateProfile(payload);
      setUser(updated);
      setProfileMessage('Profil berhasil diperbarui.');
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string; errors?: FieldErrors } } })
        .response?.data;
      if (res?.errors) setProfileErrors(res.errors);
      setProfileMessage(res?.message ?? 'Gagal memperbarui profil.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleResendVerification() {
    setResending(true);
    setResendMessage('');
    try {
      const res = await resendVerificationEmail();
      setResendMessage(res.message);
    } catch {
      setResendMessage('Gagal mengirim email verifikasi. Coba lagi nanti.');
    } finally {
      setResending(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage('');
    setPasswordErrors({});

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordErrors({ password_confirmation: ['Konfirmasi password tidak cocok.'] });
      setPasswordSaving(false);
      return;
    }

    try {
      await changePassword(passwordForm);
      setPasswordForm(EMPTY_PASSWORD);
      setPasswordMessage('Password berhasil diubah.');
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string; errors?: FieldErrors } } })
        .response?.data;
      if (res?.errors) setPasswordErrors(res.errors);
      setPasswordMessage(res?.message ?? 'Gagal mengubah password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  if (!hydrated || !user) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-64 rounded-card bg-gray-100" />
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-greeva-black">Akun Saya</h1>
            <p className="mt-1 text-sm text-gray-500">
              Kelola info pribadi dan keamanan akunmu.
            </p>
          </div>
          <Badge variant="green">{user.role_label}</Badge>
        </div>

        {/* Email verification banner */}
        {!user.email_verified_at && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-card border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Email kamu belum diverifikasi
              </p>
              <p className="mt-0.5 text-xs text-amber-800">
                Cek inbox di <span className="font-mono">{user.email}</span> untuk tautan
                verifikasi. {resendMessage && <span className="font-medium">{resendMessage}</span>}
              </p>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="shrink-0 rounded-pill border border-amber-300 bg-white px-4 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50 transition-colors"
            >
              {resending ? 'Mengirim...' : 'Kirim Ulang'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-card bg-greeva-mint-light p-5">
              <p className="text-caption uppercase tracking-[0.08em] text-greeva-forest-dark">
                Pintasan
              </p>
              <nav className="mt-3 flex flex-col gap-1">
                <Link
                  href="/orders"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-greeva-forest-dark hover:bg-white/60 transition-colors"
                >
                  Pesanan Saya →
                </Link>
                <Link
                  href="/account/addresses"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-greeva-forest-dark hover:bg-white/60 transition-colors"
                >
                  Alamat Tersimpan →
                </Link>
                <Link
                  href="/account/wishlist"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-greeva-forest-dark hover:bg-white/60 transition-colors"
                >
                  Wishlist →
                </Link>
                {user.role === 'partner' && (
                  <Link
                    href="/partner/dashboard"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-greeva-forest-dark hover:bg-white/60 transition-colors"
                  >
                    Dashboard Mitra →
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-greeva-forest-dark hover:bg-white/60 transition-colors"
                  >
                    Dashboard Admin →
                  </Link>
                )}
              </nav>
              <p className="mt-4 border-t border-greeva-mint/40 pt-3 text-xs text-greeva-forest-dark/70">
                Bergabung sejak{' '}
                {new Date(user.created_at).toLocaleDateString('id-ID', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </aside>

          {/* Forms */}
          <div className="space-y-8 lg:col-span-2">
            {/* Profile form */}
            <section className="rounded-card bg-white p-6 shadow-card">
              <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Info Pribadi</h2>

              {profileMessage && (
                <p
                  className={`mb-4 text-sm ${
                    Object.keys(profileErrors).length > 0
                      ? 'text-red-600'
                      : 'text-greeva-forest-dark'
                  }`}
                >
                  {profileMessage}
                </p>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Nama
                  </label>
                  <input
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                    required
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{profileErrors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                    required
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{profileErrors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Nomor HP
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                  {profileErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{profileErrors.phone[0]}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Untuk notifikasi pesanan via WhatsApp.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="rounded-pill bg-greeva-forest px-6 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50 transition-colors"
                  >
                    {profileSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </section>

            {/* Password form */}
            <section className="rounded-card bg-white p-6 shadow-card">
              <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Ubah Password</h2>

              {passwordMessage && (
                <p
                  className={`mb-4 text-sm ${
                    Object.keys(passwordErrors).length > 0
                      ? 'text-red-600'
                      : 'text-greeva-forest-dark'
                  }`}
                >
                  {passwordMessage}
                </p>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, current_password: e.target.value }))
                    }
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                    required
                  />
                  {passwordErrors.current_password && (
                    <p className="mt-1 text-xs text-red-600">
                      {passwordErrors.current_password[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, password: e.target.value }))
                    }
                    autoComplete="new-password"
                    minLength={8}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                    required
                  />
                  {passwordErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{passwordErrors.password[0]}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Minimal 8 karakter.</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordForm.password_confirmation}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, password_confirmation: e.target.value }))
                    }
                    autoComplete="new-password"
                    minLength={8}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                    required
                  />
                  {passwordErrors.password_confirmation && (
                    <p className="mt-1 text-xs text-red-600">
                      {passwordErrors.password_confirmation[0]}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="rounded-pill bg-greeva-forest px-6 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50 transition-colors"
                  >
                    {passwordSaving ? 'Menyimpan...' : 'Ubah Password'}
                  </button>
                  <p className="mt-2 text-xs text-gray-400">
                    Setelah ganti password, kamu akan tetap login di device ini tapi keluar
                    dari device lain.
                  </p>
                </div>
              </form>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
