"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_js_1 = require("../lib/prisma.js");
const auth_js_1 = require("../middleware/auth.js");
const spotify_js_1 = require("../lib/spotify.js");
const zod_1 = require("zod");
const routeHelpers_js_1 = require("../lib/routeHelpers.js");
const router = (0, express_1.Router)();
const createPlaylistSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    trackIds: zod_1.z.array(zod_1.z.string()).optional(),
    isPublic: zod_1.z.boolean().optional()
});
// Tworzenie playlisty
router.post('/', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const validation = createPlaylistSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        const { name, description, isPublic = true } = validation.data;
        const playlist = await prisma_js_1.prisma.playlist.create({
            data: {
                name,
                description,
                isPublic,
                userId: req.userId
            }
        });
        res.json(playlist);
    }
    catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});
// Pobierz playlisty usera
router.get('/my', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const playlists = await prisma_js_1.prisma.playlist.findMany({
            where: { userId: req.userId },
            include: {
                tracks: {
                    orderBy: { position: 'asc' },
                    take: 4
                },
                _count: { select: { tracks: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(playlists);
    }
    catch (error) {
        console.error('Get playlists error:', error);
        res.status(500).json({ error: 'Failed to get playlists' });
    }
});
// Pobierz jedna playliste
router.get('/:playlistId', async (req, res) => {
    try {
        const playlist = await prisma_js_1.prisma.playlist.findUnique({
            where: { id: req.params.playlistId },
            include: {
                tracks: { orderBy: { position: 'asc' } },
                user: {
                    select: { id: true, displayName: true, avatarUrl: true }
                }
            }
        });
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.json(playlist);
    }
    catch (error) {
        console.error('Get playlist error:', error);
        res.status(500).json({ error: 'Failed to get playlist' });
    }
});
// Dodaj utwor do playlisty
router.post('/:playlistId/tracks', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { trackId, trackName, artistName, albumArt } = req.body;
        const playlist = await prisma_js_1.prisma.playlist.findUnique({
            where: { id: playlistId }
        });
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        if (playlist.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        // Pobierz ostatnia pozycje
        const lastTrack = await prisma_js_1.prisma.playlistTrack.findFirst({
            where: { playlistId },
            orderBy: { position: 'desc' }
        });
        const track = await prisma_js_1.prisma.playlistTrack.create({
            data: {
                playlistId,
                trackId,
                trackName,
                artistName,
                albumArt,
                position: (lastTrack?.position ?? -1) + 1
            }
        });
        res.json(track);
    }
    catch (error) {
        console.error('Add track error:', error);
        res.status(500).json({ error: 'Failed to add track' });
    }
});
// Usun utwor z playlisty
router.delete('/:playlistId/tracks/:trackId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { playlistId, trackId } = req.params;
        const playlist = await prisma_js_1.prisma.playlist.findUnique({
            where: { id: playlistId }
        });
        if (!playlist || playlist.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await prisma_js_1.prisma.playlistTrack.deleteMany({
            where: { playlistId, trackId }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Remove track error:', error);
        res.status(500).json({ error: 'Failed to remove track' });
    }
});
// Wyslij playliste do Spotify
router.post('/:playlistId/sync', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const playlist = await prisma_js_1.prisma.playlist.findUnique({
            where: { id: playlistId },
            include: { tracks: { orderBy: { position: 'asc' } } }
        });
        if (!playlist || playlist.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const user = await prisma_js_1.prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Utworz playliste w Spotify
        const spotifyPlaylist = await (0, spotify_js_1.createPlaylist)(req.spotifyAccessToken, user.spotifyId, playlist.name, playlist.description || undefined, playlist.isPublic);
        // Dodaj utwory do playlisty Spotify
        if (playlist.tracks.length > 0) {
            const trackUris = playlist.tracks.map((t) => `spotify:track:${t.trackId}`);
            await (0, spotify_js_1.addTracksToPlaylist)(req.spotifyAccessToken, spotifyPlaylist.id, trackUris);
        }
        // Zapisz Spotify ID w lokalnej playliscie
        await prisma_js_1.prisma.playlist.update({
            where: { id: playlistId },
            data: { spotifyPlaylistId: spotifyPlaylist.id }
        });
        res.json({
            success: true,
            spotifyPlaylistId: spotifyPlaylist.id,
            spotifyUrl: spotifyPlaylist.external_urls?.spotify
        });
    }
    catch (error) {
        console.error('Sync playlist error:', error);
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to sync playlist to Spotify');
    }
});
// Usun playliste
router.delete('/:playlistId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const playlist = await prisma_js_1.prisma.playlist.findUnique({
            where: { id: req.params.playlistId }
        });
        if (!playlist || playlist.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await prisma_js_1.prisma.playlist.delete({ where: { id: req.params.playlistId } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});
exports.default = router;
//# sourceMappingURL=playlists.js.map

