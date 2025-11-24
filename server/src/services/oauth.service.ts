// src/services/oauth.service.ts – Handles OAuth flows for Zoom, Google Meet, Microsoft Teams
import { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';

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
export const getAuthRedirect = (provider: 'zoom' | 'google' | 'microsoft'): string => {
    const cfg = config[provider];
    const params: any = {
        response_type: 'code',
        client_id: cfg.clientId,
        redirect_uri: cfg.redirectUri,
        state: provider,
    };
    if (provider === 'google' || provider === 'microsoft') {
        params.scope = (cfg as any).scope;
        params.access_type = 'offline';
        params.prompt = 'consent';
    }
    return `${cfg.authUrl}?${querystring.stringify(params)}`;
};

// Exchange code for tokens – generic implementation
export const exchangeCode = async (provider: 'zoom' | 'google' | 'microsoft', code: string) => {
    const cfg = config[provider];
    const data: any = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: cfg.redirectUri,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
    };
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const response = await axios.post(cfg.tokenUrl, querystring.stringify(data), { headers });
    return response.data; // contains access_token, refresh_token, expires_in, etc.
};

// Express handlers – can be wired in routes/integrations.routes.ts
export const oauthRedirectHandler = (req: Request, res: Response) => {
    const provider = req.params.provider as 'zoom' | 'google' | 'microsoft';
    const redirect = getAuthRedirect(provider);
    res.redirect(redirect);
};

export const oauthCallbackHandler = async (req: Request, res: Response) => {
    const provider = req.params.provider as 'zoom' | 'google' | 'microsoft';
    const { code, state } = req.query as any;
    try {
        const tokens = await exchangeCode(provider, code);
        // TODO: Store tokens securely linked to the project/user in DB (e.g., a new Integration table)
        res.json({ provider, tokens });
    } catch (err) {
        console.error('OAuth callback error', err);
        res.status(500).json({ error: 'OAuth exchange failed' });
    }
};
