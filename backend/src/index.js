"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const user_js_1 = __importDefault(require("./routes/user.js"));
const reviews_js_1 = __importDefault(require("./routes/reviews.js"));
const spotify_js_1 = __importDefault(require("./routes/spotify.js"));
const playlists_js_1 = __importDefault(require("./routes/playlists.js"));
const recommendations_js_1 = __importDefault(require("./routes/recommendations.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow specific origins
        const allowed = [
            process.env.CLIENT_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];
        // In development, also allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const isLocalNetwork = origin && (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
            /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:5173$/.test(origin));
        if (!origin || allowed.includes(origin) || isLocalNetwork) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/user', user_js_1.default);
app.use('/api/reviews', reviews_js_1.default);
app.use('/api/spotify', spotify_js_1.default);
app.use('/api/playlists', playlists_js_1.default);
app.use('/api/recommendations', recommendations_js_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'waveeProjectBW API is running 🎵' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 waveeProjectBW server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map