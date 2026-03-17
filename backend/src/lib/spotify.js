"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEY_NAMES = exports.GENRE_LIST = void 0;
exports.getRedirectUri = getRedirectUri;
exports.getKeyName = getKeyName;
exports.getAuthUrl = getAuthUrl;
exports.getTokens = getTokens;
exports.refreshAccessToken = refreshAccessToken;
exports.getUserProfile = getUserProfile;
exports.getTopTracks = getTopTracks;
exports.getTopArtists = getTopArtists;
exports.searchTracks = searchTracks;
exports.getTrack = getTrack;
exports.getAudioFeatures = getAudioFeatures;
exports.getRelatedArtists = getRelatedArtists;
exports.getArtistTopTracks = getArtistTopTracks;
exports.findSimilarTracks = findSimilarTracks;
exports.discoverByGenre = discoverByGenre;
exports.createPlaylist = createPlaylist;
exports.addTracksToPlaylist = addTracksToPlaylist;
exports.shuffle = shuffle;
const axios_1 = __importDefault(require("axios"));
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const API = 'https://api.spotify.com/v1';
const ACCOUNTS = 'https://accounts.spotify.com';
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-library-read',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
].join(' ');
// Genre list — the /recommendations/available-genre-seeds endpoint was removed
// by Spotify in late 2024. This curated list covers the main Spotify categories.
exports.GENRE_LIST = [
    'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient',
    'blues', 'bossanova', 'classical', 'club', 'country',
    'dance', 'disco', 'drum-and-bass', 'dubstep', 'edm',
    'electronic', 'folk', 'funk', 'garage', 'gospel',
    'grunge', 'hard-rock', 'hardcore', 'hip-hop', 'house',
    'indie', 'indie-pop', 'jazz', 'k-pop', 'latin',
    'metal', 'minimal-techno', 'mpb', 'new-wave', 'opera',
    'piano', 'pop', 'progressive-house', 'punk', 'punk-rock',
    'r-n-b', 'reggae', 'reggaeton', 'rock', 'ska',
    'soul', 'synth-pop', 'techno', 'trance', 'trip-hop',
];
exports.KEY_NAMES = [
    'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F',
    'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B',
];
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function authHeader(token) {
    return { Authorization: `Bearer ${token}` };
}
function basicAuth() {
    const id = process.env.SPOTIFY_CLIENT_ID;
    const secret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!id || !secret)
        throw new Error('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set');
    return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
}
function getRedirectUri() {
    const uri = process.env.SPOTIFY_REDIRECT_URI?.trim();
    if (!uri)
        throw new Error('SPOTIFY_REDIRECT_URI not configured');
    return uri;
}
function getKeyName(key, mode) {
    if (key < 0 || key > 11)
        return 'Unknown';
    return `${exports.KEY_NAMES[key]} ${mode === 1 ? 'Major' : 'Minor'}`;
}
function isStatus(err, status) {
    return axios_1.default.isAxiosError(err) && err.response?.status === status;
}
// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
function getAuthUrl(state, redirectUriOverride) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId)
        throw new Error('SPOTIFY_CLIENT_ID not set');
    const redirectUri = redirectUriOverride || getRedirectUri();
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: SCOPES,
        show_dialog: 'true',
    });
    if (state)
        params.set('state', state);
    return `${ACCOUNTS}/authorize?${params}`;
}
async function getTokens(code, redirectUriOverride) {
    const redirectUri = redirectUriOverride || getRedirectUri();
    const { data } = await axios_1.default.post(`${ACCOUNTS}/api/token`, new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
    }).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: basicAuth(),
        },
    });
    return data;
}
async function refreshAccessToken(refreshToken) {
    const { data } = await axios_1.default.post(`${ACCOUNTS}/api/token`, new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: basicAuth(),
        },
    });
    return data;
}
// ---------------------------------------------------------------------------
// User data
// ---------------------------------------------------------------------------
async function getUserProfile(token) {
    const { data } = await axios_1.default.get(`${API}/me`, {
        headers: authHeader(token),
    });
    return data;
}
async function getTopTracks(token, timeRange = 'medium_term', limit = 20) {
    const { data } = await axios_1.default.get(`${API}/me/top/tracks`, {
        headers: authHeader(token),
        params: { time_range: timeRange },
    });
    return (data.items ?? []).slice(0, limit);
}
async function getTopArtists(token, timeRange = 'medium_term', limit = 20) {
    const { data } = await axios_1.default.get(`${API}/me/top/artists`, {
        headers: authHeader(token),
        params: { time_range: timeRange },
    });
    return (data.items ?? []).slice(0, limit);
}
// ---------------------------------------------------------------------------
// Tracks & Search
// ---------------------------------------------------------------------------
async function searchTracks(token, query, limit = 20) {
    // Try without limit first (Spotify API may have changed)
    const url = `${API}/search`;
    console.log('[Spotify searchTracks] Trying search for:', query);
    try {
        const { data } = await axios_1.default.get(url, {
            headers: authHeader(token),
            params: { q: query, type: 'track' },
        });
        console.log('[Spotify searchTracks] Success, got', data.tracks?.items?.length, 'tracks');
        return (data.tracks?.items ?? []).slice(0, limit);
    }
    catch (err) {
        console.error('[Spotify searchTracks] FAILED:', err.response?.status, JSON.stringify(err.response?.data));
        console.error('[Spotify searchTracks] Full request URL:', err.config?.url);
        console.error('[Spotify searchTracks] Params:', JSON.stringify(err.config?.params));
        throw err;
    }
}
async function getTrack(token, trackId) {
    const { data } = await axios_1.default.get(`${API}/tracks/${trackId}`, {
        headers: authHeader(token),
    });
    return data;
}
/**
 * Get audio features for a track.
 * Returns null if the endpoint is restricted (403) or not found (404).
 * Spotify restricted this endpoint in late 2024 for newer apps.
 */
