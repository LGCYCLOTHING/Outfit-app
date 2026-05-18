// Supabase sync layer.
//
// Strategy: localStorage stays the synchronous read-cache the rest of the app
// already uses. When the user is signed in, every write also pushes to
// Supabase, and on session start we pull a snapshot into localStorage.
//
// Anonymous users get the same UX as before — purely local — and their data
// is migrated on first login.

import { supabase } from './supabase.js';

const FIT_PHOTO_BUCKET   = 'fit-photos';
const PIECE_PHOTO_BUCKET = 'piece-photos';
const AVATAR_BUCKET      = 'avatars';

let currentUserId = null;
const subs = new Set();

export function getCurrentUserId() { return currentUserId; }
export function isAuthed() { return !!currentUserId; }

export function onAuthChange(cb) {
  subs.add(cb);
  cb(currentUserId);
  return () => subs.delete(cb);
}
function emitAuth() {
  for (const cb of subs) { try { cb(currentUserId); } catch (e) {} }
  try { window.dispatchEvent(new CustomEvent('archive:authchanged', { detail: { userId: currentUserId } })); } catch (e) {}
}

// ─── Bootstrap ───────────────────────────────────────────────────────────
export async function initSupabaseSync() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      currentUserId = session.user.id;
      await onSignIn(session.user);
    }
  } catch (e) {}
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session && session.user) {
      currentUserId = session.user.id;
      await onSignIn(session.user);
      emitAuth();
    } else if (event === 'SIGNED_OUT') {
      currentUserId = null;
      emitAuth();
    }
  });
  emitAuth();
}

async function onSignIn(user) {
  await ensureProfile(user);
  await pullAll(user.id);
  await pushAllPending(user.id);
}

// ─── Profile ─────────────────────────────────────────────────────────────
async function ensureProfile(user) {
  try {
    const { data } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!data) {
      await supabase.from('profiles').insert({
        id: user.id,
        theme: localStorage.getItem('aevum_theme_id') || 'dusk',
        display_mode: localStorage.getItem('aevum_light') ? 'light' : 'dark',
        selected_icon: localStorage.getItem('aevum_app_icon') || null,
      });
    }
  } catch (e) {}
}
export async function pushProfile(updates) {
  if (!currentUserId) return;
  try { await supabase.from('profiles').update(updates).eq('id', currentUserId); } catch (e) {}
}

