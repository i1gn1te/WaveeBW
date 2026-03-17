"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_js_1 = require("../lib/prisma.js");
const auth_js_1 = require("../middleware/auth.js");
const routeHelpers_js_1 = require("../lib/routeHelpers.js");
const router = (0, express_1.Router)();
// Get user profile
router.get('/profile', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                playlists: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                _count: {
                    select: { reviews: true, playlists: true, likedTracks: true }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});
// Update favorite genres
router.put('/genres', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { genres } = req.body;
        if (!Array.isArray(genres)) {
            return res.status(400).json({ error: 'Genres must be an array' });
        }
        const user = await prisma_js_1.prisma.user.update({
            where: { id: req.userId },
            data: { favoriteGenres: genres }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update genres error:', error);
        res.status(500).json({ error: 'Failed to update genres' });
    }
});
// Update user profile (bio, displayName, genres)
router.put('/profile', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { bio, displayName, favoriteGenres } = req.body;
        const updateData = {};
        if (bio !== undefined)
            updateData.bio = bio;
        if (displayName !== undefined)
            updateData.displayName = displayName;
        if (favoriteGenres !== undefined && Array.isArray(favoriteGenres)) {
            updateData.favoriteGenres = favoriteGenres;
        }
        const user = await prisma_js_1.prisma.user.update({
            where: { id: req.userId },
            data: updateData
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// Get user's review stats
router.get('/stats', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const reviews = await prisma_js_1.prisma.review.findMany({
            where: { userId: req.userId }
        });
        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0,
            ratingDistribution: {
                '5': reviews.filter((r) => r.rating >= 4.5).length,
                '4': reviews.filter((r) => r.rating >= 3.5 && r.rating < 4.5).length,
                '3': reviews.filter((r) => r.rating >= 2.5 && r.rating < 3.5).length,
                '2': reviews.filter((r) => r.rating >= 1.5 && r.rating < 2.5).length,
                '1': reviews.filter((r) => r.rating < 1.5).length
            }
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

router.get('/search', auth_js_1.authMiddleware, async (req, res) => {
    try {
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            return res.status(403).json({ error: 'Funkcja dostępna tylko przy logowaniu przez Spotify' });
        }
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        if (q.length < 2) {
            return res.json([]);
        }
        const users = await prisma_js_1.prisma.user.findMany({
            where: {
                id: { not: req.userId },
                NOT: [
                    { spotifyId: 'demo_user' },
                    { spotifyId: { startsWith: 'demo_' } },
                ],
                OR: [
                    { displayName: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                _count: {
                    select: { reviews: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
        return res.json(users);
    }
    catch (error) {
        console.error('Search users error:', error);
        return res.status(500).json({ error: 'Failed to search users' });
    }
});
// Get public user profile
router.get('/:userId', async (req, res) => {
    try {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.params.userId },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                favoriteGenres: true,
                createdAt: true,
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                _count: {
                    select: { reviews: true, playlists: true }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map