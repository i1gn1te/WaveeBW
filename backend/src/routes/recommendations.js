"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const spotify_js_1 = require("../lib/spotify.js");
const mockData_js_1 = require("../lib/mockData.js");
const routeHelpers_js_1 = require("../lib/routeHelpers.js");
const router = (0, express_1.Router)();
// ---------------------------------------------------------------------------
// Similar tracks (replaces deprecated /recommendations?seed_tracks=)
// Uses related-artists + artist top tracks
// ---------------------------------------------------------------------------
router.get('/similar/:trackId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            return res.json((0, routeHelpers_js_1.shuffleArray)(mockData_js_1.mockTracks));
        }
        const { trackId } = req.params;
        const limit = clampLimit(req.query.limit);
        const tracks = await (0, spotify_js_1.findSimilarTracks)(req.spotifyAccessToken, trackId, limit);
        res.json(tracks);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get similar tracks');
    }
});
// ---------------------------------------------------------------------------
// Discover by genre (replaces deprecated /recommendations?seed_genres=)
// Uses search with genre: filter
// ---------------------------------------------------------------------------
router.get('/discover/:genre', auth_js_1.authMiddleware, async (req, res) => {
    try {
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            return res.json((0, routeHelpers_js_1.shuffleArray)(mockData_js_1.mockTracks));
        }
        const { genre } = req.params;
        const limit = clampLimit(req.query.limit);
        const tracks = await (0, spotify_js_1.discoverByGenre)(req.spotifyAccessToken, genre, limit);
        res.json(tracks);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to discover genre');
    }
});
// ---------------------------------------------------------------------------
function clampLimit(raw, fallback = 20) {
    if (!raw)
        return fallback;
    const n = parseInt(String(raw), 10);
    if (isNaN(n))
        return fallback;
    return Math.max(1, Math.min(100, n));
}
exports.default = router;
//# sourceMappingURL=recommendations.js.map