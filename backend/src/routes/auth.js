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
// Czy dane Spotify sa ustawione
const SPOTIFY_CONFIGURED = !!process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_ID !== 'your_spotify_client_id';
// Wspolne ustawienia cookie
const COOKIE_OPTS = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
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
    email: zod_1.z.string().email('NieprawidĹ‚owy email').max(120),
    password: zod_1.z.string().min(6, 'HasĹ‚o musi mieÄ‡ minimum 6 znakĂłw').max(72),
    displayName: zod_1.z.string().min(2, 'Nazwa uĹĽytkownika jest za krĂłtka').max(40).optional(),
});
// Rejestracja email/haslo
router.post('/register', async (req, res) => {
    try {
        const parsed = localAuthSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0]?.message || 'NieprawidĹ‚owe dane' });
        }
        const { email, password, displayName } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });
        if (existing) {
            return res.status(409).json({ error: 'Konto z tym emailem juĹĽ istnieje' });
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
        return res.status(500).json({ error: 'Rejestracja nie powiodĹ‚a siÄ™' });
    }
});
// Logowanie email/haslo
router.post('/local-login', async (req, res) => {
    try {
        const parsed = localAuthSchema.omit({ displayName: true }).safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0]?.message || 'NieprawidĹ‚owe dane logowania' });
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
            return res.status(401).json({ error: 'NieprawidĹ‚owy login lub hasĹ‚o' });
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
        return res.status(500).json({ error: 'Logowanie nie powiodĹ‚o siÄ™' });
    }
});
// Zwraca link logowania Spotify lub demo
router.get('/login', (_req, res) => {
    if (!SPOTIFY_CONFIGURED) {
        return res.json({
            url: null,
            demoMode: true,
            message: 'Spotify API nie skonfigurowany. UĹĽyj trybu demo.',
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
// Tworzy sesje demo
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
// Obsluga powrotu z autoryzacji Spotify
// Zapamietaj kody, zeby nie uzyc ich drugi raz
const processedCodes = new Set();

// Obsluga powrotu z autoryzacji Spotify
router.get('/callback', async (req, res) => {
    const { code, error } = req.query;
    
    // Ustal adres frontendu: najpierw referer, potem env
    let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (req.headers.referer) {
        try {
            const refererUrl = new URL(req.headers.referer);
            clientUrl = `${refererUrl.protocol}//${refererUrl.host}`;
        }
        catch (e) {
            console.warn('[Auth callback] Invalid referer header:', req.headers.referer);
        }
    }
    console.log('[Auth callback] Using CLIENT_URL:', clientUrl);
    
    if (error)
        return res.redirect(`${clientUrl}/login?error=${error}`);
    if (!code || typeof code !== 'string')
        return res.redirect(`${clientUrl}/login?error=no_code`);
    
    // Nie pozwalaj uzyc tego samego code ponownie
    if (processedCodes.has(code)) {
        console.error('[Auth callback] Code already processed (reuse attempt):', code.slice(0, 10));
        return res.redirect(`${clientUrl}/login?error=code_reused`);
    }
    processedCodes.add(code);
    // Usun stary code po 5 minutach
    setTimeout(() => processedCodes.delete(code), 5 * 60 * 1000);
    
    try {
        const secret = requireJwtSecret();
        console.log('[Auth callback] Exchanging code for tokens...');
        const tokens = await (0, spotify_js_1.getTokens)(code);
        console.log('[Auth callback] Got tokens, fetching user profile...');
        const profile = await (0, spotify_js_1.getUserProfile)(tokens.access_token);
        console.log('[Auth callback] Got Spotify profile:', profile.id, profile.email, profile.display_name);
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
        console.log('[Auth callback] Upserted user:', user.id);
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            spotifyAccessToken: tokens.access_token,
            spotifyRefreshToken: tokens.refresh_token,
        }, secret, { expiresIn: '7d' });
        console.log('[Auth callback] JWT token created, setting cookie and redirecting...');
        res.cookie('token', token, COOKIE_OPTS);
        console.log('[Auth callback] Redirecting to:', `${clientUrl}/dashboard`);
        res.redirect(`${clientUrl}/dashboard`);
    }
    catch (err) {
        console.error('[Auth callback] ERROR - Type:', err.constructor.name);
        console.error('[Auth callback] ERROR - Message:', err.message);
        if (err.response) {
            console.error('[Auth callback] ERROR - Status:', err.response.status);
            console.error('[Auth callback] ERROR - Data:', err.response.data);
        }
        if (err.code === 'P2002') {
            console.error('[Auth callback] ERROR - Prisma constraint violation:', err.meta);
        }
        res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
});
// Pobiera biezacego uzytkownika
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
// Odswieza token Spotify
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
// Wylogowanie
router.post('/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=auth.js.map
