// src/services/oauth.service.ts – Handles OAuth flows for Zoom, Google Meet, Microsoft Teams
import { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';

// Environment variables should contain client IDs and secrets for each provider
// Helper to get config lazily
const getConfig = (provider: 'zoom' | 'google' | 'microsoft') => {
    const configs = {
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
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.readonly',
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
    return configs[provider];
};


import prisma from '../lib/prisma';

// Helper to build redirect URL for a provider
export const getAuthRedirect = (provider: 'zoom' | 'google' | 'microsoft', userId?: string): string => {
    const cfg = getConfig(provider);

    // Encode userId in state if provided
    const stateObj = { provider, userId };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');

    const params: any = {
        response_type: 'code',
        client_id: cfg.clientId,
        redirect_uri: cfg.redirectUri,
        state: state,
    };
    if (provider === 'google' || provider === 'microsoft') {
        params.scope = (cfg as any).scope;
        params.access_type = 'offline';
        params.prompt = 'consent';
    }
    console.log(`[OAuth ${new Date().toISOString()}] Generating URL for ${provider}. ClientID: ${cfg.clientId}, RedirectURI: ${cfg.redirectUri}`);
    return `${cfg.authUrl}?${querystring.stringify(params)}`;
};

// Exchange code for tokens – generic implementation
export const exchangeCode = async (provider: 'zoom' | 'google' | 'microsoft', code: string) => {
    const cfg = getConfig(provider);
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

export const refreshAccessToken = async (provider: 'zoom' | 'google' | 'microsoft', refreshToken: string) => {
    const cfg = getConfig(provider);
    const data: any = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
    };
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const response = await axios.post(cfg.tokenUrl, querystring.stringify(data), { headers });
    return response.data;
};

// Express handlers – can be wired in routes/integrations.routes.ts
export const oauthRedirectHandler = (req: Request, res: Response) => {
    console.log(`[OAuth] Received redirect request for ${req.params.provider}`);
    console.log(`[OAuth] Query params:`, req.query);

    try {
        const provider = req.params.provider as 'zoom' | 'google' | 'microsoft';
        const userId = req.query.userId as string;

        if (!userId) {
            console.error('[OAuth] Missing userId in request');
            return res.status(400).send('Missing userId');
        }

        const redirect = getAuthRedirect(provider, userId);
        console.log(`[OAuth] Redirecting to: ${redirect}`);
        res.redirect(redirect);
    } catch (error) {
        console.error('[OAuth] Error in redirect handler:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const oauthCallbackHandler = async (req: Request, res: Response) => {
    const { code, state } = req.query as any;

    try {
        // Decode state to get provider and userId
        let provider: 'zoom' | 'google' | 'microsoft';
        let userId: string | undefined;

        try {
            const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
            provider = decodedState.provider;
            userId = decodedState.userId;
        } catch (e) {
            // Fallback for old state format (just provider string)
            provider = req.params.provider as any || state;
        }

        if (!provider) {
            // Try to get provider from params if not in state (though state is standard)
            provider = req.params.provider as any;
        }

        const tokens = await exchangeCode(provider, code);

        if (userId && provider === 'google') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    googleAccessToken: tokens.access_token,
                    googleRefreshToken: tokens.refresh_token,
                }
            });
            console.log(`[OAuth] Stored Google tokens for user ${userId}`);
        }
        if (userId && provider === 'zoom') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    zoomAccessToken: tokens.access_token,
                    zoomRefreshToken: tokens.refresh_token,
                }
            });
            console.log(`[OAuth] Stored Zoom tokens for user ${userId}`);
        }

        // Redirect back to the client app
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/settings?status=success&provider=${provider}`);

    } catch (err) {
        console.error('OAuth callback error', err);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/settings?status=error&message=auth_failed`);
    }
};
