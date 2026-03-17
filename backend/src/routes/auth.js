"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const prisma_js_1 = require("../lib/prisma.js");
const spotify_js_1 = require("../lib/spotify.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Whether Spotify credentials are configured
const SPOTIFY_CONFIGURED = !!process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_ID !== 'your_spotify_client_id';
// Shared cookie options
const COOKIE_OPTS = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
function requireJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    return secret;
}
function hashPassword(password) {
    const salt = crypto_1.default.randomBytes(16).toString('hex');
    const hash = crypto_1.default.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key)
        return false;
    const hashToVerify = crypto_1.default.scryptSync(password, salt, 64).toString('hex');
    return crypto_1.default.timingSafeEqual(Buffer.from(hashToVerify, 'hex'), Buffer.from(key, 'hex'));
}
const localAuthSchema = zod_1.z.object({
    email: zod_1.z.string().email('Nieprawidłowy email').max(120),
    password: zod_1.z.string().min(6, 'Hasło musi mieć minimum 6 znaków').max(72),
    displayName: zod_1.z.string().min(2, 'Nazwa użytkownika jest za krótka').max(40).optional(),
});
// ---------------------------------------------------------------------------
// POST /register — local email/password registration
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        const parsed = localAuthSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Nieprawidłowe dane' });
        }
        const { email, password, displayName } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });
        if (existing) {
            return res.status(409).json({ error: 'Konto z tym emailem już istnieje' });
        }
        const user = await prisma_js_1.prisma.user.create({
            data: {
                spotifyId: `local_${crypto_1.default.randomUUID()}`,
                email: normalizedEmail,
                displayName: displayName?.trim() || normalizedEmail.split('@')[0],
                passwordHash: hashPassword(password),
                favoriteGenres: [],
            },
        });
        const secret = requireJwtSecret();
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            spotifyAccessToken: 'demo_token',
            spotifyRefreshToken: 'demo_refresh',
        }, secret, { expiresIn: '7d' });
        res.cookie('token', token, COOKIE_OPTS);
        return res.status(201).json({ success: true, user: { id: user.id, email: user.email, displayName: user.displayName } });
    }
    catch (error) {
        console.error('Local register error:', error);
        return res.status(500).json({ error: 'Rejestracja nie powiodła się' });
    }
});
// ---------------------------------------------------------------------------
// POST /local-login — local email/password login
// ---------------------------------------------------------------------------
router.post('/local-login', async (req, res) => {
    try {
        const parsed = localAuthSchema.omit({ displayName: true }).safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Nieprawidłowe dane logowania' });
        }
        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                email: true,
                displayName: true,
                passwordHash: true,
            },
        });
        if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });
        }
        const secret = requireJwtSecret();
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            spotifyAccessToken: 'demo_token',
            spotifyRefreshToken: 'demo_refresh',
        }, secret, { expiresIn: '7d' });
        res.cookie('token', token, COOKIE_OPTS);
        return res.json({ success: true, user: { id: user.id, email: user.email, displayName: user.displayName } });
    }
    catch (error) {
        console.error('Local login error:', error);
        return res.status(500).json({ error: 'Logowanie nie powiodło się' });
    }
});
// ---------------------------------------------------------------------------
// GET /login — return Spotify auth URL (or demoMode flag)
// ---------------------------------------------------------------------------
router.get('/login', (_req, res) => {
    if (!SPOTIFY_CONFIGURED) {
        return res.json({
            url: null,
            demoMode: true,
            message: 'Spotify API nie skonfigurowany. Użyj trybu demo.',
        });
    }
    try {
        const url = (0, spotify_js_1.getAuthUrl)();
        res.json({ url, demoMode: false });
    }
    catch (error) {
        console.error('Failed to build auth URL:', error);
        res.status(500).json({ error: 'Failed to generate login URL' });
    }
});
// ---------------------------------------------------------------------------
// POST /demo-login — create demo session (always available)
// ---------------------------------------------------------------------------
router.post('/demo-login', async (_req, res) => {
    try {
        const secret = requireJwtSecret();
        res.clearCookie('token');
        const user = await prisma_js_1.prisma.user.upsert({
            where: { spotifyId: 'demo_user' },
            update: {},
            create: {
                spotifyId: 'demo_user',
                email: 'demo@waveeProjectBW.app',
                displayName: 'Demo User',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=waveeProjectBW',
                country: 'PL',
                favoriteGenres: ['pop', 'rock', 'electronic'],
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, spotifyAccessToken: 'demo_token', spotifyRefreshToken: 'demo_refresh' }, secret, { expiresIn: '7d' });
        res.cookie('token', token, COOKIE_OPTS);
        res.json({ success: true, message: 'Demo login successful' });
    }
    catch (error) {
        console.error('Demo login error:', error);
        res.status(500).json({ error: 'Demo login failed' });
    }
});
// ---------------------------------------------------------------------------
// GET /callback — Spotify OAuth callback
// ---------------------------------------------------------------------------
router.get('/callback', async (req, res) => {
    const { code, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (error)
        return res.redirect(`${clientUrl}/login?error=${error}`);
    if (!code || typeof code !== 'string')
        return res.redirect(`${clientUrl}/login?error=no_code`);
    try {
        const secret = requireJwtSecret();
        const tokens = await (0, spotify_js_1.getTokens)(code);
        const profile = await (0, spotify_js_1.getUserProfile)(tokens.access_token);
        const user = await prisma_js_1.prisma.user.upsert({
            where: { spotifyId: profile.id },
            update: {
                email: profile.email,
                displayName: profile.display_name,
                avatarUrl: profile.images?.[0]?.url,
                country: profile.country,
            },
            create: {
                spotifyId: profile.id,
                email: profile.email,
                displayName: profile.display_name,
                avatarUrl: profile.images?.[0]?.url,
                country: profile.country,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            spotifyAccessToken: tokens.access_token,
            spotifyRefreshToken: tokens.refresh_token,
        }, secret, { expiresIn: '7d' });
        res.cookie('token', token, COOKIE_OPTS);
        res.redirect(`${clientUrl}/dashboard`);
    }
    catch (err) {
        console.error('Auth callback error:', err);
        res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
});
// ---------------------------------------------------------------------------
// GET /me — get current user
// ---------------------------------------------------------------------------
router.get('/me', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.userId },
            include: { _count: { select: { reviews: true, playlists: true } } },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});
// ---------------------------------------------------------------------------
// POST /refresh — refresh Spotify token
// ---------------------------------------------------------------------------
router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(401).json({ error: 'Authentication required' });
        const secret = requireJwtSecret();
        const decoded = jsonwebtoken_1.default.verify(token, secret, { ignoreExpiration: true });
        if (!decoded.userId)
            return res.status(401).json({ error: 'Invalid token' });
        if (!decoded.spotifyRefreshToken || decoded.spotifyRefreshToken === 'demo_refresh') {
            return res.status(400).json({ error: 'No refresh token available' });
        }
        const tokens = await (0, spotify_js_1.refreshAccessToken)(decoded.spotifyRefreshToken);
        const newToken = jsonwebtoken_1.default.sign({
            userId: decoded.userId,
            spotifyAccessToken: tokens.access_token,
            spotifyRefreshToken: tokens.refresh_token || decoded.spotifyRefreshToken,
        }, secret, { expiresIn: '7d' });
        res.cookie('token', newToken, COOKIE_OPTS);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});
// ---------------------------------------------------------------------------
// POST /logout
// ---------------------------------------------------------------------------
router.post('/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=auth.js.map