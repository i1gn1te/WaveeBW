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
// Stale
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
// Lista gatunkow, bo adres /recommendations/available-genre-seeds zostal usuniety.
// Ta lista zawiera najwazniejsze gatunki Spotify.
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
    'C', 'Câ™Ż/Dâ™­', 'D', 'Dâ™Ż/Eâ™­', 'E', 'F',
    'Fâ™Ż/Gâ™­', 'G', 'Gâ™Ż/Aâ™­', 'A', 'Aâ™Ż/Bâ™­', 'B',
];
// Funkcje pomocnicze
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
// Logowanie
function getAuthUrl(state) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId)
        throw new Error('SPOTIFY_CLIENT_ID not set');
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: getRedirectUri(),
        scope: SCOPES,
        show_dialog: 'true',
    });
    if (state)
        params.set('state', state);
    return `${ACCOUNTS}/authorize?${params}`;
}
async function getTokens(code) {
    const { data } = await axios_1.default.post(`${ACCOUNTS}/api/token`, new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: getRedirectUri(),
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
// Dane usera
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
// Utwory i wyszukiwanie
async function searchTracks(token, query, limit = 20) {
    // Najpierw bez limitu, bo API moglo sie zmienic
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
 * Pobiera cechy audio utworu.
 * Zwraca null, gdy endpoint jest zablokowany (403) albo brak wyniku (404).
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
// Odkrywanie muzyki zamiast starego /recommendations
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
 * Szuka utworow podobnych do podanego utworu.
 *
 * Jak to dziala:
 *   1. Bierze glownego artyste utworu.
 *   2. Pobiera podobnych artystow.
 *   3. Pobiera ich top utwory.
 *   4. Usuwa duplikaty, usuwa seed track i miesza wyniki.
 *
 * Gdy to sie nie uda, robi zwykle wyszukiwanie po nazwie artysty.
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
    // Wez do 4 losowych podobnych artystow i ich top utwory
    const picked = shuffle(relatedArtists).slice(0, 4);
    const trackLists = await Promise.all(picked.map((a) => getArtistTopTracks(token, a.id).catch(() => [])));
    // Polacz listy, usun duplikaty i utwor startowy, potem wymieszaj
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
 * Odkrywa utwory dla gatunku przez wyszukiwarke.
 * Zastepuje stare /recommendations?seed_genres=.
 */
async function discoverByGenre(token, genre, limit = 20) {
    const results = await searchTracks(token, `genre:${genre}`, 50);
    return shuffle(results).slice(0, limit);
}
// Playlisty
async function createPlaylist(token, userId, name, description, isPublic = true) {
    const { data } = await axios_1.default.post(`${API}/users/${userId}/playlists`, { name, description, public: isPublic }, { headers: authHeader(token) });
    return data;
}
async function addTracksToPlaylist(token, playlistId, trackUris) {
    const { data } = await axios_1.default.post(`${API}/playlists/${playlistId}/tracks`, { uris: trackUris }, { headers: authHeader(token) });
    return data;
}
// Narzedzia
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
//# sourceMappingURL=spotify.js.map
