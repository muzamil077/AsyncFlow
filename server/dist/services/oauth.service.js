"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthCallbackHandler = exports.oauthRedirectHandler = exports.exchangeCode = exports.getAuthRedirect = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
// Environment variables should contain client IDs and secrets for each provider
const config = {
    zoom: {
        clientId: process.env.ZOOM_CLIENT_ID || '',
        clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
        redirectUri: process.env.ZOOM_REDIRECT_URI || 'http://localhost:4000/api/integrations/oauth/zoom/callback',
        authUrl: 'https://zoom.us/oauth/authorize',
        tokenUrl: 'https://zoom.us/oauth/token',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/integrations/oauth/google/callback',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
    },
    microsoft: {
        clientId: process.env.MS_CLIENT_ID || '',
        clientSecret: process.env.MS_CLIENT_SECRET || '',
        redirectUri: process.env.MS_REDIRECT_URI || 'http://localhost:4000/api/integrations/oauth/microsoft/callback',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        scope: 'https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read',
    },
};
// Helper to build redirect URL for a provider
const getAuthRedirect = (provider) => {
    const cfg = config[provider];
    const params = {
        response_type: 'code',
        client_id: cfg.clientId,
        redirect_uri: cfg.redirectUri,
        state: provider,
    };
    if (provider === 'google' || provider === 'microsoft') {
        params.scope = cfg.scope;
        params.access_type = 'offline';
        params.prompt = 'consent';
    }
    return `${cfg.authUrl}?${querystring_1.default.stringify(params)}`;
};
exports.getAuthRedirect = getAuthRedirect;
// Exchange code for tokens – generic implementation
const exchangeCode = async (provider, code) => {
    const cfg = config[provider];
    const data = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: cfg.redirectUri,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
    };
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const response = await axios_1.default.post(cfg.tokenUrl, querystring_1.default.stringify(data), { headers });
    return response.data; // contains access_token, refresh_token, expires_in, etc.
};
exports.exchangeCode = exchangeCode;
// Express handlers – can be wired in routes/integrations.routes.ts
const oauthRedirectHandler = (req, res) => {
    const provider = req.params.provider;
    const redirect = (0, exports.getAuthRedirect)(provider);
    res.redirect(redirect);
};
exports.oauthRedirectHandler = oauthRedirectHandler;
const oauthCallbackHandler = async (req, res) => {
    const provider = req.params.provider;
    const { code, state } = req.query;
    try {
        const tokens = await (0, exports.exchangeCode)(provider, code);
        // TODO: Store tokens securely linked to the project/user in DB (e.g., a new Integration table)
        res.json({ provider, tokens });
    }
    catch (err) {
        console.error('OAuth callback error', err);
        res.status(500).json({ error: 'OAuth exchange failed' });
    }
};
exports.oauthCallbackHandler = oauthCallbackHandler;
