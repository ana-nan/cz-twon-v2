import { useEffect, useState } from 'react';
import { normalizeIdentity, type AnonymousIdentity } from '../data/anonymousIdentity';
import { loadCustomDragon, type Outfit } from '../data/town';
const key = 'town-public-identity-v1';
export function usePublicIdentity(initialAvatar: Outfit) {
  const [identity, setIdentity] = useState<AnonymousIdentity>(() => {
    try { const saved = localStorage.getItem(key); if (saved) return normalizeIdentity(JSON.parse(saved)); } catch { /* Use the original town profile. */ }
    return { name: '我', symbol: '◇', color: '#71927e', avatar: initialAvatar === 'custom' ? 'player' : initialAvatar, image: initialAvatar === 'custom' ? loadCustomDragon() ?? undefined : undefined };
  });
  const [error, setError] = useState(false);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(identity)); setError(false); } catch { setError(true); } }, [identity]);
  return { identity, save: (value: AnonymousIdentity) => setIdentity(normalizeIdentity(value)), error };
}
