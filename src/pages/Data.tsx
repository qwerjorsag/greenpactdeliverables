import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '../lib/api';
import { AuthLoginForm, DataOverview } from '../components/auth';

const STORAGE_KEY = 'greenpack_data_auth_token';

type OverviewResponse = {
  username: string;
  counts: {
    electricity: number;
    water: number;
    waste: number;
    electricitySelfAudits: number;
    waterSelfAudits: number;
    wasteSelfAudits: number;
  };
  submissionStats: {
    last24Hours: number;
    last7Days: number;
    last28Days: number;
  };
  selfAuditStats: {
    last24Hours: number;
    last7Days: number;
    last28Days: number;
  };
};

async function fetchOverview(token: string, fallbackError: string) {
  const response = await fetch(apiUrl('/api/data/overview'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || fallbackError);
  }

  const data = await response.json();
  return normalizeOverview(data);
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeOverview(data: any): OverviewResponse {
  const counts = data?.counts ?? {};
  const submissionStats = data?.submissionStats ?? {};
  const selfAuditStats = data?.selfAuditStats ?? {};

  return {
    username: typeof data?.username === 'string' ? data.username : '',
    counts: {
      electricity: toNumber(counts.electricity),
      water: toNumber(counts.water ?? counts.waterSelfAudits),
      waste: toNumber(counts.waste ?? counts.wasteSelfAudits),
      electricitySelfAudits: toNumber(counts.electricitySelfAudits),
      waterSelfAudits: toNumber(counts.waterSelfAudits),
      wasteSelfAudits: toNumber(counts.wasteSelfAudits),
    },
    submissionStats: {
      last24Hours: toNumber(submissionStats.last24Hours),
      last7Days: toNumber(submissionStats.last7Days),
      last28Days: toNumber(submissionStats.last28Days),
    },
    selfAuditStats: {
      last24Hours: toNumber(selfAuditStats.last24Hours),
      last7Days: toNumber(selfAuditStats.last7Days),
      last28Days: toNumber(selfAuditStats.last28Days),
    },
  };
}

function getExportFilename(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="?(?<filename>[^"]+)"?/);
  return match?.groups?.filename || `greenpact-database-export-${new Date().toISOString()}.xlsx`;
}

export default function Data() {
  const { t } = useTranslation('data');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [token, setToken] = useState('');
  const [overview, setOverview] = useState<OverviewResponse | null>(null);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(STORAGE_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    fetchOverview(savedToken, t('errors.loadFailed'))
      .then((data) => {
        setToken(savedToken);
        setOverview(data);
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken('');
        setOverview(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken('');
    setOverview(null);
    setPassword('');
    setError('');
    setExportError('');
  };

  const handleDownloadDatabase = async () => {
    if (!token) return;

    setIsExporting(true);
    setExportError('');

    try {
      const response = await fetch(apiUrl('/api/data/export'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) {
          handleLogout();
        }
        throw new Error(payload.error || t('errors.exportFailed'));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getExportFilename(response.headers.get('Content-Disposition'));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.exportFailed');
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/data/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || t('errors.loginFailed'));
      }

      const nextToken = payload.token as string;
      const data = await fetchOverview(nextToken, t('errors.loadFailed'));
      window.localStorage.setItem(STORAGE_KEY, nextToken);
      setToken(nextToken);
      setOverview(data);
      setPassword('');
      setExportError('');
    } catch (err) {
      window.localStorage.removeItem(STORAGE_KEY);
      const message = err instanceof Error ? err.message : t('errors.loginFailed');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(180deg,_#f0fdf4_0%,_#ecfdf5_100%)] px-6 py-20 text-stone-900">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-emerald-100 bg-white/80 px-8 py-12 text-center shadow-sm">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(180deg,_#f0fdf4_0%,_#ecfdf5_100%)] text-stone-900">
      {!token || !overview ? (
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-20">
          <AuthLoginForm
            username={username}
            password={password}
            error={error}
            isSubmitting={isSubmitting}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-6xl">
          <DataOverview
            username={overview.username}
            counts={overview.counts}
            submissionStats={overview.submissionStats}
            selfAuditStats={overview.selfAuditStats}
            onLogout={handleLogout}
            onDownloadDatabase={handleDownloadDatabase}
            isExporting={isExporting}
            exportError={exportError}
          />
        </div>
      )}
    </div>
  );
}