async function getAudioFeatures(token, trackId) {
    try {
        const { data } = await axios_1.default.get(`${API}/audio-features/${trackId}`, {
            headers: authHeader(token),
        });
        return data;
    }
    catch (err) {
        if (isStatus(err, 403) || isStatus(err, 404))
            return null;
        throw err;
    }
}
// ---------------------------------------------------------------------------
// Discovery — replacements for deprecated /recommendations endpoint
// ---------------------------------------------------------------------------
async function getRelatedArtists(token, artistId) {
    const { data } = await axios_1.default.get(`${API}/artists/${artistId}/related-artists`, {
        headers: authHeader(token),
    });
    return data.artists;
}
async function getArtistTopTracks(token, artistId, market = 'US') {
    const { data } = await axios_1.default.get(`${API}/artists/${artistId}/top-tracks`, {
        headers: authHeader(token),
        params: { market },
    });
    return data.tracks;
}
/**
 * Find tracks similar to a given track.
 *
 * Strategy (since /recommendations was deprecated):
 *   1. Look up the track's primary artist.
 *   2. Get related artists via /artists/{id}/related-artists.
 *   3. Fetch top tracks from a sample of those related artists.
 *   4. De-duplicate, exclude the seed track, shuffle and trim.
 *
 * Falls back to a name-based search if related artists fail.
 */
async function findSimilarTracks(token, trackId, limit = 20) {
    const track = await getTrack(token, trackId);
    const artistId = track.artists[0]?.id;
    if (!artistId)
        return [];
    let relatedArtists = [];
    try {
        relatedArtists = await getRelatedArtists(token, artistId);
    }
    catch {
        return searchTracks(token, track.artists[0].name, limit);
    }
    if (relatedArtists.length === 0) {
        return searchTracks(token, track.artists[0].name, limit);
    }
    // Pick up to 4 random related artists and get their top tracks
    const picked = shuffle(relatedArtists).slice(0, 4);
    const trackLists = await Promise.all(picked.map((a) => getArtistTopTracks(token, a.id).catch(() => [])));
    // Flatten, deduplicate, exclude seed track, shuffle
    const seen = new Set([trackId]);
    const pool = [];
    for (const list of trackLists) {
        for (const t of list) {
            if (!seen.has(t.id)) {
                seen.add(t.id);
                pool.push(t);
            }
        }
    }
    return shuffle(pool).slice(0, limit);
}
/**
 * Discover tracks for a given genre using search.
 * Replaces the deprecated /recommendations?seed_genres= endpoint.
 */
async function discoverByGenre(token, genre, limit = 20) {
    const results = await searchTracks(token, `genre:${genre}`, 50);
    return shuffle(results).slice(0, limit);
}
// ---------------------------------------------------------------------------
// Playlists
// ---------------------------------------------------------------------------
async function createPlaylist(token, userId, name, description, isPublic = true) {
    const { data } = await axios_1.default.post(`${API}/users/${userId}/playlists`, { name, description, public: isPublic }, { headers: authHeader(token) });
    return data;
}
async function addTracksToPlaylist(token, playlistId, trackUris) {
    const { data } = await axios_1.default.post(`${API}/playlists/${playlistId}/tracks`, { uris: trackUris }, { headers: authHeader(token) });
    return data;
}
// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
//# sourceMappingURL=spotify.js.map