// ─── Pull a snapshot into localStorage on session start ──────────────────
async function pullAll(userId) {
  await Promise.all([
    pullFits(userId),
    pullPieces(userId),
    pullAchievements(userId),
    pullWeeklyScores(userId),
    pullProfileToLocal(userId),
    pullNotificationSettings(userId),
  ]);
  try { window.dispatchEvent(new CustomEvent('archive:fitschanged')); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('archive:scorechanged')); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('archive:likeschanged')); } catch (e) {}
}
async function pullProfileToLocal(userId) {
  try {
    const { data } = await supabase.from('profiles').select('theme, display_mode, selected_icon').eq('id', userId).maybeSingle();
    if (data) {
      if (data.theme) localStorage.setItem('aevum_theme_id', data.theme);
      if (data.selected_icon) localStorage.setItem('aevum_app_icon', data.selected_icon);
      // display_mode handled by Settings if present
    }
  } catch (e) {}
}
async function pullFits(userId) {
  try {
    const { data } = await supabase.from('fits')
      .select('date, photo_url, stars, mood, context, note, idx')
      .eq('user_id', userId).order('date', { ascending: true });
    if (!data) return;
    const photosByDate = {};
    const metaByDate = {};
    const loggedSet = new Set();
    for (const row of data) {
      loggedSet.add(row.date);
      if (!photosByDate[row.date]) photosByDate[row.date] = [];
      if (!metaByDate[row.date]) metaByDate[row.date] = [];
      photosByDate[row.date].push(row.photo_url);
      metaByDate[row.date].push({
        stars: row.stars, mood: row.mood, ctx: row.context, note: row.note,
      });
    }
    localStorage.setItem('aevum_fits_logged', JSON.stringify(Array.from(loggedSet)));
    for (const date of Object.keys(photosByDate)) {
      localStorage.setItem('aevum_fit_photos_' + date, JSON.stringify(photosByDate[date]));
      localStorage.setItem('aevum_fit_meta_' + date, JSON.stringify(metaByDate[date]));
    }
  } catch (e) {}
}
async function pullPieces(userId) {
  try {
    const { data } = await supabase.from('pieces')
      .select('id, name, color, category, photo_urls, created_at')
      .eq('user_id', userId);
    if (!data) return;
    const arr = data.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color || '',
      category: p.category,
      photo: (Array.isArray(p.photo_urls) && p.photo_urls.length) ? p.photo_urls[0] : null,
      photo_urls: p.photo_urls || [],
      createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
    }));
    localStorage.setItem('aevum_pieces', JSON.stringify(arr));
  } catch (e) {}
}
async function pullAchievements(userId) {
  try {
    const { data } = await supabase.from('achievements')
      .select('achievement_id').eq('user_id', userId);
    if (!data) return;
    localStorage.setItem('aevum_achievements', JSON.stringify(data.map(r => r.achievement_id)));
  } catch (e) {}
}
async function pullWeeklyScores(userId) {
  try {
    const { data } = await supabase.from('weekly_scores')
      .select('week, score').eq('user_id', userId).order('week', { ascending: true });
    if (!data) return;
    localStorage.setItem('aevum_weekly_scores', JSON.stringify(data));
  } catch (e) {}
}
async function pullNotificationSettings(userId) {
  try {
    const { data } = await supabase.from('notification_settings')
      .select('key, enabled').eq('user_id', userId);
    if (!data) return;
    for (const row of data) {
      localStorage.setItem('aevum_notif_' + row.key, row.enabled ? '1' : '0');
    }
  } catch (e) {}
}

// ─── Photo upload helpers ────────────────────────────────────────────────
function dataUrlToBlob(dataUrl) {
  try {
    const [meta, b64] = dataUrl.split(',');
    const m = /data:(.+);base64/.exec(meta) || [];
    const mime = m[1] || 'image/jpeg';
    const binary = atob(b64);
    const len = binary.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch (e) { return null; }
}
async function uploadFitPhoto(userId, dateKey, idx, dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) return null;
  const path = `${userId}/${dateKey}-${idx}-${Date.now()}.jpg`;
  try {
    const { error } = await supabase.storage
      .from(FIT_PHOTO_BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) return null;
    const { data } = supabase.storage.from(FIT_PHOTO_BUCKET).getPublicUrl(path);
    return data && data.publicUrl ? data.publicUrl : null;
  } catch (e) { return null; }
}
async function uploadPiecePhoto(userId, pieceId, dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) return null;
  const path = `${userId}/${pieceId}-${Date.now()}.jpg`;
  try {
    const { error } = await supabase.storage
      .from(PIECE_PHOTO_BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) return null;
    const { data } = supabase.storage.from(PIECE_PHOTO_BUCKET).getPublicUrl(path);
    return data && data.publicUrl ? data.publicUrl : null;
  } catch (e) { return null; }
}

// ─── Write-through helpers used by the UI ────────────────────────────────
// Each helper is a no-op when unauthenticated so the existing localStorage
// path keeps the app fully functional for guest users.

export async function pushFitSave({ dateKey, idx, photo, stars, mood, ctx, note }) {
  if (!currentUserId) return;
  let url = photo;
  if (photo && photo.startsWith('data:')) {
    url = await uploadFitPhoto(currentUserId, dateKey, idx, photo);
    if (!url) return;
    // Replace data URL in localStorage with the public URL so future loads
    // don't keep huge base64 blobs around.
    try {
      const arr = JSON.parse(localStorage.getItem('aevum_fit_photos_' + dateKey) || '[]');
      if (Array.isArray(arr) && arr[idx]) {
        arr[idx] = url;
        localStorage.setItem('aevum_fit_photos_' + dateKey, JSON.stringify(arr));
      }
    } catch (e) {}
  }
  try {
    await supabase.from('fits').upsert({
      user_id: currentUserId,
      date: dateKey,
      idx,
      photo_url: url,
      stars, mood, context: ctx, note,
    }, { onConflict: 'user_id,date,idx' });
  } catch (e) {}
}

