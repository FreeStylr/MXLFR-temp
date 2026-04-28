import { useEffect, useRef, useState, useCallback } from 'react';
import StreamingAvatar, { AvatarQuality, StreamingEvents } from '@heygen/streaming-avatar';
import { AvatarConfig, fetchStreamingToken } from '../lib/heygen';
import { Loader2, WifiOff } from 'lucide-react';

type AvatarState = 'loading' | 'connecting' | 'ready' | 'speaking' | 'failed';

interface LiveAvatarHostProps {
  avatarConfig: AvatarConfig;
  onReady?: () => void;
  onFailed?: () => void;
}

const QUALITY_MAP: Record<string, AvatarQuality> = {
  low: AvatarQuality.Low,
  medium: AvatarQuality.Medium,
  high: AvatarQuality.High,
};

export function LiveAvatarHost({ avatarConfig, onReady, onFailed }: LiveAvatarHostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const [state, setState] = useState<AvatarState>('loading');
  const mountedRef = useRef(true);
  const initRef = useRef(false);

  const cleanup = useCallback(() => {
    if (avatarRef.current) {
      try {
        avatarRef.current.stopAvatar();
      } catch { /* ignore cleanup errors */ }
      avatarRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const token = await fetchStreamingToken();
        if (!token || !mountedRef.current) {
          if (mountedRef.current) {
            setState('failed');
            onFailed?.();
          }
          return;
        }

        if (!mountedRef.current) return;
        setState('connecting');

        const avatar = new StreamingAvatar({ token });
        avatarRef.current = avatar;

        avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
          if (!mountedRef.current || !videoRef.current) return;
          const stream = event.detail;
          if (stream instanceof MediaStream) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(() => {});
            };
          }
          setState('ready');
          onReady?.();

          if (avatarConfig.introText) {
            setTimeout(() => {
              if (!mountedRef.current || !avatarRef.current) return;
              setState('speaking');
              avatarRef.current.speak({
                text: avatarConfig.introText,
                taskType: 'repeat' as any,
              }).catch(() => {});
            }, 600);
          }
        });

        avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
          if (mountedRef.current) setState('speaking');
        });

        avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
          if (mountedRef.current) setState('ready');
        });

        avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          if (mountedRef.current) {
            setState('failed');
            onFailed?.();
          }
        });

        await avatar.createStartAvatar({
          quality: QUALITY_MAP[avatarConfig.quality ?? 'medium'] ?? AvatarQuality.Medium,
          avatarName: avatarConfig.avatarId,
          language: avatarConfig.language ?? 'fr',
        });
      } catch (err) {
        console.warn('LiveAvatar init failed:', err);
        if (mountedRef.current) {
          setState('failed');
          onFailed?.();
        }
      }
    })();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'failed') return null;

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {(state === 'loading' || state === 'connecting') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-3">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          <p className="text-white/30 text-xs font-medium">
            {state === 'loading' ? 'Préparation…' : 'Connexion…'}
          </p>
        </div>
      )}

      {state === 'speaking' && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-3 rounded-full bg-white/60 animate-pulse" />
            <div className="w-1 h-4 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-2.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveAvatarUnavailable() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-2">
      <WifiOff className="w-6 h-6 text-white/20" />
      <p className="text-white/25 text-xs">Hôte indisponible</p>
    </div>
  );
}
