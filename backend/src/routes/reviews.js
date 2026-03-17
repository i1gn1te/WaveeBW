"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_js_1 = require("../lib/prisma.js");
const auth_js_1 = require("../middleware/auth.js");
const spotify_js_1 = require("../lib/spotify.js");
const mockData_js_1 = require("../lib/mockData.js");
const zod_1 = require("zod");
const routeHelpers_js_1 = require("../lib/routeHelpers.js");
const router = (0, express_1.Router)();
const createReviewSchema = zod_1.z.object({
    trackId: zod_1.z.string(),
    rating: zod_1.z.number().min(0.5).max(5),
    content: zod_1.z.string().optional()
});

router.post('/', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const validation = createReviewSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        const { trackId, rating, content } = validation.data;
        let track;
        let audioFeatures;
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {

            track = mockData_js_1.mockTracks.find(t => t.id === trackId);
            if (!track) {

                track = {
                    name: `Track ${trackId}`,
                    artists: [{ name: 'Unknown Artist' }],
                    album: { name: 'Unknown Album', images: [] }
                };
            }
            audioFeatures = mockData_js_1.mockAudioFeatures[trackId] || {
                tempo: 120,
                key: 0,
                energy: 0.5,
                danceability: 0.5,
                valence: 0.5
            };
        }
        else {

            track = await (0, spotify_js_1.getTrack)(req.spotifyAccessToken, trackId);
            try {
                audioFeatures = await (0, spotify_js_1.getAudioFeatures)(req.spotifyAccessToken, trackId);
            }
            catch {
                
                audioFeatures = null;
            }

            if (!audioFeatures) {
                audioFeatures = { tempo: null, key: null, energy: null, danceability: null, valence: null };
            }
        }
        const review = await prisma_js_1.prisma.review.upsert({
            where: {
                userId_trackId: {
                    userId: req.userId,
                    trackId
                }
            },
            update: {
                rating,
                content,
                tempo: audioFeatures.tempo,
                key: audioFeatures.key,
                energy: audioFeatures.energy,
                danceability: audioFeatures.danceability,
                valence: audioFeatures.valence
            },
            create: {
                userId: req.userId,
                trackId,
                trackName: track.name,
                artistName: track.artists.map((a) => a.name).join(', '),
                albumName: track.album.name,
                albumArt: track.album.images[0]?.url,
                rating,
                content,
                tempo: audioFeatures.tempo,
                key: audioFeatures.key,
                energy: audioFeatures.energy,
                danceability: audioFeatures.danceability,
                valence: audioFeatures.valence
            }
        });
        res.json(review);
    }
    catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

router.get('/my', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { page = '1', limit = '20', sort = 'createdAt' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const reviews = await prisma_js_1.prisma.review.findMany({
            where: { userId: req.userId },
            orderBy: { [sort]: 'desc' },
            skip,
            take: parseInt(limit)
        });
        const total = await prisma_js_1.prisma.review.count({ where: { userId: req.userId } });
        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});

router.get('/track/:trackId', async (req, res) => {
    try {
        const { trackId } = req.params;
        const { page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const reviews = await prisma_js_1.prisma.review.findMany({
            where: { trackId },
            include: {
                user: {
                    select: { id: true, displayName: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        });
        const total = await prisma_js_1.prisma.review.count({ where: { trackId } });

        const avgRating = await prisma_js_1.prisma.review.aggregate({
            where: { trackId },
            _avg: { rating: true }
        });
        res.json({
            reviews,
            averageRating: avgRating._avg.rating || 0,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Get track reviews error:', error);
        res.status(500).json({ error: 'Failed to get track reviews' });
    }
});

router.get('/:reviewId', async (req, res) => {
    try {
        const review = await prisma_js_1.prisma.review.findUnique({
            where: { id: req.params.reviewId },
            include: {
                user: {
                    select: { id: true, displayName: true, avatarUrl: true }
                }
            }
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json(review);
    }
    catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({ error: 'Failed to get review' });
    }
});

router.delete('/:reviewId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const review = await prisma_js_1.prisma.review.findUnique({
            where: { id: req.params.reviewId }
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await prisma_js_1.prisma.review.delete({ where: { id: req.params.reviewId } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const reviews = await prisma_js_1.prisma.review.findMany({
            include: {
                user: {
                    select: { id: true, displayName: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ error: 'Failed to get feed' });
    }
});
exports.default = router;
