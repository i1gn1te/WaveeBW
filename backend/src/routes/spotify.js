"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const spotify_js_1 = require("../lib/spotify.js");
const mockData_js_1 = require("../lib/mockData.js");
const routeHelpers_js_1 = require("../lib/routeHelpers.js");
const router = (0, express_1.Router)();
// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
router.get('/search', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { q, limit } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query required' });
        }
        const parsedLimit = clampLimit(limit);
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            const query = q.toLowerCase();
            const results = mockData_js_1.mockTracks.filter((t) => t.name.toLowerCase().includes(query) ||
                t.artists.some((a) => a.name.toLowerCase().includes(query)));
            return res.json(results.length > 0 ? results : mockData_js_1.mockTracks);
        }
        if (!req.spotifyAccessToken) {
            return res.status(401).json({ error: 'No Spotify access token. Please log in again.' });
        }
        console.log(`[Search] q="${q}", limit=${parsedLimit}, tokenPrefix=${req.spotifyAccessToken.substring(0, 10)}...`);
        const tracks = await (0, spotify_js_1.searchTracks)(req.spotifyAccessToken, q, parsedLimit);
        res.json(tracks);
    }
    catch (error) {
        console.error('[Search] Spotify API error:', {
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
        });
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Search failed');
    }
});
// ---------------------------------------------------------------------------
// Track details (+ audio features)
// ---------------------------------------------------------------------------
router.get('/track/:trackId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { trackId } = req.params;
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            const track = mockData_js_1.mockTracks.find((t) => t.id === trackId) || mockData_js_1.mockTracks[0];
            const af = mockData_js_1.mockAudioFeatures[trackId] || mockData_js_1.mockAudioFeatures['1'];
            return res.json({
                ...track,
                audioFeatures: { ...af, keyName: (0, mockData_js_1.getKeyName)(af.key, af.mode) },
            });
        }
        const track = await (0, spotify_js_1.getTrack)(req.spotifyAccessToken, trackId);
        // Audio features may return null (restricted endpoint)
        const af = await (0, spotify_js_1.getAudioFeatures)(req.spotifyAccessToken, trackId);
        res.json({
            ...track,
            audioFeatures: af ? { ...af, keyName: (0, spotify_js_1.getKeyName)(af.key, af.mode) } : null,
        });
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get track');
    }
});
// ---------------------------------------------------------------------------
// Audio features only
// ---------------------------------------------------------------------------
router.get('/audio-features/:trackId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { trackId } = req.params;
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            const af = mockData_js_1.mockAudioFeatures[trackId] || mockData_js_1.mockAudioFeatures['1'];
            return res.json({ ...af, keyName: (0, mockData_js_1.getKeyName)(af.key, af.mode) });
        }
        const af = await (0, spotify_js_1.getAudioFeatures)(req.spotifyAccessToken, trackId);
        res.json(af ? { ...af, keyName: (0, spotify_js_1.getKeyName)(af.key, af.mode) } : null);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get audio features');
    }
});
// ---------------------------------------------------------------------------
// Top tracks / artists
// ---------------------------------------------------------------------------
router.get('/top/tracks', auth_js_1.authMiddleware, async (req, res) => {
    try {
        if ((0, routeHelpers_js_1.isDemoUser)(req))
            return res.json(mockData_js_1.mockTracks);
        const { timeRange = 'medium_term', limit } = req.query;
        const tracks = await (0, spotify_js_1.getTopTracks)(req.spotifyAccessToken, timeRange, clampLimit(limit));
        res.json(tracks);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get top tracks');
    }
});
router.get('/top/artists', auth_js_1.authMiddleware, async (req, res) => {
    try {
        if ((0, routeHelpers_js_1.isDemoUser)(req))
            return res.json(mockData_js_1.mockArtists);
        const { timeRange = 'medium_term', limit } = req.query;
        const artists = await (0, spotify_js_1.getTopArtists)(req.spotifyAccessToken, timeRange, clampLimit(limit));
        res.json(artists);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get top artists');
    }
});
// ---------------------------------------------------------------------------
// Genres (static list — old API endpoint was removed)
// ---------------------------------------------------------------------------
router.get('/genres', auth_js_1.authMiddleware, async (_req, res) => {
    res.json(spotify_js_1.GENRE_LIST);
});
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clampLimit(raw, min = 1, max = 50, fallback = 20) {
    if (!raw)
        return fallback;
    const n = parseInt(String(raw), 10);
    if (isNaN(n))
        return fallback;
    return Math.max(min, Math.min(max, n));
}
exports.default = router;
//# sourceMappingURL=spotify.js.map