export async function pushPieceSave(piece) {
  if (!currentUserId) return null;
  let urls = piece.photo_urls || (piece.photo ? [piece.photo] : []);
  // Upload any data-URL photos
  for (let i = 0; i < urls.length; i++) {
    if (urls[i] && urls[i].startsWith('data:')) {
      const u = await uploadPiecePhoto(currentUserId, piece.id, urls[i]);
      if (u) urls[i] = u;
    }
  }
  try {
    const { data, error } = await supabase.from('pieces').upsert({
      id: typeof piece.id === 'string' ? piece.id : undefined,
      user_id: currentUserId,
      name: piece.name,
      color: piece.color || null,
      category: piece.category,
      photo_urls: urls,
    }, { onConflict: 'id' }).select('id').maybeSingle();
    if (error) return null;
    return data && data.id;
  } catch (e) { return null; }
}

export async function pushPieceDelete(pieceId) {
  if (!currentUserId) return;
  try { await supabase.from('pieces').delete().eq('id', pieceId).eq('user_id', currentUserId); } catch (e) {}
}

export async function pushAchievement(achievementId) {
  if (!currentUserId) return;
  try {
    await supabase.from('achievements').upsert({
      user_id: currentUserId,
      achievement_id: achievementId,
    }, { onConflict: 'user_id,achievement_id' });
  } catch (e) {}
}

export async function pushWeeklyScore(week, score) {
  if (!currentUserId) return;
  try {
    await supabase.from('weekly_scores').upsert({
      user_id: currentUserId,
      week,
      score,
    }, { onConflict: 'user_id,week' });
  } catch (e) {}
}

export async function pushFitPieces(dateKey, pieceIds) {
  if (!currentUserId) return;
  try {
    // Replace junction rows for this date in one shot.
    await supabase.from('fit_pieces').delete().eq('user_id', currentUserId).eq('date', dateKey);
    if (pieceIds && pieceIds.length) {
      const rows = pieceIds.map(pid => ({ user_id: currentUserId, date: dateKey, piece_id: pid }));
      await supabase.from('fit_pieces').insert(rows);
    }
  } catch (e) {}
}

export async function pushNotificationSetting(key, enabled) {
  if (!currentUserId) return;
  try {
    await supabase.from('notification_settings').upsert({
      user_id: currentUserId,
      key,
      enabled,
    }, { onConflict: 'user_id,key' });
  } catch (e) {}
}

// On first sign-in, push anything we already have in localStorage so the
// guest data doesn't get lost.
async function pushAllPending(userId) {
  try {
    // Achievements
    const achs = JSON.parse(localStorage.getItem('aevum_achievements') || '[]');
    if (Array.isArray(achs) && achs.length) {
      const rows = achs.map(id => ({ user_id: userId, achievement_id: id }));
      await supabase.from('achievements').upsert(rows, { onConflict: 'user_id,achievement_id' });
    }
  } catch (e) {}
  try {
    // Weekly scores
    const scores = JSON.parse(localStorage.getItem('aevum_weekly_scores') || '[]');
    if (Array.isArray(scores) && scores.length) {
      const rows = scores.map(s => ({ user_id: userId, week: s.week, score: s.score }));
      await supabase.from('weekly_scores').upsert(rows, { onConflict: 'user_id,week' });
    }
  } catch (e) {}
  // Fits/pieces aren't auto-migrated to avoid uploading every base64 photo on
  // first sign-in. Future saves will be synced through pushFitSave / pushPieceSave.
}

// ─── Sign in / out ───────────────────────────────────────────────────────
export async function signInWithApple() {
  return supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
  });
}
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
  });
}
export async function signInWithEmail(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
  });
}
export async function signOut() {
  try { await supabase.auth.signOut(); } catch (e) {}
}
