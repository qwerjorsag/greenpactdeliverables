import React from 'react';
import { useTranslation } from 'react-i18next';
import { LockKeyhole, User } from 'lucide-react';
import { PrimaryButton } from '../ui';

type Props = {
  username: string;
  password: string;
  error: string;
  isSubmitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function AuthLoginForm({
  username,
  password,
  error,
  isSubmitting,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation('data');

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_30px_80px_rgba(6,95,70,0.12)]"
    >
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">
          {t('auth.eyebrow')}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900">
          {t('auth.title')}
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          {t('auth.description')}
        </p>
      </div>

      <label className="mb-5 block">
        <span className="mb-2 block text-sm font-bold text-stone-800">{t('auth.usernameLabel')}</span>
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white">
          <User className="h-4 w-4 text-stone-500" />
          <input
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            autoComplete="username"
            className="w-full bg-transparent text-sm text-stone-900 outline-none"
            placeholder={t('auth.usernamePlaceholder')}
          />
        </div>
      </label>

      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-bold text-stone-800">{t('auth.passwordLabel')}</span>
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white">
          <LockKeyhole className="h-4 w-4 text-stone-500" />
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            autoComplete="current-password"
            className="w-full bg-transparent text-sm text-stone-900 outline-none"
            placeholder={t('auth.passwordPlaceholder')}
          />
        </div>
      </label>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <PrimaryButton
        type="submit"
        disabled={isSubmitting || !username.trim() || !password}
        className="w-full justify-center"
        themeColor="emerald"
      >
        {isSubmitting ? t('auth.submitting') : t('auth.submit')}
      </PrimaryButton>
    </form>
  );
}
