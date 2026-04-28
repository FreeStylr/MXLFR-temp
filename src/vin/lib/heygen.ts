const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface AvatarConfig {
  avatarId: string;
  introText: string;
  quality?: 'low' | 'medium' | 'high';
  language?: string;
}

export async function fetchStreamingToken(): Promise<string | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/heygen-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.token ?? null;
  } catch {
    return null;
  }
}
