import { useState, useEffect } from 'react';

const SESSION_KEY = 'vc_ops_granted';
const TOKEN_KEY = 'vc_ops_token';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function verifyCode(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ops-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'Apikey': ANON_KEY,
      },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.granted === true;
  } catch {
    return false;
  }
}

export function useOpsAuth() {
  const [granted, setGranted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  const getToken = (): string => {
    try { return sessionStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; }
  };

  // grant(token) — call from the component that owns useOpsAuth so React
  // re-renders that component (not a sibling instance).
  const grant = (token: string) => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch { /* ignore */ }
    setGranted(true);
  };

  const revoke = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch { /* ignore */ }
    setGranted(false);
  };

  return { granted, grant, revoke, getToken };
}

interface OpsGateProps {
  // OpsShell owns useOpsAuth and passes grant down so the state update
  // happens in the component that controls the granted/gate branch.
  onGranted: (token: string) => void;
}

export function OpsGate({ onGranted }: OpsGateProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Access';
    return () => { document.title = 'Vinocap'; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = input.trim();
    if (!code) return;

    setLoading(true);
    setError(false);

    const ok = await verifyCode(code);
    setLoading(false);

    if (ok) {
      onGranted(code);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs"
        autoComplete="off"
      >
        <div className="mb-6">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Access code"
            autoFocus
            disabled={loading}
            className={`w-full bg-stone-900 border text-stone-100 placeholder-stone-600 rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-stone-500 disabled:opacity-60 ${
              error ? 'border-red-700' : 'border-stone-700'
            }`}
          />
          {error && (
            <p className="text-xs text-red-500 mt-2">Invalid access code.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
