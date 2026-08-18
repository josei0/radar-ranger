export function getAvatarUrl(avatarId?: string | null): string {
  if (!avatarId) return `https://api.dicebear.com/7.x/bottts/svg?seed=Felix`; // default fallback
  
  if (avatarId.includes(':')) {
    const [style, seed] = avatarId.split(':');
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  }
  
  // Backward compatibility for old avatars that just saved the seed
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarId}`;
}
